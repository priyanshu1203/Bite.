import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setOfflineStatus } from '../store/uiSlice';
import { syncOfflineMealsThunk, fetchTodayMeals } from '../store/mealSlice';
import { syncOfflineWaterThunk, fetchTodayWater } from '../store/waterSlice';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';

const OfflineBadge = () => {
  const dispatch = useDispatch();
  const { isOffline } = useSelector((state) => state.ui);
  const { syncing } = useSelector((state) => state.meals);
  const [showOnlineSyncState, setShowOnlineSyncState] = useState(false);

  // Hook up event listeners for network changes in browser and custom axios broadcasts
  useEffect(() => {
    const handleStatusChange = (e) => {
      const offlineState = e.detail?.isOffline;
      if (offlineState !== undefined && offlineState !== isOffline) {
        dispatch(setOfflineStatus(offlineState));
        
        // If we transitioned from offline to online
        if (!offlineState && isOffline) {
          triggerSync();
        }
      }
    };

    const handleBrowserOnline = () => {
      dispatch(setOfflineStatus(false));
      triggerSync();
    };

    const handleBrowserOffline = () => {
      dispatch(setOfflineStatus(true));
    };

    window.addEventListener('app-network-status', handleStatusChange);
    window.addEventListener('online', handleBrowserOnline);
    window.addEventListener('offline', handleBrowserOffline);

    return () => {
      window.removeEventListener('app-network-status', handleStatusChange);
      window.removeEventListener('online', handleBrowserOnline);
      window.removeEventListener('offline', handleBrowserOffline);
    };
  }, [isOffline, dispatch]);

  const triggerSync = async () => {
    setShowOnlineSyncState(true);
    console.log('Online restored! Triggering data sync...');
    
    try {
      // 1. Sync meals
      await dispatch(syncOfflineMealsThunk()).unwrap();
      // 2. Sync water
      await dispatch(syncOfflineWaterThunk()).unwrap();
      
      // 3. Clear offline queue
      // Clear function handles inside the sync logic of localStorageFallback
      localStorage.setItem('ai_nutrition_tracker_sync_queue', '[]');
      
      // 4. Reload today's statistics
      const todayStr = new Date().toISOString().split('T')[0];
      dispatch(fetchTodayMeals());
      dispatch(fetchTodayWater(todayStr));
      
      console.log('Synchronization complete!');
    } catch (e) {
      console.error('Failed to synchronize offline data:', e);
    } finally {
      // Keep showing success banner for 4 seconds
      setTimeout(() => {
        setShowOnlineSyncState(false);
      }, 4000);
    }
  };

  if (isOffline) {
    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-rose-500/90 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-sm animate-pulse border border-rose-400">
        <WifiOff className="h-4 w-4" />
        <span>Offline Mode</span>
      </div>
    );
  }

  if (showOnlineSyncState || syncing) {
    return (
      <div className="fixed top-4 right-4 z-50 flex items-center gap-2 rounded-full bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur-sm border border-indigo-400 animate-fade-in-up">
        <RefreshCw className="h-4.5 w-4.5 animate-spin" />
        <span>Syncing Local Progress...</span>
      </div>
    );
  }

  return null;
};

export default OfflineBadge;
