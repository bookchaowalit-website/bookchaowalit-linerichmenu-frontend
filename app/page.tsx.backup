'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RichMenu, RichMenuArea, LINE_RICH_MENU_SIZES, RichMenuSize } from '@/lib/types';
import { RichMenuEditor } from '@/components/editor/RichMenuEditor';
import { TEMPLATES } from '@/lib/richMenuTemplates';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchMenus, createMenu, deleteMenu, updateMenu } from '@/store/menusSlice';
import { openEditorWithMenu, closeEditor, setLocalMenu } from '@/store/editorSlice';
import { Plus, Edit, Trash2, Database, Layout, Loader2, AlertCircle } from 'lucide-react';

export default function Home() {
  // Redux hooks (menus + editor)
  const dispatch = useAppDispatch();
  const menus = useAppSelector((s) => s.menus.menus);
  const loading = useAppSelector((s) => s.menus.loading);
  const error = useAppSelector((s) => s.menus.error);
  const editorState = useAppSelector((s) => s.editor);

  const [dbInitialized, setDbInitialized] = useState<boolean | null>(null);
  const [initializingDb, setInitializingDb] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<number | null>(null);
  const [newMenuDialogOpen, setNewMenuDialogOpen] = useState(false);
  const [newMenuName, setNewMenuName] = useState('');
  const [newMenuSize, setNewMenuSize] = useState<RichMenuSize>('small');
  const [newMenuTemplate, setNewMenuTemplate] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    checkDatabaseStatus();
    dispatch(fetchMenus());
  }, [dispatch]);

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/init');
      const data = await response.json();
      setDbInitialized(data.initialized);
    } catch (err) {
      console.error('Error checking database status:', err);
      setDbInitialized(false);
    }
  };

  const initializeDatabase = async () => {
    setInitializingDb(true);
    try {
      const response = await fetch('/api/init', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok) {
        setDbInitialized(true);
        showNotification('success', 'Database initialized successfully!');
        dispatch(fetchMenus());
      } else {
        showNotification('error', data.error || 'Failed to initialize database');
      }
    } catch (err) {
      console.error('Error initializing database:', err);
      showNotification('error', 'Failed to initialize database');
    } finally {
      setInitializingDb(false);
    }
  };

  const handleCreateNewMenu = async () => {
    if (!newMenuName.trim()) {
      showNotification('error', 'Please enter a menu name');
      return;
    }

    try {
      const size = LINE_RICH_MENU_SIZES[newMenuSize];
      const created = await dispatch(createMenu({ name: newMenuName, width: size.width, height: size.height })).unwrap();

      showNotification('success', 'Menu created successfully!');
      setNewMenuName('');
      setNewMenuSize('small');
      setNewMenuTemplate(null);
      setNewMenuDialogOpen(false);

      // If a template is selected: apply it (scale to created menu) and try to auto-save
      if (newMenuTemplate) {
        const tpl = TEMPLATES[newMenuTemplate];
        const tplWidth = tpl.width || created.width;
        const tplHeight = tpl.height || created.height;
        const scaleX = created.width / tplWidth;
        const scaleY = created.height / tplHeight;

        const menuWithAreas = {
          ...created,
          areas: tpl.areas.map((a, i) => ({
            ...a,
            x: Math.round(a.x * scaleX),
            y: Math.round(a.y * scaleY),
            width: Math.round(a.width * scaleX),
            height: Math.round(a.height * scaleY),
            order_index: i,
            rich_menu_id: created.id,
          })) as RichMenuArea[],
        } as RichMenu;

        try {
          await dispatch(updateMenu(menuWithAreas)).unwrap();
          // Auto-save succeeded
          showNotification('success', 'Template applied and saved automatically.');
          dispatch(fetchMenus());
          return; // done
        } catch (err: any) {
          // Auto-save failed — open editor with template pre-applied
          showNotification('error', err.message || 'Failed to auto-save template. You can save manually in the editor.');
          dispatch(openEditorWithMenu(menuWithAreas));
          return;
        }
      }

      // No template: refresh list and open editor for manual editing
      dispatch(fetchMenus());
      dispatch(openEditorWithMenu(created));
    } catch (err: any) {
      console.error('Error creating menu:', err);
      showNotification('error', err.message || 'Failed to create menu');
    }
  };

  const handleEditMenu = (menu: RichMenu) => {
    dispatch(openEditorWithMenu(menu));
  };

  const handleDeleteMenu = async () => {
    if (menuToDelete === null) return;

    try {
      await dispatch(deleteMenu(menuToDelete)).unwrap();
      showNotification('success', 'Menu deleted successfully!');
      setDeleteDialogOpen(false);
      setMenuToDelete(null);
      dispatch(fetchMenus());
    } catch (err: any) {
      console.error('Error deleting menu:', err);
      showNotification('error', err.message || 'Failed to delete menu');
    }
  };

  const handleSaveMenu = async (menu: RichMenu) => {
    try {
      await dispatch(updateMenu(menu)).unwrap();
      showNotification('success', 'Menu saved successfully!');
      dispatch(closeEditor(undefined as any));
      dispatch(fetchMenus());
    } catch (err: any) {
      console.error('Error saving menu:', err);
      showNotification('error', err.message || 'Failed to save menu');
    }
  };

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const getAreaCount = (menu: RichMenu): number => {
    return menu.areas?.length || 0;
  };

  const getSizeLabel = (width: number, height: number): string => {
    const size = Object.values(LINE_RICH_MENU_SIZES).find(
      (s) => s.width === width && s.height === height
    );
    return size ? size.name : `${width} x ${height}`;
  };

  if (editorState.showEditor) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4">
          <RichMenuEditor
            menu={editorState.localMenu}
            onSave={handleSaveMenu}
            onCancel={() => {
              dispatch(closeEditor(undefined as any));
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Notification */}
      {notification && (
        <div
          className={`fixed top-4 right-4 p-4 rounded-lg shadow-lg z-50 ${
            notification.type === 'success'
              ? 'bg-green-500 text-white'
              : 'bg-red-500 text-white'
          }`}
        >
          {notification.message}
        </div>
      )}

      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-2">
              <Layout className="h-10 w-10" />
              LINE Rich Menu Maker
            </h1>
            <p className="text-muted-foreground mt-2">
              Create, edit, and manage your LINE rich menus with ease
            </p>
          </div>
          <div className="flex gap-2">
            {!dbInitialized && (
              <Button
                variant="outline"
                onClick={initializeDatabase}
                disabled={initializingDb}
              >
                {initializingDb ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Database className="mr-2 h-4 w-4" />
                    Initialize Database
                  </>
                )}
              </Button>
            )}
            <Button onClick={() => setNewMenuDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              New Menu
            </Button>
          </div>
        </div>

        {/* Database Status Warning */}
        {!dbInitialized && (
          <Card className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                    Database Not Initialized
                  </h3>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                    The database has not been initialized yet. Click the "Initialize Database" button to set up the required tables.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error Message */}
        {error && (
          <Card className="mb-6 border-red-500 bg-red-50 dark:bg-red-950">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-red-900 dark:text-red-100">
                    Error
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-200 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        )}

        {/* Menus Grid */}
        {!loading && dbInitialized && menus.length === 0 && (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <Layout className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No rich menus yet</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first rich menu to get started
                </p>
                <Button onClick={() => setNewMenuDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Menu
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {!loading && dbInitialized && menus.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {menus.map((menu) => (
              <Card key={menu.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="truncate">{menu.name}</span>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleEditMenu(menu)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => {
                          setMenuToDelete(menu.id!);
                          setDeleteDialogOpen(true);
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                  <CardDescription>
                    {getSizeLabel(menu.width, menu.height)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Areas:</span>
                      <span className="font-medium">{getAreaCount(menu)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Size:</span>
                      <span className="font-medium">{menu.width} × {menu.height}px</span>
                    </div>
                    {menu.updated_at && (
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Last updated:</span>
                        <span className="font-medium">
                          {new Date(menu.updated_at).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                  <Button
                    className="w-full mt-4"
                    onClick={() => handleEditMenu(menu)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Menu
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* New Menu Dialog */}
      <Dialog open={newMenuDialogOpen} onOpenChange={setNewMenuDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Rich Menu</DialogTitle>
            <DialogDescription>
              Configure the basic settings for your new rich menu
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="menuName">Menu Name</Label>
              <Input
                id="menuName"
                value={newMenuName}
                onChange={(e) => setNewMenuName(e.target.value)}
                placeholder="My Rich Menu"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="menuSize">Menu Size</Label>
              <select
                id="menuSize"
                value={newMenuSize}
                onChange={(e) => setNewMenuSize(e.target.value as RichMenuSize)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {Object.entries(LINE_RICH_MENU_SIZES).map(([key, size]) => (
                  <option key={key} value={key}>
                    {size.name} ({size.width} × {size.height})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="menuTemplate">Template</Label>
              <select
                id="menuTemplate"
                value={newMenuTemplate || ''}
                onChange={(e) => setNewMenuTemplate(e.target.value || null)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="">(none)</option>
                {Object.keys(TEMPLATES).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
              </select>
              <div className="text-xs text-muted-foreground">Optionally apply a template to pre-populate areas in the editor</div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewMenuDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateNewMenu}>
              Create Menu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Rich Menu</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this rich menu? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteMenu}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
