import { configureStore } from '@reduxjs/toolkit';
import menusReducer from './menusSlice';
import editorReducer from './editorSlice';

export const store = configureStore({
  reducer: {
    menus: menusReducer,
    editor: editorReducer,
  },
});

// inferred types
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
