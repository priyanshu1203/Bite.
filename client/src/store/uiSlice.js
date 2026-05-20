import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  isOffline: !navigator.onLine,
  sidebarOpen: false,
  theme: localStorage.getItem('theme') || 'dark',
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
      // Toggle class on document element
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
  },
});

export const { setOfflineStatus, toggleSidebar, setSidebarOpen, toggleTheme } = uiSlice.actions;
export default uiSlice.reducer;
