import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getProfile } from './store/authSlice';
import { syncOfflineMealsThunk, fetchTodayMeals } from './store/mealSlice';
import { syncOfflineWaterThunk, fetchTodayWater } from './store/waterSlice';
import { applyTheme, setOfflineStatus } from './store/uiSlice';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MealScanner from './pages/MealScanner';
import History from './pages/History';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';

const App = () => {
  const dispatch = useDispatch();
  const { token } = useSelector((state) => state.auth);
  const { theme } = useSelector((state) => state.ui);

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // 1. Load profile on startup if token exists
  useEffect(() => {
    if (token) {
      dispatch(getProfile());
    }
  }, [token, dispatch]);

  // 2. Periodic sync check (runs every 20 seconds when online)
  useEffect(() => {
    const handlePeriodicSync = async () => {
      // If offline, do not attempt sync
      if (!navigator.onLine) {
        dispatch(setOfflineStatus(true));
        return;
      }
      
      dispatch(setOfflineStatus(false));
      
      const syncQueue = localStorage.getItem('ai_nutrition_tracker_sync_queue');
      const queue = syncQueue ? JSON.parse(syncQueue) : [];

      if (queue.length > 0) {
        console.log('Background Sync Loop: Syncing cached offline logs...');
        try {
          await dispatch(syncOfflineMealsThunk()).unwrap();
          await dispatch(syncOfflineWaterThunk()).unwrap();
          localStorage.setItem('ai_nutrition_tracker_sync_queue', '[]');
          
          // Refresh data
          const todayStr = new Date().toISOString().split('T')[0];
          dispatch(fetchTodayMeals());
          dispatch(fetchTodayWater(todayStr));
          console.log('Background Sync Loop: Synced successfully!');
        } catch (err) {
          console.error('Background Sync Loop: Sync failed:', err);
        }
      }
    };

    // Run immediately and then schedule interval
    handlePeriodicSync();
    const interval = setInterval(handlePeriodicSync, 20000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Inner Layout routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/scan" element={<MealScanner />} />
            <Route path="/history" element={<History />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/profile" element={<Profile />} />
            
            {/* Admin only subroutes */}
            <Route element={<AdminRoute />}>
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Route>

        {/* Wildcard redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
