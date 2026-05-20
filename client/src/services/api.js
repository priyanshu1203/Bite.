import axios from 'axios';
import { localStorageFallback } from './localStorageFallback';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper to broadcast network status changes
const setOfflineStatus = (isOffline) => {
  window.dispatchEvent(
    new CustomEvent('app-network-status', {
      detail: { isOffline },
    })
  );
};

// Response Interceptor: Catch offline states and run local storage fallback
api.interceptors.response.use(
  (response) => {
    // If request succeeded, we are online
    setOfflineStatus(false);
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const isNetworkError = !error.response || error.response.status >= 502;
    const isBrowserOffline = !navigator.onLine;

    // If it's a network disconnection or server-down event
    if (isNetworkError || isBrowserOffline) {
      setOfflineStatus(true);
      console.warn('Network issue or offline mode detected. Servicing request from Local Storage...');

      const { url, method, data, params } = originalRequest;
      
      // --- INTERCEPT WRITES AND READS Gracefully ---
      
      // 1. Profile Retrieval
      if (url.includes('/profile') && method === 'get') {
        const profile = localStorageFallback.getProfile();
        return { data: profile, status: 200, statusText: 'OK', headers: {}, config: originalRequest };
      }

      // 2. Profile Update
      if (url.includes('/profile/update') && method === 'put') {
        const payload = JSON.parse(data);
        const updated = localStorageFallback.updateProfile(payload);
        return { data: updated, status: 200, statusText: 'OK', headers: {}, config: originalRequest };
      }

      // 3. Today's Meals
      if (url.includes('/meals/today') && method === 'get') {
        const offset = params?.timezoneOffset || 0;
        const meals = localStorageFallback.getTodayMeals(offset);
        return { data: meals, status: 200, statusText: 'OK', headers: {}, config: originalRequest };
      }

      // 4. Meal History
      if (url.includes('/meals/history') && method === 'get') {
        const meals = localStorageFallback.getMealHistory(params || {});
        return { data: meals, status: 200, statusText: 'OK', headers: {}, config: originalRequest };
      }

      // 5. Add Meal
      if (url.includes('/meals/add') && method === 'post') {
        let payload = {};
        try {
          payload = typeof data === 'string' ? JSON.parse(data) : data;
        } catch (e) {
          // If FormData is used (for image files upload)
          if (data instanceof FormData) {
            payload = {
              mealType: data.get('mealType'),
              foodName: data.get('foodName'),
              calories: data.get('calories'),
              protein: data.get('protein'),
              carbs: data.get('carbs'),
              fats: data.get('fats'),
              sugar: data.get('sugar'),
              fiber: data.get('fiber'),
              barcode: data.get('barcode'),
              image: '', // Cannot save file locally, fallback to empty
            };
          }
        }
        const newMeal = localStorageFallback.addMeal(payload);
        return { data: newMeal, status: 201, statusText: 'Created', headers: {}, config: originalRequest };
      }

      // 6. Delete Meal
      if (url.match(/\/meals\/[a-zA-Z0-9_]+/) && method === 'delete') {
        const parts = url.split('/');
        const id = parts[parts.length - 1];
        localStorageFallback.deleteMeal(id);
        return { data: { message: 'Deleted offline', id }, status: 200, statusText: 'OK', headers: {}, config: originalRequest };
      }

      // 7. Today's Water Stats
      if (url.includes('/water/today') && method === 'get') {
        const date = params?.date || new Date().toISOString().split('T')[0];
        const water = localStorageFallback.getTodayWater(date);
        return { data: water, status: 200, statusText: 'OK', headers: {}, config: originalRequest };
      }

      // 8. Add Water
      if (url.includes('/water/add') && method === 'post') {
        const payload = JSON.parse(data);
        const log = localStorageFallback.addWater(payload.amount, payload.date);
        return { data: log, status: 201, statusText: 'Created', headers: {}, config: originalRequest };
      }

      // 9. Barcode / AI Scan Lookups offline
      if (url.includes('/barcode/scan') && method === 'post') {
        const payload = JSON.parse(data);
        // Simple offline fallback parser
        const mockItem = {
          foodName: payload.barcode ? `Offline Scanned Product (${payload.barcode})` : payload.query,
          calories: 150,
          protein: 5,
          carbs: 20,
          fats: 5,
          sugar: 8,
          fiber: 3,
          barcode: payload.barcode || '',
          source: 'Offline-Fallback',
          isOfflineMock: true,
        };
        return { data: mockItem, status: 200, statusText: 'OK', headers: {}, config: originalRequest };
      }

      // Blocked auth operations when offline
      if (url.includes('/auth/login') || url.includes('/auth/register')) {
        return Promise.reject(new Error('Authentication requires an active internet connection.'));
      }
    }

    return Promise.reject(error);
  }
);

export default api;
