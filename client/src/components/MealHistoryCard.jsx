import React from 'react';
import { Trash2, ShoppingBag, Eye, Calendar } from 'lucide-react';

const MealHistoryCard = ({ meal, onDelete, showDate = false }) => {
  const {
    _id,
    mealType,
    foodName,
    calories,
    protein,
    carbs,
    fats,
    image,
    barcode,
    createdAt,
  } = meal;

  const dateFormatted = new Date(createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const getMealTypeColor = (type) => {
    switch (type) {
      case 'Breakfast':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'Lunch':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'Dinner':
        return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/25';
      case 'Snacks':
      default:
        return 'bg-rose-500/10 text-rose-400 border-rose-500/25';
    }
  };

  return (
    <div className="glass-panel-hover glass-panel rounded-2xl p-4 flex gap-4 items-center relative overflow-hidden group">
      {/* Food image or avatar placeholder */}
      <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center relative">
        {image ? (
          <img src={image} alt={foodName} className="h-full w-full object-cover group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <div className="text-center font-bold text-slate-700 text-lg uppercase">
            {foodName.charAt(0)}
          </div>
        )}
        
        {/* Offline Badge on image if it's locally saved */}
        {_id.toString().startsWith('local_') && (
          <div className="absolute top-0.5 left-0.5 bg-rose-500 rounded-full h-2 w-2 shadow-[0_0_8px_#f43f5e]" title="Saved locally offline"></div>
        )}
      </div>

      {/* Food Details */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          {/* Meal Category */}
          <span className={`rounded-md border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${getMealTypeColor(mealType)}`}>
            {mealType}
          </span>
          {barcode && (
            <span className="flex items-center gap-0.5 rounded-md border border-slate-800 bg-slate-900 px-1.5 py-0.5 text-[9px] text-slate-500 font-semibold">
              <ShoppingBag className="h-2.5 w-2.5" />
              UPC
            </span>
          )}
          {showDate && (
            <span className="flex items-center gap-1 text-[10px] text-slate-500">
              <Calendar className="h-3 w-3" />
              {dateFormatted}
            </span>
          )}
        </div>

        <h4 className="font-bold text-slate-100 text-sm truncate uppercase tracking-tight">{foodName}</h4>

        {/* Macros summary */}
        <div className="flex items-center gap-3 text-[10px] font-bold uppercase text-slate-400">
          <span className="text-emerald-400">P: <strong className="text-slate-200">{protein}g</strong></span>
          <span className="text-indigo-400">C: <strong className="text-slate-200">{carbs}g</strong></span>
          <span className="text-orange-400">F: <strong className="text-slate-200">{fats}g</strong></span>
        </div>
      </div>

      {/* Caloric stats and controls */}
      <div className="text-right flex flex-col items-end gap-1.5">
        <div>
          <span className="text-lg font-black tracking-tight text-white">{calories}</span>
          <span className="text-[9px] uppercase font-bold text-slate-500 block">kcal</span>
        </div>

        {/* Delete trigger */}
        <button
          onClick={() => onDelete(_id)}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-500/10 hover:text-rose-400 opacity-80 md:opacity-0 group-hover:opacity-100 transition-all duration-200"
          title="Delete Meal entry"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default MealHistoryCard;
