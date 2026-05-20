import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchTodayMeals, deleteMeal } from '../store/mealSlice';
import { fetchTodayWater, addWater, incrementWaterLocal } from '../store/waterSlice';
import CalorieCard from '../components/CalorieCard';
import MacroProgress from '../components/MacroProgress';
import WaterTracker from '../components/WaterTracker';
import MealHistoryCard from '../components/MealHistoryCard';
import { Camera, Calendar, ArrowRight, Sparkles, RefreshCw, Layers } from 'lucide-react';

const Dashboard = () => {
  const dispatch = useDispatch();

  const { user } = useSelector((state) => state.auth);
  const { todayMeals, loading: mealsLoading } = useSelector((state) => state.meals);
  const { total: waterTotal, loading: waterLoading } = useSelector((state) => state.water);

  const todayDateStr = new Date().toISOString().split('T')[0];

  useEffect(() => {
    dispatch(fetchTodayMeals());
    dispatch(fetchTodayWater(todayDateStr));
  }, [dispatch, todayDateStr]);

  // Calculations for Today's Stats
  const calorieGoal = user?.calorieGoal || 2000;
  
  // Calculate dynamic macro targets based on calorie goals (30% Protein, 45% Carbs, 25% Fat)
  const proteinGoal = (calorieGoal * 0.30) / 4;
  const carbsGoal = (calorieGoal * 0.45) / 4;
  const fatsGoal = (calorieGoal * 0.25) / 9;

  const stats = todayMeals.reduce(
    (acc, meal) => {
      acc.calories += meal.calories || 0;
      acc.protein += meal.protein || 0;
      acc.carbs += meal.carbs || 0;
      acc.fats += meal.fats || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const handleAddWater = (amount) => {
    // Optimistic UI updates
    dispatch(incrementWaterLocal(amount));
    // Server log
    dispatch(addWater({ amount, date: todayDateStr }));
  };

  const handleDeleteMeal = (id) => {
    if (confirm('Are you sure you want to delete this food log entry?')) {
      dispatch(deleteMeal(id));
    }
  };

  const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snacks'];

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Top Banner / Welcome Card */}
      <div className="relative rounded-3xl bg-gradient-to-r from-indigo-900/40 via-indigo-950/20 to-slate-900 border border-indigo-500/10 p-6 sm:p-8 overflow-hidden shadow-lg">
        {/* Glowing backgrounds */}
        <div className="absolute top-0 right-0 h-40 w-40 rounded-full bg-indigo-500/10 blur-[80px]"></div>
        <div className="absolute bottom-0 right-1/3 h-28 w-28 rounded-full bg-emerald-500/5 blur-[60px]"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-emerald-500/15 border border-emerald-500/20 px-3 py-1 text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1.5 shadow-md">
                <Sparkles className="h-3 w-3 animate-pulse" />
                AI Health Tracking Active
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Hello, {user?.name || 'Friend'}!
            </h2>
            <p className="text-slate-400 text-sm max-w-lg">
              Here is your overview for today. Log food via AI scanner, barcode or images to track your nutrition goal.
            </p>
          </div>

          <Link
            to="/scan"
            className="flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 to-indigo-600 px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 hover:from-indigo-600 hover:to-indigo-700 active:scale-98 transition-all duration-200"
          >
            <Camera className="h-5 w-5" />
            AI Meal Scanner
            <ArrowRight className="h-4.5 w-4.5" />
          </Link>
        </div>
      </div>

      {/* Stats Summary Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CalorieCard target={calorieGoal} consumed={stats.calories} />
        <MacroProgress
          carbs={{ target: carbsGoal, consumed: stats.carbs }}
          protein={{ target: proteinGoal, consumed: stats.protein }}
          fats={{ target: fatsGoal, consumed: stats.fats }}
        />
      </div>

      {/* Water & Quick Actions Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Water component takes 2 spans on large screens */}
        <div className="lg:col-span-2">
          <WaterTracker current={waterTotal} onAdd={handleAddWater} />
        </div>

        {/* Small stats card / quick links */}
        <div className="glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -right-5 -bottom-5 h-20 w-20 rounded-full bg-emerald-500/5 blur-xl"></div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Quick Stats</h3>
            <div className="mt-4 grid grid-cols-2 gap-4">
              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-950">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Foods Logged</span>
                <p className="text-2xl font-black text-white mt-1">{todayMeals.length}</p>
              </div>
              <div className="bg-slate-900/60 p-3 rounded-2xl border border-slate-950">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider font-sans">Hydration Cups</span>
                <p className="text-2xl font-black text-white mt-1">{(waterTotal / 250).toFixed(1)}</p>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-slate-900 pt-4">
            <Link
              to="/history"
              className="flex items-center justify-between text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors duration-150"
            >
              <span>View full logging history</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Today's Meals Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Today's Meals</h3>
            <p className="text-xs text-slate-500">Your log of consumed meals grouped chronologically.</p>
          </div>
          <span className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-800">
            <Layers className="h-3.5 w-3.5" />
            Today
          </span>
        </div>

        {mealsLoading ? (
          <div className="flex justify-center py-12">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
          </div>
        ) : todayMeals.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center border-dashed border-2 border-slate-900/40">
            <p className="text-slate-400 text-sm">No food logs registered for today yet.</p>
            <Link
              to="/scan"
              className="inline-block mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-indigo-400 border border-indigo-500/20 hover:bg-slate-950 transition-colors"
            >
              Log your first meal
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {todayMeals.map((meal) => (
              <MealHistoryCard
                key={meal._id}
                meal={meal}
                onDelete={handleDeleteMeal}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
