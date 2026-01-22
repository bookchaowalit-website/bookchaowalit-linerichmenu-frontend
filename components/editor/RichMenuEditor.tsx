'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RichMenu, RichMenuArea, ActionData, MessageActionData, PostbackActionData, UriActionData, LINE_RICH_MENU_SIZES, RichMenuSize } from '@/lib/types';
import { TEMPLATES } from '@/lib/richMenuTemplates';
import { useAppDispatch } from '@/store/hooks';
import { setLocalMenu as setLocalMenuAction } from '@/store/editorSlice';
import { Plus, Save, Trash2, Download, Eye, Edit, Square } from 'lucide-react';
import html2canvas from 'html2canvas';

interface RichMenuEditorProps {
  menu?: RichMenu;
  onSave?: (menu: RichMenu) => void;
  onCancel?: () => void;
}

export function RichMenuEditor({ menu, onSave, onCancel }: RichMenuEditorProps) {
  const [selectedArea, setSelectedArea] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [draggedArea, setDraggedArea] = useState<number | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  // Track whether the area was moved during a pointer drag to avoid opening edit dialog after dragging
  const [areaWasMoved, setAreaWasMoved] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'png' | 'jpeg'>('png');
  const canvasRef = useRef<HTMLDivElement>(null);

  const dispatch = useAppDispatch();

  const [localMenu, setLocalMenu] = useState<RichMenu>(
    menu || {
      id: undefined,
      name: 'New Menu',
      width: LINE_RICH_MENU_SIZES.small.width,
      height: LINE_RICH_MENU_SIZES.small.height,
      areas: [],
    }
  );

  const [newArea, setNewArea] = useState<Partial<RichMenuArea>>({
    action_type: 'message',
    action_data: { type: 'message', text: '' } as MessageActionData,
    // default font for new areas
    font_family: 'Inter',
  });

  const [areaDialogOpen, setAreaDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<number | null>(null);

  // Update local menu and store when menu prop changes
  useEffect(() => {
    if (menu) {
      setLocalMenu(menu);
      // keep the global editor state in sync
      dispatch(setLocalMenuAction(menu));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [menu]);

  // Sync local menu changes back to editor store so other parts of the app stay consistent
  useEffect(() => {
    if (localMenu) {
      dispatch(setLocalMenuAction(localMenu));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localMenu]);

  const handleSave = () => {
    if (onSave) {
      onSave(localMenu);
    }
  };

  const handleAddArea = () => {
    if (editingArea !== null) {
      // Update existing area
      const updatedAreas = localMenu.areas?.map((area, index) =>
        index === editingArea ? { ...area, ...newArea } as RichMenuArea : area
      );
      setLocalMenu({ ...localMenu, areas: updatedAreas });
      setEditingArea(null);
    } else {
      // Add new area
      const area: RichMenuArea = {
        id: undefined,
        rich_menu_id: localMenu.id,
        x: 0,
        y: 0,
        width: 200,
        height: 100,
        action_type: newArea.action_type as RichMenuArea['action_type'],
        action_data: newArea.action_data as ActionData,
        bg_color: (newArea as any).bg_color,
        bg_opacity: (newArea as any).bg_opacity ?? 0.2,
        border_color: (newArea as any).border_color,
        font_family: (newArea as any).font_family || 'Inter',
        order_index: (localMenu.areas?.length || 0),
      };
      setLocalMenu({
        ...localMenu,
        areas: [...(localMenu.areas || []), area],
      });
    }
    setAreaDialogOpen(false);
    setNewArea({
      action_type: 'message',
      action_data: { type: 'message', text: '' },
      bg_color: undefined,
    } as any);
  };

  const handleDeleteArea = (index: number) => {
    const updatedAreas = localMenu.areas?.filter((_, i) => i !== index);
    setLocalMenu({ ...localMenu, areas: updatedAreas });
    if (selectedArea === index) {
      setSelectedArea(null);
    }
  };

  const handleEditArea = (index: number) => {
    const area = localMenu.areas?.[index];
    if (area) {
      // Populate color and opacity fields so the dialog shows current values when editing
      setNewArea({
        action_type: area.action_type,
        action_data: area.action_data,
        bg_color: (area as any).bg_color,
        border_color: (area as any).border_color,
        bg_opacity: (area as any).bg_opacity ?? 0.2,
        font_family: (area as any).font_family || 'Inter',
      } as any);
      setEditingArea(index);
      setAreaDialogOpen(true);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if clicking on existing area
    const clickedAreaIndex = localMenu.areas?.findIndex(
      (area) =>
        x >= area.x &&
        x <= area.x + area.width &&
        y >= area.y &&
        y <= area.y + area.height
    );

    if (typeof clickedAreaIndex === 'number' && clickedAreaIndex !== -1 && localMenu.areas) {
      // Start dragging existing area
      const area = localMenu.areas[clickedAreaIndex];
      setDraggedArea(clickedAreaIndex);
      setDragOffset({ x: x - area.x, y: y - area.y });
      setSelectedArea(clickedAreaIndex);
      // Reset move flag for this potential drag operation
      setAreaWasMoved(false);
    } else {
      // Start drawing new area
      setIsDrawing(true);
      setStartPos({ x, y });
      setSelectedArea(null);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing && draggedArea === null) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (isDrawing) {
      // Update new area dimensions
      const newAreaData: Partial<RichMenuArea> = {
        x: Math.min(startPos.x, x),
        y: Math.min(startPos.y, y),
        width: Math.abs(x - startPos.x),
        height: Math.abs(y - startPos.y),
        action_type: 'message',
        action_data: { type: 'message', text: '' },
      };
      setNewArea(newAreaData);
    } else if (draggedArea !== null) {
      // Update dragged area position
      setAreaWasMoved(true);
      const updatedAreas = localMenu.areas?.map((area, index) =>
        index === draggedArea
          ? {
              ...area,
              x: Math.max(0, Math.min(x - dragOffset.x, localMenu.width - area.width)),
              y: Math.max(0, Math.min(y - dragOffset.y, localMenu.height - area.height)),
            }
          : area
      );
      setLocalMenu({ ...localMenu, areas: updatedAreas });
    }
  };

  const handleMouseUp = () => {
    if (isDrawing) {
      // Finalize new area
      if (newArea.width && newArea.width > 10 && newArea.height && newArea.height > 10) {
        const area: RichMenuArea = {
          id: undefined,
          rich_menu_id: localMenu.id,
          x: newArea.x || 0,
          y: newArea.y || 0,
          width: newArea.width || 100,
          height: newArea.height || 50,
          action_type: newArea.action_type as RichMenuArea['action_type'],
          action_data: newArea.action_data as ActionData,
          order_index: (localMenu.areas?.length || 0),
        };
        setLocalMenu({
          ...localMenu,
          areas: [...(localMenu.areas || []), area],
        });
        setSelectedArea((localMenu.areas?.length || 0));
      }
      setIsDrawing(false);
      setNewArea({
        action_type: 'message',
        action_data: { type: 'message', text: '' },
      });
    }
    setDraggedArea(null);
  };

  const handleExport = async () => {
    if (!canvasRef.current) return;

    try {
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
      });

      const link = document.createElement('a');
      link.download = `${localMenu.name.replace(/\s+/g, '_')}.${exportFormat}`;
      link.href = canvas.toDataURL(`image/${exportFormat}`, 0.9);
      link.click();

      setExportDialogOpen(false);
    } catch (error) {
      console.error('Error exporting rich menu:', error);
    }
  };

  const handleSizeChange = (sizeKey: string) => {
    const size = LINE_RICH_MENU_SIZES[sizeKey as RichMenuSize];
    setLocalMenu({
      ...localMenu,
      width: size.width,
      height: size.height,
    });
  };

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const applyTemplate = (key?: string) => {
    const tplKey = key || selectedTemplate;
    if (!tplKey) return;
    const tpl = TEMPLATES[tplKey];
    if (!tpl) return;

    if (localMenu.areas && localMenu.areas.length > 0) {
      if (!confirm('Applying a template will replace existing areas. Continue?')) return;
    }

    // Scale template areas to current menu size instead of overwriting width/height
    const tplWidth = tpl.width || localMenu.width;
    const tplHeight = tpl.height || localMenu.height;
    const scaleX = localMenu.width / tplWidth;
    const scaleY = localMenu.height / tplHeight;

    setLocalMenu({
      ...localMenu,
      // keep existing menu width/height selected by user
      width: localMenu.width,
      height: localMenu.height,
      areas: tpl.areas.map((a, i) => ({
        ...a,
        x: Math.round(a.x * scaleX),
        y: Math.round(a.y * scaleY),
        width: Math.round(a.width * scaleX),
        height: Math.round(a.height * scaleY),
        order_index: i,
      })),
    });

    setSelectedArea(null);
  };

  const updateActionData = (field: string, value: string) => {
    setNewArea({
      ...newArea,
      action_data: {
        ...newArea.action_data,
        [field]: value,
      } as ActionData,
    });
  };

  const getActionLabel = (action: ActionData): string => {
    switch (action.type) {
      case 'message':
        // Show only the message text (no 'Message:' prefix)
        return (action as MessageActionData).text || '';
      case 'postback':
        // Prefer a short displayText if available, otherwise show data
        return (action as PostbackActionData).displayText || (action as PostbackActionData).text || (action as PostbackActionData).data || '';
      case 'uri':
        // Show the URI or empty string to avoid labeling it as 'URI:' in the area
        return (action as UriActionData).uri || '';
      default:
        // For other action types, return an empty string to avoid UI clutter
        return '';
    }
  };

  const scale = 0.3; // Scale factor for preview

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Rich Menu Editor</h2>
          <p className="text-muted-foreground">
            Create and customize your LINE rich menu by adding interactive areas
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            Save Menu
          </Button>
        </div>
      </div>

      {/* Menu Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Menu Settings</CardTitle>
          <CardDescription>Configure the basic properties of your rich menu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="menuName">Menu Name</Label>
              <Input
                id="menuName"
                value={localMenu.name}
                onChange={(e) => setLocalMenu({ ...localMenu, name: e.target.value })}
                placeholder="My Rich Menu"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menuSize">Menu Size</Label>
              <Select value={Object.keys(LINE_RICH_MENU_SIZES).find(
                (key) => LINE_RICH_MENU_SIZES[key as RichMenuSize].width === localMenu.width &&
                         LINE_RICH_MENU_SIZES[key as RichMenuSize].height === localMenu.height
              )} onValueChange={handleSizeChange}>
                <SelectTrigger id="menuSize">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LINE_RICH_MENU_SIZES).map(([key, size]) => (
                    <SelectItem key={key} value={key}>
                      {size.name} ({size.width} x {size.height})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            Current size: {localMenu.width} x {localMenu.height} pixels
          </div>

          <div className="space-y-2 mt-4">
            <Label>Templates</Label>
            <div className="flex items-center gap-2">
              <Select value={selectedTemplate || ''} onValueChange={(value: string) => setSelectedTemplate(value || null)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(TEMPLATES).map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={() => applyTemplate()} disabled={!selectedTemplate}>
                Apply Template
              </Button>
            </div>
            <div className="text-xs text-muted-foreground">Apply a template to populate areas automatically</div>
          </div>
        </CardContent>
      </Card>

      {/* Canvas Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Menu Canvas</CardTitle>
                  <CardDescription>
                    Click and drag to create areas. Click and drag existing areas to move them.
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewMode(!previewMode)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {previewMode ? 'Edit Mode' : 'Preview Mode'}
                  </Button>
                  <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Export
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Export Rich Menu</DialogTitle>
                        <DialogDescription>
                          Choose the format for your exported image
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label>Format</Label>
                          <Select value={exportFormat} onValueChange={(value: 'png' | 'jpeg') => setExportFormat(value)}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="png">PNG (recommended)</SelectItem>
                              <SelectItem value="jpeg">JPEG</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleExport}>
                          Download {exportFormat.toUpperCase()}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center bg-muted p-8 rounded-lg">
                <div
                  ref={canvasRef}
                  className="relative bg-white shadow-lg"
                  style={{
                    width: localMenu.width * scale,
                    height: localMenu.height * scale,
                    cursor: previewMode ? 'default' : 'crosshair',
                  }}
                  onMouseDown={previewMode ? undefined : handleMouseDown}
                  onMouseMove={previewMode ? undefined : handleMouseMove}
                  onMouseUp={previewMode ? undefined : handleMouseUp}
                  onMouseLeave={previewMode ? undefined : handleMouseUp}
                >
                  {/* Areas */}
                  {localMenu.areas?.map((area, index) => (
                    <div
                      key={index}
                      className={`absolute border-2 cursor-move flex items-center justify-center overflow-hidden`}
                      style={{
                        left: area.x * scale,
                        top: area.y * scale,
                        width: area.width * scale,
                        height: area.height * scale,
                        borderColor: (area as any).border_color || undefined,
                        boxShadow: selectedArea === index ? '0 0 0 3px rgba(59,130,246,0.35)' : undefined,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!previewMode) {
                          setSelectedArea(index);
                          // Only open the edit dialog if the area wasn't moved via drag
                          if (!areaWasMoved) {
                            handleEditArea(index);
                          }
                          // reset the move flag
                          setAreaWasMoved(false);
                        }
                      }}
                    >
                      <span className="relative text-xs text-center px-1 line-clamp-2 z-20" style={{ fontFamily: (area as any).font_family || undefined }}>
                        {getActionLabel(area.action_data)}
                      </span>
                      {/* apply bg color if provided */}
                      <div
                        className="absolute inset-0 z-0"
                        style={{ backgroundColor: (area as any).bg_color || undefined, opacity: (area as any).bg_opacity ?? 0.2 }}
                      />
                      {!previewMode && selectedArea === index && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-0 right-0 h-6 w-6 p-0 z-30"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditArea(index);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  ))}

                  {/* New area being drawn */}
                  {isDrawing && newArea.x !== undefined && newArea.y !== undefined && (
                    <div
                      className="absolute border-2 border-dashed border-primary bg-primary/10"
                      style={{
                        left: newArea.x * scale,
                        top: newArea.y * scale,
                        width: newArea.width ? newArea.width * scale : 0,
                        height: newArea.height ? newArea.height * scale : 0,
                      }}
                    />
                  )}

                </div>
              </div>

              {/* Legend */}
              <div className="mt-3 flex gap-3 flex-wrap">
                {localMenu.areas?.map((area, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs">
                    <div className="w-5 h-5 rounded" style={{ backgroundColor: (area as any).bg_color || '#eee', border: `2px solid ${(area as any).border_color || '#ddd'}`, opacity: (area as any).bg_opacity ?? 0.2 }} />
                    <div>Area {i + 1}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Areas Panel */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Areas</CardTitle>
              <CardDescription>
                Manage interactive areas on your menu
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Dialog open={areaDialogOpen} onOpenChange={setAreaDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full" variant="outline">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Area
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>
                        {editingArea !== null ? 'Edit Area' : 'Add New Area'}
                      </DialogTitle>
                      <DialogDescription>
                        Configure the action for this area
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Action Type</Label>
                        <Select
                          value={newArea.action_type}
                          onValueChange={(value: RichMenuArea['action_type']) =>
                            setNewArea({ ...newArea, action_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="message">Message</SelectItem>
                            <SelectItem value="postback">Postback</SelectItem>
                            <SelectItem value="uri">URI</SelectItem>
                            <SelectItem value="datetimepicker">Datetime Picker</SelectItem>
                            <SelectItem value="camera">Camera</SelectItem>
                            <SelectItem value="cameraroll">Camera Roll</SelectItem>
                            <SelectItem value="location">Location</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {newArea.action_type === 'message' && (
                        <div className="space-y-2">
                          <Label>Message Text</Label>
                          <Input
                            value={(newArea.action_data as MessageActionData).text || ''}
                            onChange={(e) => updateActionData('text', e.target.value)}
                            placeholder="Enter message text"
                          />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-2">
                          <Label>Background Color</Label>
                          <input
                            type="color"
                            value={(newArea as any).bg_color || '#ffffff'}
                            onChange={(e) => setNewArea({ ...newArea, bg_color: e.target.value })}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                          />
                          <div className="text-xs text-muted-foreground">Pick a background color for this area</div>
                        </div>
                        <div className="space-y-2">
                          <Label>Border Color</Label>
                          <input
                            type="color"
                            value={(newArea as any).border_color || '#000000'}
                            onChange={(e) => setNewArea({ ...newArea, border_color: e.target.value })}
                            className="h-10 w-full rounded-md border border-input bg-background px-3 py-2"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Font Family</Label>
                          <Select value={(newArea as any).font_family || 'Inter'} onValueChange={(value: string) => setNewArea({ ...newArea, font_family: value })}>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Inter">Inter</SelectItem>
                              <SelectItem value="Arial">Arial</SelectItem>
                              <SelectItem value="Roboto">Roboto</SelectItem>
                              <SelectItem value="Georgia">Georgia</SelectItem>
                              <SelectItem value="Courier New">Courier New</SelectItem>
                              <SelectItem value="Noto Sans">Noto Sans</SelectItem>
                            </SelectContent>
                          </Select>
                          <div className="text-xs text-muted-foreground">Choose a font for the area label</div>
                        </div>
                      </div>

                      <div className="space-y-2 mt-2">
                        <Label>Background Opacity</Label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.05"
                          value={(newArea as any).bg_opacity ?? 0.2}
                          onChange={(e) => setNewArea({ ...newArea, bg_opacity: parseFloat(e.target.value) })}
                          className="w-full"
                        />
                        <div className="text-xs text-muted-foreground">Opacity: {(newArea as any).bg_opacity ?? 0.2}</div>
                      </div>

                      {newArea.action_type === 'postback' && (
                        <div className="space-y-2">
                          <Label>Postback Data</Label>
                          <Input
                            value={(newArea.action_data as PostbackActionData).data || ''}
                            onChange={(e) => updateActionData('data', e.target.value)}
                            placeholder="Enter postback data"
                          />
                          <Label>Display Text (optional)</Label>
                          <Input
                            value={(newArea.action_data as PostbackActionData).displayText || ''}
                            onChange={(e) => updateActionData('displayText', e.target.value)}
                            placeholder="Enter display text"
                          />
                        </div>
                      )}

                      {newArea.action_type === 'uri' && (
                        <div className="space-y-2">
                          <Label>URI</Label>
                          <Input
                            value={(newArea.action_data as UriActionData).uri || ''}
                            onChange={(e) => updateActionData('uri', e.target.value)}
                            placeholder="https://example.com"
                          />
                        </div>
                      )}

                      {newArea.action_type === 'datetimepicker' && (
                        <div className="space-y-2">
                          <Label>Mode</Label>
                          <Select
                            value={(newArea.action_data as any).mode || 'date'}
                            onValueChange={(value) => updateActionData('mode', value)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="date">Date</SelectItem>
                              <SelectItem value="time">Time</SelectItem>
                              <SelectItem value="datetime">Date & Time</SelectItem>
                            </SelectContent>
                          </Select>
                          <Label>Data</Label>
                          <Input
                            value={(newArea.action_data as any).data || ''}
                            onChange={(e) => updateActionData('data', e.target.value)}
                            placeholder="Enter data"
                          />
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button onClick={handleAddArea}>
                        {editingArea !== null ? 'Update' : 'Add'} Area
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {localMenu.areas?.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <Square className="mx-auto h-12 w-12 mb-2 opacity-20" />
                      <p className="text-sm">No areas yet. Click and drag on the canvas to create one.</p>
                    </div>
                  ) : (
                    localMenu.areas?.map((area, index) => (
                      <div
                        key={index}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedArea === index
                            ? 'bg-primary/10 border-primary'
                            : 'hover:bg-muted'
                        }`}
                        onClick={() => setSelectedArea(index)}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              Area {index + 1}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {area.x}, {area.y} · {area.width} × {area.height}
                            </div>
                            <div className="text-xs text-muted-foreground truncate mt-1">
                              {getActionLabel(area.action_data)}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteArea(index);
                            }}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
