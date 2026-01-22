import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RichMenu } from '@/lib/types';

interface MenusState {
  menus: RichMenu[];
  loading: boolean;
  error: string | null;
}

const initialState: MenusState = {
  menus: [],
  loading: false,
  error: null,
};

export const fetchMenus = createAsyncThunk<RichMenu[], void, { rejectValue: string }>('menus/fetchMenus', async (_: void, thunkAPI: any) => {
  try {
    const res = await fetch('/api/menus');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to fetch menus');
    return data.menus as RichMenu[];
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || 'Failed to fetch menus');
  }
});

export const createMenu = createAsyncThunk<RichMenu, { name: string; width: number; height: number }, { rejectValue: string }>(
  'menus/createMenu',
  async (payload: { name: string; width: number; height: number }, thunkAPI: any) => {
    try {
      const res = await fetch('/api/menus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create menu');
      return data.menu as RichMenu;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || 'Failed to create menu');
    }
  }
);

export const updateMenu = createAsyncThunk<RichMenu, RichMenu, { rejectValue: string }>(
  'menus/updateMenu',
  async (menu: RichMenu, thunkAPI: any) => {
    try {
      const res = await fetch(`/api/menus/${menu.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(menu),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update menu');
      return data.menu as RichMenu;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message || 'Failed to update menu');
    }
  }
);

export const deleteMenu = createAsyncThunk<number, number, { rejectValue: string }>('menus/deleteMenu', async (id: number, thunkAPI: any) => {
  try {
    const res = await fetch(`/api/menus/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.error || 'Failed to delete menu');
    }
    return id;
  } catch (err: any) {
    return thunkAPI.rejectWithValue(err.message || 'Failed to delete menu');
  }
});

const menusSlice = createSlice<MenusState>({
  name: 'menus',
  initialState,
  reducers: {},
  extraReducers: (builder: any) => {
    builder
      .addCase(fetchMenus.pending, (state: MenusState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMenus.fulfilled, (state: MenusState, action: PayloadAction<RichMenu[]>) => {
        state.loading = false;
        state.menus = action.payload;
      })
      .addCase(fetchMenus.rejected, (state: MenusState, action: any) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(createMenu.pending, (state: MenusState) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMenu.fulfilled, (state: MenusState, action: PayloadAction<RichMenu>) => {
        state.loading = false;
        state.menus.push(action.payload);
      })
      .addCase(createMenu.rejected, (state: MenusState, action: any) => {
        state.loading = false;
        state.error = action.payload || action.error.message;
      })

      .addCase(updateMenu.fulfilled, (state: MenusState, action: PayloadAction<RichMenu>) => {
        const idx = state.menus.findIndex((m: RichMenu) => m.id === action.payload.id);
        if (idx !== -1) state.menus[idx] = action.payload;
      })

      .addCase(deleteMenu.fulfilled, (state: MenusState, action: PayloadAction<number>) => {
        state.menus = state.menus.filter((m: RichMenu) => m.id !== action.payload);
      });
  },
});

export default menusSlice.reducer;
