import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../services/api';
import { localStorageFallback } from '../services/localStorageFallback';

const initialState = {
  total: 0,
  logs: [],
  loading: false,
  error: null,
};

export const fetchTodayWater = createAsyncThunk(
  'water/fetchTodayWater',
  async (dateStr, thunkAPI) => {
    try {
      const response = await api.get('/water/today', {
        params: { date: dateStr },
      });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to fetch water data';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const addWater = createAsyncThunk(
  'water/addWater',
  async (waterData, thunkAPI) => {
    try {
      const response = await api.post('/water/add', waterData);
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Failed to add water';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const syncOfflineWaterThunk = createAsyncThunk(
  'water/syncOfflineWater',
  async (_, thunkAPI) => {
    try {
      const pendingActions = localStorageFallback.getPendingSyncActions();
      
      const waterToSync = pendingActions
        .filter((action) => action.type === 'ADD_WATER')
        .map((action) => action.payload);

      if (waterToSync.length > 0) {
        await api.post('/water/sync', { waterLogs: waterToSync });
      }
      return waterToSync.length;
    } catch (error) {
      const message = error.response?.data?.message || error.message || 'Sync failed';
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const waterSlice = createSlice({
  name: 'water',
  initialState,
  reducers: {
    incrementWaterLocal: (state, action) => {
      // Optimistic instant local UI increment to make the click feel premium
      state.total += Number(action.payload);
    },
    clearWaterError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Water Logs
      .addCase(fetchTodayWater.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchTodayWater.fulfilled, (state, action) => {
        state.loading = false;
        state.total = action.payload.total;
        state.logs = action.payload.logs;
      })
      .addCase(fetchTodayWater.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Water
      .addCase(addWater.pending, (state) => {
        state.loading = true;
      })
      .addCase(addWater.fulfilled, (state, action) => {
        state.loading = false;
        // Re-calculate local state instead of doing full reload
        state.logs.push(action.payload);
        // Note: total is updated optimistically or we can sum here
        const calculatedTotal = state.logs.reduce((sum, log) => sum + log.amount, 0);
        state.total = calculatedTotal;
      })
      .addCase(addWater.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { incrementWaterLocal, clearWaterError } = waterSlice.actions;
export default waterSlice.reducer;
