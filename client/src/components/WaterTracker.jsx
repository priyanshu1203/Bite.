import { useState } from 'react';
import { Droplet, Plus } from 'lucide-react';

const WaterTracker = ({ current = 0, target = 2000, onAdd }) => {
  const [customAmount, setCustomAmount] = useState('');
  const percentage = Math.min(Math.round((current / target) * 100), 100);

  const handleQuickAdd = (amount) => {
    onAdd(amount);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const val = parseInt(customAmount);
    if (val && val > 0) {
      onAdd(val);
      setCustomAmount('');
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row gap-6 items-center">
      {/* Background glow */}
      <div className="absolute right-0 bottom-0 h-28 w-28 rounded-full bg-blue-500/5 blur-2xl"></div>

      {/* --- VISUAL WATER TANK --- */}
      <div className="relative flex h-36 w-36 flex-shrink-0 items-center justify-center rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner">
        {/* Wave Animation Fill */}
        <div
          style={{ height: `${percentage}%` }}
          className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-sky-600/70 to-sky-400/80 transition-all duration-1000 ease-out"
        >
          {/* Wave Overlay */}
          <div className="absolute -top-[108px] left-1/2 h-[220px] w-[220px] -translate-x-1/2 rounded-[42%] bg-slate-900 animate-wave"></div>
        </div>

        {/* Center Percentage Display */}
        <div className="z-10 text-center">
          <Droplet className="mx-auto h-6 w-6 text-sky-400 drop-shadow-[0_2px_8px_rgba(56,189,248,0.5)] animate-bounce" />
          <span className="text-2xl font-black text-white">{current}</span>
          <span className="text-xs text-sky-200 block">/ {target} ml</span>
          <span className="text-[10px] font-bold text-sky-400 mt-1 block uppercase">{percentage}%</span>
        </div>
      </div>

      {/* --- WATER CONTROL BOARD --- */}
      <div className="flex-1 space-y-4 w-full">
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-400">Daily Water Tracker</h3>
          <p className="text-xs text-slate-500 mt-0.5">Stay hydrated to keep your metabolism functioning optimally.</p>
        </div>

        {/* Quick Add Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleQuickAdd(250)}
            className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-slate-900/60 px-2 py-2.5 text-xs font-semibold text-sky-400 hover:bg-slate-900 hover:text-white border border-slate-900/50 hover:border-sky-500/30 transition-all duration-200"
          >
            <Plus className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">Glass (250ml)</span>
          </button>
          <button
            onClick={() => handleQuickAdd(500)}
            className="flex min-w-0 items-center justify-center gap-1.5 rounded-xl bg-slate-900/60 px-2 py-2.5 text-xs font-semibold text-sky-400 hover:bg-slate-900 hover:text-white border border-slate-900/50 hover:border-sky-500/30 transition-all duration-200"
          >
            <Plus className="h-3.5 w-3.5 flex-shrink-0" />
            <span className="truncate">Bottle (500ml)</span>
          </button>
        </div>

        {/* Custom Volume Input */}
        <form onSubmit={handleCustomSubmit} className="flex gap-2">
          <input
            type="number"
            placeholder="Custom (ml)"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            className="glass-input flex-1 py-1.5 text-xs focus:ring-sky-500/20 focus:border-sky-500"
          />
          <button
            type="submit"
            className="rounded-xl bg-sky-600 px-4 py-2 text-xs font-bold text-white hover:bg-sky-500 hover:shadow-lg hover:shadow-sky-500/20 active:scale-95 transition-all duration-200"
          >
            Log
          </button>
        </form>
      </div>
    </div>
  );
};

export default WaterTracker;
