import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import mealReducer from './mealSlice';
import waterReducer from './waterSlice';
import uiReducer from './uiSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    meals: mealReducer,
    water: waterReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // Turn off for files/FormData handling
    }),
});

export default store;
