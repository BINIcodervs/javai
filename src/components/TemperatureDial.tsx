import React from 'react';
import { X, Flame, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getTemperaturePresetLabel } from '../utils/codeParser';

interface TemperatureDialProps {
  isOpen: boolean;
  onClose: () => void;
  temperature: number;
  setTemperature: (val: number) => void;
}

export const TemperatureDial: React.FC<TemperatureDialProps> = ({
  isOpen,
  onClose,
  temperature,
  setTemperature,
}) => {
  if (!isOpen) return null;

  const tempPreset = getTemperaturePresetLabel(temperature);

  const presets = [
    { label: '0.1 Strict', val: 0.1, desc: 'Exact & Deterministic' },
    { label: '0.5 Balanced', val: 0.5, desc: 'Crisp Code & Architecture' },
    { label: '1.0 Default', val: 1.0, desc: 'Muse Glimmer Optimal' },
    { label: '1.4 Creative', val: 1.4, desc: 'Exploratory & Novel' },
    { label: '1.9 Spontaneous', val: 1.9, desc: 'High Entropy Ideas' },
  ];

  // Dynamic vibrant background for temperature
  const getVibrantTheme = (t: number) => {
    if (t <= 0.3) return { bg: 'bg-blue-50 text-blue-700 border-blue-200', bar: 'accent-blue-600', pill: 'bg-blue-600' };
    if (t <= 0.8) return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'accent-emerald-600', pill: 'bg-emerald-600' };
    if (t <= 1.2) return { bg: 'bg-orange-50 text-orange-800 border-orange-200', bar: 'accent-orange-600', pill: 'bg-orange-600' };
    if (t <= 1.6) return { bg: 'bg-purple-50 text-purple-800 border-purple-200', bar: 'accent-purple-600', pill: 'bg-purple-600' };
    return { bg: 'bg-rose-50 text-rose-800 border-rose-200', bar: 'accent-rose-600', pill: 'bg-rose-600' };
  };

  const theme = getVibrantTheme(temperature);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-neutral-900/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 15 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-md bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-neutral-200/80 z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-100 flex items-center justify-center text-orange-600">
                <Flame className="w-5 h-5 fill-orange-500 text-orange-500" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-900 font-sans tracking-tight">
                  Temperature
                </h3>
                <p className="text-xs text-neutral-500 font-sans">
                  Fine-tune cognitive style & randomness
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-100 text-neutral-400 hover:text-neutral-700 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-6 space-y-6">
            {/* Big Vibrant Temperature Readout */}
            <div className={`rounded-2xl p-6 border ${theme.bg} flex flex-col items-center text-center transition-colors duration-300`}>
              <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-500 mb-1">
                Cognitive Temperature
              </span>
              <div className="text-6xl font-black font-sans tracking-tight mb-1 tabular-nums">
                {temperature.toFixed(2)}
              </div>
              <div className="text-base font-bold mb-0.5">
                {tempPreset.title}
              </div>
              <div className="text-xs text-neutral-600 max-w-xs leading-relaxed">
                {tempPreset.hint}
              </div>

              {/* Slider Input */}
              <div className="w-full mt-6">
                <input
                  type="range"
                  min="0"
                  max="2"
                  step="0.05"
                  value={temperature}
                  onChange={(e) => setTemperature(parseFloat(e.target.value))}
                  className={`w-full h-2.5 bg-neutral-200 rounded-lg appearance-none cursor-pointer ${theme.bar}`}
                />
                <div className="flex justify-between text-[11px] font-medium text-neutral-500 mt-2">
                  <span>0.0 (Precise)</span>
                  <span>1.0 (Balanced)</span>
                  <span>2.0 (Spontaneous)</span>
                </div>
              </div>
            </div>

            {/* Quick Preset Buttons */}
            <div>
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider block mb-2">
                Quick Presets
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {presets.map((p) => {
                  const isActive = Math.abs(temperature - p.val) < 0.05;
                  return (
                    <button
                      key={p.val}
                      onClick={() => setTemperature(p.val)}
                      className={`p-2.5 rounded-xl text-left border transition-all cursor-pointer ${
                        isActive
                          ? 'bg-neutral-900 border-neutral-900 text-white shadow-sm'
                          : 'bg-neutral-50 hover:bg-neutral-100 border-neutral-200 text-neutral-700'
                      }`}
                    >
                      <div className="text-xs font-bold">{p.label}</div>
                      <div className={`text-[10px] truncate ${isActive ? 'text-neutral-300' : 'text-neutral-500'}`}>
                        {p.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer Done */}
          <div className="mt-6 pt-4 border-t border-neutral-100 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 active:scale-95 text-white font-medium text-xs tracking-wide shadow-md transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
