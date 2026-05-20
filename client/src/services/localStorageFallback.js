// Local Storage Keys
const MEALS_KEY = 'ai_nutrition_tracker_meals';
const WATER_KEY = 'ai_nutrition_tracker_water';
const PROFILE_KEY = 'ai_nutrition_tracker_profile';
const SYNC_QUEUE_KEY = 'ai_nutrition_tracker_sync_queue';

// Helper to get items
const getLocalData = (key, defaultVal = []) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultVal;
  } catch (e) {
    console.error('Failed to read from localStorage:', e);
    return defaultVal;
  }
};

// Helper to set items
const setLocalData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Failed to write to localStorage:', e);
  }
};

export const localStorageFallback = {
  // --- AUTH / PROFILE ---
  getProfile: () => {
    return getLocalData(PROFILE_KEY, {
      name: 'Offline User',
      email: 'offline@fit.com',
      age: 25,
      weight: 70,
      height: 170,
      fitnessGoal: 'Maintain',
      calorieGoal: 2000,
      role: 'user',
    });
  },

  updateProfile: (profileData) => {
    const current = localStorageFallback.getProfile();
    const updated = { ...current, ...profileData };
    setLocalData(PROFILE_KEY, updated);
    localStorageFallback.enqueueSyncAction('UPDATE_PROFILE', updated);
    return updated;
  },

  // --- MEALS ---
  getTodayMeals: (timezoneOffset = 0) => {
    const meals = getLocalData(MEALS_KEY, []);
    
    // Filter meals logged on the same calendar day
    const now = new Date();
    const clientNow = new Date(now.getTime() - (timezoneOffset * 60 * 1000));
    const todayStr = clientNow.toISOString().split('T')[0]; // YYYY-MM-DD

    return meals.filter((meal) => {
      const mealDate = new Date(meal.createdAt);
      const adjustedMealDate = new Date(mealDate.getTime() - (timezoneOffset * 60 * 1000));
      const mealDateStr = adjustedMealDate.toISOString().split('T')[0];
      return mealDateStr === todayStr;
    });
  },

  getMealHistory: (filters = {}) => {
    const meals = getLocalData(MEALS_KEY, []);
    let filtered = [...meals];

    if (filters.startDate) {
      const start = new Date(filters.startDate);
      filtered = filtered.filter(m => new Date(m.createdAt) >= start);
    }
    if (filters.endDate) {
      const end = new Date(filters.endDate);
      end.setHours(23, 59, 59, 999);
      filtered = filtered.filter(m => new Date(m.createdAt) <= end);
    }
    if (filters.mealType && filters.mealType !== 'All') {
      filtered = filtered.filter(m => m.mealType === filters.mealType);
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(m => m.foodName.toLowerCase().includes(searchLower));
    }

    return filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  addMeal: (mealData) => {
    const meals = getLocalData(MEALS_KEY, []);
    const newMeal = {
      _id: `local_${Date.now()}`,
      userId: 'offline_user',
      mealType: mealData.mealType,
      foodName: mealData.foodName,
      calories: Number(mealData.calories) || 0,
      protein: Number(mealData.protein) || 0,
      carbs: Number(mealData.carbs) || 0,
      fats: Number(mealData.fats) || 0,
      sugar: Number(mealData.sugar) || 0,
      fiber: Number(mealData.fiber) || 0,
      image: mealData.image || '',
      barcode: mealData.barcode || '',
      createdAt: mealData.createdAt || new Date().toISOString(),
    };

    meals.unshift(newMeal);
    setLocalData(MEALS_KEY, meals);

    // Save sync queue item
    localStorageFallback.enqueueSyncAction('ADD_MEAL', newMeal);
    return newMeal;
  },

  deleteMeal: (id) => {
    const meals = getLocalData(MEALS_KEY, []);
    const updatedMeals = meals.filter((meal) => meal._id !== id);
    setLocalData(MEALS_KEY, updatedMeals);

    if (id.toString().startsWith('local_')) {
      // If it was created offline and deleted offline, remove its ADD_MEAL command from queue
      const queue = getLocalData(SYNC_QUEUE_KEY, []);
      const filteredQueue = queue.filter(
        (action) => !(action.type === 'ADD_MEAL' && action.payload._id === id)
      );
      setLocalData(SYNC_QUEUE_KEY, filteredQueue);
    } else {
      // If it exists on server, queue a delete operation
      localStorageFallback.enqueueSyncAction('DELETE_MEAL', { id });
    }
    return id;
  },

  // --- WATER ---
  getTodayWater: (dateStr) => {
    const waterLogs = getLocalData(WATER_KEY, []);
    const filtered = waterLogs.filter((log) => log.date === dateStr);
    const total = filtered.reduce((sum, log) => sum + log.amount, 0);
    return { total, logs: filtered };
  },

  addWater: (amount, dateStr) => {
    const waterLogs = getLocalData(WATER_KEY, []);
    const newLog = {
      _id: `local_${Date.now()}`,
      userId: 'offline_user',
      amount: Number(amount),
      date: dateStr,
      createdAt: new Date().toISOString(),
    };

    waterLogs.push(newLog);
    setLocalData(WATER_KEY, waterLogs);

    localStorageFallback.enqueueSyncAction('ADD_WATER', newLog);
    return newLog;
  },

  // --- SYNC QUEUE ---
  enqueueSyncAction: (type, payload) => {
    const queue = getLocalData(SYNC_QUEUE_KEY, []);
    queue.push({
      id: `queue_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      type,
      payload,
      timestamp: new Date().toISOString(),
    });
    setLocalData(SYNC_QUEUE_KEY, queue);
  },

  getPendingSyncActions: () => {
    return getLocalData(SYNC_QUEUE_KEY, []);
  },

  clearPendingSyncActions: () => {
    setLocalData(SYNC_QUEUE_KEY, []);
  },

  // Sync state loaded from DB to replace offline items
  replaceLocalMeals: (serverMeals) => {
    setLocalData(MEALS_KEY, serverMeals);
  },

  replaceLocalWater: (serverWaterLogs) => {
    setLocalData(WATER_KEY, serverWaterLogs);
  },
};
