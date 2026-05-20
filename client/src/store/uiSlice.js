import { createSlice } from '@reduxjs/toolkit';

export const applyTheme = (theme) => {
  if (typeof document === 'undefined') return;

  const normalizedTheme = theme === 'light' ? 'light' : 'dark';
  document.documentElement.dataset.theme = normalizedTheme;
  document.documentElement.classList.toggle('dark', normalizedTheme === 'dark');
  document.documentElement.classList.toggle('light', normalizedTheme === 'light');
};

const getStoredTheme = () => {
  if (typeof localStorage === 'undefined') return 'dark';
  return localStorage.getItem('theme') || 'dark';
};

const initialState = {
  isOffline: !navigator.onLine,
  sidebarOpen: false,
  theme: getStoredTheme(),
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setOfflineStatus: (state, action) => {
      state.isOffline = action.payload;
    },
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.sidebarOpen = action.payload;
    },
    toggleTheme: (state) => {
      const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
      state.theme = nextTheme;
      localStorage.setItem('theme', nextTheme);
      applyTheme(nextTheme);
    },
  },
});

export const { setOfflineStatus, toggleSidebar, setSidebarOpen, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;
