import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RichMenu, RichMenuArea } from '@/lib/types';
import { TEMPLATES } from '@/lib/richMenuTemplates';
import { updateMenu as updateMenuThunk } from './menusSlice';

interface EditorState {
  localMenu?: RichMenu;
  showEditor: boolean;
  selectedArea: number | null;
  previewMode: boolean;
  selectedTemplate: string | null;
}

const initialState: EditorState = {
  localMenu: undefined,
  showEditor: false,
  selectedArea: null,
  previewMode: false,
  selectedTemplate: null,
};

export const saveMenu = createAsyncThunk<RichMenu, RichMenu, { rejectValue: string }>(
  'editor/saveMenu',
  async (menu: RichMenu, thunkAPI: any) => {
    try {
      const res = await fetch(`/api/menus/${menu.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menu),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save menu');
      // Update menus slice
      thunkAPI.dispatch(updateMenuThunk(data.menu));
      return data.menu as RichMenu;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || 'Failed to save menu');
    }
  }
);

const editorSlice = createSlice<EditorState>({
  name: 'editor',
  initialState,
  reducers: {
    openEditorWithMenu(state: EditorState, action: PayloadAction<RichMenu | undefined>) {
      state.localMenu = action.payload;
      state.showEditor = true;
      state.selectedArea = null;
    },
    closeEditor(state: EditorState) {
      state.showEditor = false;
      state.localMenu = undefined;
      state.selectedArea = null;
      state.selectedTemplate = null;
    },
    setLocalMenu(state: EditorState, action: PayloadAction<RichMenu>) {
      state.localMenu = action.payload;
    },
    updateLocalMenuField(state: EditorState, action: PayloadAction<Partial<RichMenu>>) {
      state.localMenu = { ...state.localMenu, ...(action.payload as any) } as RichMenu;
    },
    setSelectedArea(state: EditorState, action: PayloadAction<number | null>) {
      state.selectedArea = action.payload;
    },
    setPreviewMode(state: EditorState, action: PayloadAction<boolean>) {
      state.previewMode = action.payload;
    },
    setSelectedTemplate(state: EditorState, action: PayloadAction<string | null>) {
      state.selectedTemplate = action.payload;
    },
    applyTemplateToLocalMenu(state: EditorState, action: PayloadAction<string>) {
      const tplKey = action.payload;
      const tpl = TEMPLATES[tplKey];
      if (!tpl || !state.localMenu) return;
      const tplWidth = tpl.width || state.localMenu.width;
      const tplHeight = tpl.height || state.localMenu.height;
      const scaleX = state.localMenu.width / tplWidth;
      const scaleY = state.localMenu.height / tplHeight;

      state.localMenu = {
        ...state.localMenu,
        areas: tpl.areas.map((a: RichMenuArea, i: number) => ({
          ...a,
          x: Math.round(a.x * scaleX),
          y: Math.round(a.y * scaleY),
          width: Math.round(a.width * scaleX),
          height: Math.round(a.height * scaleY),
          order_index: i,
        })) as RichMenuArea[],
      } as RichMenu;
    },
    addAreaToLocalMenu(state: EditorState, action: PayloadAction<RichMenuArea>) {
      state.localMenu = { ...state.localMenu!, areas: [...(state.localMenu?.areas || []), action.payload] } as RichMenu;
    },
    updateAreaInLocalMenu(state: EditorState, action: PayloadAction<{ index: number; area: Partial<RichMenuArea> }>) {
      const { index, area } = action.payload;
      if (!state.localMenu || !state.localMenu.areas) return;
      const updated = state.localMenu.areas.map((a: RichMenuArea, i: number) => (i === index ? ({ ...a, ...area } as RichMenuArea) : a));
      state.localMenu = { ...state.localMenu, areas: updated } as RichMenu;
    },
    deleteAreaFromLocalMenu(state: EditorState, action: PayloadAction<number>) {
      if (!state.localMenu || !state.localMenu.areas) return;
      state.localMenu = { ...state.localMenu, areas: state.localMenu.areas.filter((_: any, i: number) => i !== action.payload) } as RichMenu;
    },
  },
});

export const {
  openEditorWithMenu,
  closeEditor,
  setLocalMenu,
  updateLocalMenuField,
  setSelectedArea,
  setPreviewMode,
  setSelectedTemplate,
  applyTemplateToLocalMenu,
  addAreaToLocalMenu,
  updateAreaInLocalMenu,
  deleteAreaFromLocalMenu,
} = editorSlice.actions;

export default editorSlice.reducer;
