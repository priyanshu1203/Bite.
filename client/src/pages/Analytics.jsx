import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMealHistory } from '../store/mealSlice';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area
} from 'recharts';
import { Calendar, BarChart3, TrendingUp, RefreshCw, Droplet } from 'lucide-react';
import api from '../services/api';

const Analytics = () => {
  const dispatch = useDispatch();
  const { historyMeals, loading } = useSelector((state) => state.meals);
  const [waterData, setWaterData] = useState([]);
  const [waterLoading, setWaterLoading] = useState(false);

  useEffect(() => {
    // 1. Fetch past 30 days of meals to build analytics
    const d = new Date();
    d.setDate(d.getDate() - 30);
    dispatch(fetchMealHistory({ startDate: d.toISOString().split('T')[0] }));
    
    // 2. Fetch past 7 days of water logs
    fetchWaterAnalytics();
  }, [dispatch]);

  const fetchWaterAnalytics = async () => {
    setWaterLoading(true);
    try {
      const dataPoints = [];
      // Loop over the past 7 days and query water total for each date
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
        
        try {
          const res = await api.get('/water/today', { params: { date: dateStr } });
          dataPoints.push({
            date: dateStr,
            day: dayLabel,
            amount: res.data.total || 0,
          });
        } catch (e) {
          dataPoints.push({
            date: dateStr,
            day: dayLabel,
            amount: 0,
          });
        }
      }
      setWaterData(dataPoints);
    } catch (e) {
      console.error(e);
    } finally {
      setWaterLoading(false);
    }
  };

  // --- DATA COMPILATION LOGIC ---

  // 1. Compile Calories per Day (Past 7 Days)
  const getWeeklyCalorieData = () => {
    const dailyMap = {};
    // Seed past 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      dailyMap[dateStr] = { day: dayLabel, calories: 0 };
    }

    // Populate from meals
    historyMeals.forEach((meal) => {
      const mealDateStr = new Date(meal.createdAt).toISOString().split('T')[0];
      if (dailyMap[mealDateStr]) {
        dailyMap[mealDateStr].calories += meal.calories || 0;
      }
    });

    return Object.keys(dailyMap).map((key) => ({
      date: key,
      ...dailyMap[key],
    }));
  };

  // 2. Compile Macro Distribution (Pie Chart)
  const getMacroPieData = () => {
    let protein = 0;
    let carbs = 0;
    let fats = 0;

    historyMeals.forEach((meal) => {
      protein += meal.protein || 0;
      carbs += meal.carbs || 0;
      fats += meal.fats || 0;
    });

    const total = protein + carbs + fats || 1;

    return [
      { name: 'Protein', value: Math.round(protein), color: '#10b981', percentage: Math.round((protein / total) * 100) },
      { name: 'Carbohydrates', value: Math.round(carbs), color: '#6366f1', percentage: Math.round((carbs / total) * 100) },
      { name: 'Fats', value: Math.round(fats), color: '#f97316', percentage: Math.round((fats / total) * 100) },
    ];
  };

  // 3. Compile Weekly Macro Trend Area Chart
  const getWeeklyMacroTrendData = () => {
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = d.toLocaleDateString('en-US', { weekday: 'short' });
      dailyMap[dateStr] = { day: dayLabel, Protein: 0, Carbs: 0, Fats: 0 };
    }

    historyMeals.forEach((meal) => {
      const mealDateStr = new Date(meal.createdAt).toISOString().split('T')[0];
      if (dailyMap[mealDateStr]) {
        dailyMap[mealDateStr].Protein += Math.round(meal.protein || 0);
        dailyMap[mealDateStr].Carbs += Math.round(meal.carbs || 0);
        dailyMap[mealDateStr].Fats += Math.round(meal.fats || 0);
      }
    });

    return Object.keys(dailyMap).map((key) => ({
      date: key,
      ...dailyMap[key],
    }));
  };

  const calorieData = getWeeklyCalorieData();
  const macroPieData = getMacroPieData();
  const macroTrendData = getWeeklyMacroTrendData();

  // Custom styling elements for Recharts Tooltips
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-panel border border-slate-900 rounded-xl p-3 shadow-xl text-xs font-semibold">
          <p className="text-slate-400 mb-1">{label}</p>
          {payload.map((item, idx) => (
            <p key={idx} style={{ color: item.color || item.payload.color || '#6366f1' }}>
              {item.name}: <strong className="text-white">{item.value} {item.name === 'Water' ? 'ml' : item.name === 'Calories' ? 'kcal' : 'g'}</strong>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight">Analytics Dashboard</h2>
        <p className="text-xs text-slate-400">Inspect weekly nutrition balances and hydration progressions.</p>
      </div>

      {loading || waterLoading ? (
        <div className="flex justify-center py-20">
          <RefreshCw className="h-10 w-10 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* CHART 1: WEEKLY CALORIE BAR */}
          <div className="glass-panel rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[350px]">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <TrendingUp className="h-4.5 w-4.5 text-indigo-400" />
                Weekly Calorie Logging Intake
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Sum of calories consumed per day.</p>
            </div>
            
            <div className="h-60 mt-6 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={calorieData}>
                  <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.02)' }} />
                  <Bar dataKey="calories" fill="#6366f1" radius={[8, 8, 0, 0]} name="Calories" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 2: WATER INTAKE PROGRESS */}
          <div className="glass-panel rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[350px]">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Droplet className="h-4.5 w-4.5 text-sky-400 animate-pulse" />
                Weekly Hydration Progression
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Hydration volumes in milliliters.</p>
            </div>
            
            <div className="h-60 mt-6 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={waterData}>
                  <defs>
                    <linearGradient id="waterGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="amount" stroke="#0ea5e9" fillOpacity={1} fill="url(#waterGrad)" name="Water" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 3: WEEKLY MACROS AREA GRAPH */}
          <div className="glass-panel rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[380px]">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Macronutrients Trend Line</h3>
              <p className="text-xs text-slate-500 mt-0.5">Gram values logged daily.</p>
            </div>
            
            <div className="h-64 mt-6 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={macroTrendData}>
                  <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend verticalAlign="top" height={36} iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 600 }} />
                  <Line type="monotone" dataKey="Protein" stroke="#10b981" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Carbs" stroke="#6366f1" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                  <Line type="monotone" dataKey="Fats" stroke="#f97316" strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* CHART 4: MACROS PERCENTAGE DISTRIBUTION PIE */}
          <div className="glass-panel rounded-3xl p-6 shadow-xl flex flex-col justify-between min-h-[380px]">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Total Macros Ratio</h3>
              <p className="text-xs text-slate-500 mt-0.5">Percentage distribution based on logged items.</p>
            </div>

            <div className="flex flex-row items-center justify-around gap-4 flex-1 mt-6">
              <div className="h-48 w-48 relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={macroPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {macroPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Legends */}
              <div className="space-y-3 font-semibold text-xs text-slate-400">
                {macroPieData.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <div>
                      <p className="text-slate-200">{item.name}</p>
                      <p className="text-[10px] text-slate-500">{item.value}g ({item.percentage}%)</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default Analytics;
