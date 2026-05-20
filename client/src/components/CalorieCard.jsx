import React from 'react';
import { Flame } from 'lucide-react';

const CalorieCard = ({ target = 2000, consumed = 0 }) => {
  const remaining = target - consumed;
  const percentage = Math.min(Math.round((consumed / target) * 100), 100) || 0;
  
  // SVG Ring values
  const radius = 60;
  const strokeWidth = 8;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col items-center justify-between h-full min-h-[220px]">
      {/* Background glow */}
      <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-indigo-500/10 blur-2xl"></div>

      <div className="flex w-full items-center justify-between mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Calories Summary</h3>
        <span className="rounded-lg bg-indigo-500/10 p-1.5 text-indigo-400 border border-indigo-500/15">
          <Flame className="h-4 w-4" />
        </span>
      </div>

      <div className="flex w-full flex-row items-center justify-around gap-4 flex-1">
        {/* SVG Circular Progress Ring */}
        <div className="relative flex items-center justify-center">
          <svg className="h-36 w-36 -rotate-90 transform">
            {/* Background Track */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="rgba(255, 255, 255, 0.04)"
              strokeWidth={strokeWidth}
              fill="transparent"
            />
            {/* Progress Stroke */}
            <circle
              cx="72"
              cy="72"
              r={radius}
              stroke="url(#calorieGradient)"
              strokeWidth={strokeWidth}
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-700 ease-out"
            />
            <defs>
              <linearGradient id="calorieGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#10b981" />
              </linearGradient>
            </defs>
          </svg>

          {/* Center Text */}
          <div className="absolute text-center">
            <span className="text-2xl font-extrabold tracking-tight text-white">{consumed}</span>
            <p className="text-[10px] uppercase font-semibold text-slate-500">kcal logged</p>
          </div>
        </div>

        {/* Math Summary */}
        <div className="space-y-3">
          <div>
            <span className="text-xs font-medium text-slate-400">Daily Target</span>
            <p className="text-lg font-bold text-slate-200">{target} <span className="text-xs font-normal text-slate-500">kcal</span></p>
          </div>

          <div className="border-t border-slate-900/80 pt-2">
            <span className="text-xs font-medium text-slate-400">Remaining</span>
            <p
              className={`text-xl font-black ${
                remaining >= 0 ? 'text-emerald-400' : 'text-rose-500'
              }`}
            >
              {remaining >= 0 ? remaining : Math.abs(remaining)}{' '}
              <span className="text-xs font-normal text-slate-500">
                {remaining >= 0 ? 'kcal left' : 'kcal over'}
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalorieCard;
