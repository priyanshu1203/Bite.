import React from 'react';

const MacroProgress = ({
  carbs = { target: 225, consumed: 0 },
  protein = { target: 150, consumed: 0 },
  fats = { target: 55, consumed: 0 },
}) => {
  const macrosList = [
    {
      name: 'Protein',
      consumed: Math.round(protein.consumed),
      target: Math.round(protein.target),
      color: 'bg-emerald-500',
      glow: 'shadow-emerald-500/20',
      gradient: 'from-emerald-600 to-teal-400',
      unit: 'g',
    },
    {
      name: 'Carbs',
      consumed: Math.round(carbs.consumed),
      target: Math.round(carbs.target),
      color: 'bg-indigo-500',
      glow: 'shadow-indigo-500/20',
      gradient: 'from-indigo-600 to-blue-400',
      unit: 'g',
    },
    {
      name: 'Fats',
      consumed: Math.round(fats.consumed),
      target: Math.round(fats.target),
      color: 'bg-orange-500',
      glow: 'shadow-orange-500/20',
      gradient: 'from-orange-600 to-amber-400',
      unit: 'g',
    },
  ];

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col justify-between h-full min-h-[220px]">
      {/* Background glow */}
      <div className="absolute -left-10 -bottom-10 h-28 w-28 rounded-full bg-emerald-500/5 blur-2xl"></div>

      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Macronutrients Progress</h3>
      </div>

      <div className="space-y-4.5 flex-1 flex flex-col justify-center">
        {macrosList.map((macro) => {
          const percentage = Math.min(Math.round((macro.consumed / macro.target) * 100), 100) || 0;
          return (
            <div key={macro.name} className="space-y-1">
              {/* Labels */}
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-300">{macro.name}</span>
                <span className="text-slate-400">
                  <strong className="text-slate-100">{macro.consumed}</strong> / {macro.target} {macro.unit} ({percentage}%)
                </span>
              </div>
              
              {/* Track */}
              <div className="h-3 w-full rounded-full bg-slate-900 overflow-hidden border border-slate-900">
                {/* Fill */}
                <div
                  style={{ width: `${percentage}%` }}
                  className={`h-full rounded-full bg-gradient-to-r ${macro.gradient} ${macro.glow} shadow-md transition-all duration-700 ease-out`}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MacroProgress;
