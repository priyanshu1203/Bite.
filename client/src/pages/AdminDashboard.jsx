import React, { useEffect, useState } from 'react';
import api from '../services/api';
import {
  ShieldAlert,
  Users,
  Layers,
  Droplet,
  Trash2,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [meals, setMeals] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'meals'
  
  // Mod messages
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadAdminData = async () => {
    setLoading(true);
    setMessage('');
    setErrorMessage('');
    try {
      const [usersRes, mealsRes, statsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/meals'),
        api.get('/admin/stats'),
      ]);

      setUsers(usersRes.data);
      setMeals(mealsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load admin logs:', err);
      setErrorMessage('Failed to load administrative logs. Make sure you are logged in as admin.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteFakeMeal = async (mealId) => {
    if (confirm('ADMIN ACTION: Are you sure you want to delete this food log from the database?')) {
      try {
        await api.delete(`/admin/meals/${mealId}`);
        setMessage('Meal log successfully moderated and deleted.');
        
        // Remove from local list
        setMeals(meals.filter((m) => m._id !== mealId));
        // Refresh metrics
        const statsRes = await api.get('/admin/stats');
        setStats(statsRes.data);
        
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        console.error(err);
        setErrorMessage('Failed to moderate meal log entry.');
      }
    }
  };

  // Filter lists based on search
  const filteredUsers = users.filter((u) => {
    const term = searchQuery.toLowerCase();
    return u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term);
  });

  const filteredMeals = meals.filter((m) => {
    const term = searchQuery.toLowerCase();
    return (
      m.foodName.toLowerCase().includes(term) ||
      m.mealType.toLowerCase().includes(term) ||
      m.userId?.name?.toLowerCase().includes(term) ||
      m.userId?.email?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-indigo-400" />
            Admin Control Center
          </h2>
          <p className="text-xs text-slate-400">Moderate database items, track physical profiles, and audit registered users.</p>
        </div>

        <button
          onClick={loadAdminData}
          className="self-start rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-950 px-4 py-2 text-xs font-bold text-slate-350 flex items-center gap-1.5 transition-all duration-150"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {message && (
        <div className="flex items-center gap-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 p-4 text-xs font-bold text-emerald-400">
          <CheckCircle className="h-5 w-5" />
          <span>{message}</span>
        </div>
      )}

      {errorMessage && (
        <div className="flex items-start gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/25 p-4 text-xs font-semibold text-rose-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* --- ADMIN SUMMARY STATS CARDS --- */}
      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1: Users */}
          <div className="glass-panel rounded-3xl p-5 shadow-xl flex items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 h-14 w-14 rounded-full bg-indigo-500/5 blur-lg"></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-500/15 border border-indigo-500/20 text-indigo-400">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total User Profiles</span>
              <p className="text-2xl font-black text-white mt-0.5">{stats.totalUsers}</p>
            </div>
          </div>

          {/* Card 2: Meals */}
          <div className="glass-panel rounded-3xl p-5 shadow-xl flex items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 h-14 w-14 rounded-full bg-emerald-500/5 blur-lg"></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/15 border border-emerald-500/20 text-emerald-400">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Food Logs</span>
              <p className="text-2xl font-black text-white mt-0.5">{stats.totalMeals}</p>
            </div>
          </div>

          {/* Card 3: Water */}
          <div className="glass-panel rounded-3xl p-5 shadow-xl flex items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 h-14 w-14 rounded-full bg-sky-500/5 blur-lg"></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/15 border border-sky-500/20 text-sky-400">
              <Droplet className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Water Logs Count</span>
              <p className="text-2xl font-black text-white mt-0.5">{stats.totalWaterLogs}</p>
            </div>
          </div>

          {/* Card 4: System Calorie Volume */}
          <div className="glass-panel rounded-3xl p-5 shadow-xl flex items-center gap-4 relative overflow-hidden">
            <div className="absolute right-0 bottom-0 h-14 w-14 rounded-full bg-orange-500/5 blur-lg"></div>
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/15 border border-orange-500/20 text-orange-400">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Cal Logged</span>
              <p className="text-2xl font-black text-white mt-0.5">
                {stats.systemMacros?.totalCalories ? Math.round(stats.systemMacros.totalCalories) : 0} kcal
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- PANEL LAYOUT & TAB SYSTEM --- */}
      <div className="glass-panel rounded-3xl p-6 shadow-xl space-y-6">
        
        {/* Navigation Bar / Tabs */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-b border-slate-950 pb-4 gap-4">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={() => {
                setActiveTab('users');
                setSearchQuery('');
              }}
              className={`flex-1 sm:flex-initial rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-150 ${
                activeTab === 'users'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
              }`}
            >
              System Users ({users.length})
            </button>
            <button
              onClick={() => {
                setActiveTab('meals');
                setSearchQuery('');
              }}
              className={`flex-1 sm:flex-initial rounded-xl px-5 py-2.5 text-xs font-bold transition-all duration-150 ${
                activeTab === 'meals'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:bg-slate-900/60 hover:text-slate-200'
              }`}
            >
              Moderation logs ({meals.length})
            </button>
          </div>

          {/* Tab specific search */}
          <div className="relative w-full sm:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-500">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glass-input w-full pl-10 text-xs py-2"
            />
          </div>
        </div>

        {/* Tab 1: System Users Table */}
        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            {loading ? (
              <div className="flex justify-center py-10">
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">No user records found.</div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead className="border-b border-slate-950 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <tr>
                    <th className="py-3 px-4">Name</th>
                    <th className="py-3 px-4">Email</th>
                    <th className="py-3 px-4">Age/Ht/Wt</th>
                    <th className="py-3 px-4">Calorie Goal</th>
                    <th className="py-3 px-4">Goal</th>
                    <th className="py-3 px-4">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-950 text-slate-300 font-medium">
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="hover:bg-slate-900/20 transition-colors">
                      <td className="py-3 px-4 font-bold text-white">{u.name}</td>
                      <td className="py-3 px-4">{u.email}</td>
                      <td className="py-3 px-4">
                        {u.age}y / {u.height}cm / {u.weight}kg
                      </td>
                      <td className="py-3 px-4 font-bold text-indigo-400">{u.calorieGoal} kcal</td>
                      <td className="py-3 px-4">
                        <span className="rounded bg-slate-950 px-2 py-0.5 text-[10px] border border-slate-800">
                          {u.fitnessGoal}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded px-2 py-0.5 text-[9px] font-bold uppercase ${
                            u.role === 'admin'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                              : 'bg-slate-950 text-slate-500 border border-slate-800'
                          }`}
                        >
                          {u.role}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* Tab 2: System Logs Moderation */}
        {activeTab === 'meals' && (
          <div className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-10">
                <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
              </div>
            ) : filteredMeals.length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm">No food logs matching keywords.</div>
            ) : (
              <div className="space-y-3.5">
                {filteredMeals.map((meal) => (
                  <div
                    key={meal._id}
                    className="glass-panel border border-slate-950 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex gap-4 items-center min-w-0">
                      {/* Avatar */}
                      <div className="h-12 w-12 rounded-xl bg-slate-900 border border-slate-850 flex-shrink-0 flex items-center justify-center font-bold text-slate-700 text-lg uppercase">
                        {meal.foodName?.charAt(0)}
                      </div>
                      
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className="rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase">
                            {meal.mealType}
                          </span>
                          <span className="text-[10px] text-slate-500 font-bold">
                            Logged by: <strong className="text-slate-350">{meal.userId?.name || 'Offline User'}</strong> ({meal.userId?.email || 'N/A'})
                          </span>
                        </div>
                        <h4 className="font-bold text-white text-sm truncate uppercase tracking-tight">{meal.foodName}</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          Macros: {meal.protein}g P / {meal.carbs}g C / {meal.fats}g F
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-right">
                        <span className="text-lg font-black tracking-tight text-white">{meal.calories}</span>
                        <span className="text-[9px] uppercase font-bold text-slate-500 block">kcal</span>
                      </div>

                      <button
                        onClick={() => handleDeleteFakeMeal(meal._id)}
                        className="rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500 hover:text-white border border-rose-500/20 p-2.5 transition-all active:scale-95"
                        title="Delete meal log (Moderate)"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;
