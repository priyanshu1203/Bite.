import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMealHistory, deleteMeal } from '../store/mealSlice';
import MealHistoryCard from '../components/MealHistoryCard';
import { Calendar, Search, RefreshCw, Layers, SlidersHorizontal, AlertCircle, ChevronDown } from 'lucide-react';

const History = () => {
  const dispatch = useDispatch();
  const { historyMeals, loading, error } = useSelector((state) => state.meals);

  // Filter conditions states
  const [search, setSearch] = useState('');
  const [mealType, setMealType] = useState('All');
  
  // Default range: past 30 days
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });

  const loadHistory = () => {
    const filters = {};
    if (search.trim()) filters.search = search;
    if (mealType !== 'All') filters.mealType = mealType;
    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    dispatch(fetchMealHistory(filters));
  };

  // Trigger load when filters change
  useEffect(() => {
    loadHistory();
  }, [dispatch, mealType, startDate, endDate]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadHistory();
  };

  const handleDeleteMeal = (id) => {
    if (confirm('Are you sure you want to delete this food log entry?')) {
      dispatch(deleteMeal(id));
    }
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight">Meal History Logs</h2>
          <p className="text-xs text-slate-400">Search and audit your previous daily calorie logs.</p>
        </div>

        <button
          onClick={loadHistory}
          className="self-start rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-950 px-4 py-2 text-xs font-bold text-slate-300 flex items-center gap-1.5 transition-colors duration-150"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh History
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 p-4 text-xs font-semibold text-rose-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* --- FILTER INTERFACE BLOCK --- */}
      <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Keyword Search */}
          <div className="md:col-span-2 relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search food logs by keyword..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input w-full pl-10"
            />
          </div>

          {/* Category selection */}
          <div>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
                <Layers className="h-4.5 w-4.5" />
              </span>
              <select
                value={mealType}
                onChange={(e) => setMealType(e.target.value)}
                className="glass-input w-full pl-10 pr-10 appearance-none bg-slate-900"
              >
                <option value="All">All Categories</option>
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snacks">Snacks</option>
              </select>
              <span className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 pointer-events-none">
                <ChevronDown className="h-4.5 w-4.5" />
              </span>
            </div>
          </div>

          {/* Filter Trigger Button */}
          <button
            type="submit"
            className="rounded-2xl bg-indigo-600/90 text-white font-bold py-2.5 px-4 text-xs shadow-lg hover:bg-indigo-500 transition-all active:scale-97 flex items-center justify-center gap-1.5"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Search Logs
          </button>
        </form>

        <div className="border-t border-slate-900/60 pt-4 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-semibold">
            <Calendar className="h-4 w-4 text-indigo-400" />
            <span>Filter Date Range:</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="glass-input text-xs py-1.5 flex-1 sm:w-36"
            />
            <span className="text-xs text-slate-500 font-bold">to</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="glass-input text-xs py-1.5 flex-1 sm:w-36"
            />
          </div>
        </div>
      </div>

      {/* --- LOGGED ITEMS DISPLAY PANEL --- */}
      <div>
        {loading ? (
          <div className="flex justify-center py-16">
            <RefreshCw className="h-10 w-10 animate-spin text-indigo-500" />
          </div>
        ) : historyMeals.length === 0 ? (
          <div className="glass-panel rounded-3xl p-16 text-center border-dashed border-2 border-slate-900/40">
            <p className="text-slate-400 text-sm">No food logs match the selected filter conditions.</p>
            <button
              onClick={() => {
                setSearch('');
                setMealType('All');
                setStartDate('');
                setEndDate('');
              }}
              className="mt-4 rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-indigo-400 border border-indigo-500/10 hover:bg-slate-950 transition-colors"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {historyMeals.map((meal) => (
              <MealHistoryCard
                key={meal._id}
                meal={meal}
                onDelete={handleDeleteMeal}
                showDate={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
