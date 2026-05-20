import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { localStorageFallback } from '../services/localStorageFallback';

const initialState = {
  todayMeals: [],
  historyMeals: [],
  loading: false,
  syncing: false,
  error: null,
};

export const fetchTodayMeals = createAsyncThunk(
  'meals/fetchTodayMeals',
  async (_, thunkAPI) => {
    try {
      const offset = new Date().getTimezoneOffset();
      const response = await api.get('/meals/today', {
        params: { timezoneOffset: offset },
      });
      // Store in offline cache for next launch
      if (Array.isArray(response.data) && !navigator.onLine) {
        // Do not replace if we got simulated data, but the interceptor already returns from local storage
      } else if (Array.isArray(response.data) && navigator.onLine) {
        localStorageFallback.replaceLocalMeals(response.data);
      }
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch meals';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const fetchMealHistory = createAsyncThunk(
  'meals/fetchMealHistory',
  async (filters, thunkAPI) => {
    try {
      const response = await api.get('/meals/history', { params: filters });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch meal history';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const addMeal = createAsyncThunk(
  'meals/addMeal',
  async (mealData, thunkAPI) => {
    try {
      // Determine if mealData is Form (for image uploads)
      const hasImageFile = mealData.image instanceof File;
      
      let config = {};
      let payload = mealData;

      if (hasImageFile) {
        const formData = new FormData();
        Object.keys(mealData).forEach((key) => {
          formData.append(key, mealData[key]);
        });
        payload = formData;
        config = {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        };
      }

      const response = await api.post('/meals/add', payload, config);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add meal';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const deleteMeal = createAsyncThunk(
  'meals/deleteMeal',
  async (id, thunkAPI) => {
    try {
      await api.delete(`/meals/${id}`);
      return id;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to delete meal';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const syncOfflineMealsThunk = createAsyncThunk(
  'meals/syncOfflineMeals',
  async (_, thunkAPI) => {
    try {
      const pendingActions = localStorageFallback.getPendingSyncActions();
      
      // Filter out add meal operations
      const mealsToSync = pendingActions
        .filter((action) => action.type === 'ADD_MEAL')
        .map((action) => action.payload);
        
      // Filter out delete meal operations
      const mealDeletesToSync = pendingActions
        .filter((action) => action.type === 'DELETE_MEAL')
        .map((action) => action.payload.id);

      let syncedCount = 0;

      // 1. Sync additions in bulk
      if (mealsToSync.length > 0) {
        const response = await api.post('/meals/sync', { meals: mealsToSync });
        syncedCount += response.data.count || mealsToSync.length;
      }

      // 2. Sync deletions one by one
      for (const id of mealDeletesToSync) {
        if (!id.toString().startsWith('local_')) {
          try {
            await api.delete(`/meals/${id}`);
            syncedCount++;
          } catch (e) {
            console.error('Failed to sync meal deletion:', id, e);
          }
        }
      }

      return syncedCount;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Sync failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const mealSlice = createSlice({
  name: 'meals',
  initialState,
  reducers: {
    clearMealError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Today's Meals
      .addCase(fetchTodayMeals.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTodayMeals.fulfilled, (state, action) => {
        state.loading = false;
        state.todayMeals = action.payload;
      })
      .addCase(fetchTodayMeals.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch History
      .addCase(fetchMealHistory.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchMealHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.historyMeals = action.payload;
      })
      .addCase(fetchMealHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Meal
      .addCase(addMeal.pending, (state) => {
        state.loading = true;
      })
      .addCase(addMeal.fulfilled, (state, action) => {
        state.loading = false;
        state.todayMeals.unshift(action.payload);
      })
      .addCase(addMeal.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Delete Meal
      .addCase(deleteMeal.fulfilled, (state, action) => {
        state.todayMeals = state.todayMeals.filter((m) => m._id !== action.payload);
        state.historyMeals = state.historyMeals.filter((m) => m._id !== action.payload);
      })
      // Sync Offline Meals
      .addCase(syncOfflineMealsThunk.pending, (state) => {
        state.syncing = true;
      })
      .addCase(syncOfflineMealsThunk.fulfilled, (state) => {
        state.syncing = false;
      })
      .addCase(syncOfflineMealsThunk.rejected, (state, action) => {
        state.syncing = false;
        state.error = action.payload;
      });
  },
});

export const { clearMealError } = mealSlice.actions;
export default mealSlice.reducer;
