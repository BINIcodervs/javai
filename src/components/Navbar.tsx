import React from 'react';
import { Sliders, RefreshCw, Code2, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

interface NavbarProps {
  currentModel: string;
  temperature: number;
  onOpenSettings: () => void;
  onOpenSandbox: () => void;
  onResetChat: () => void;
  hasMessages: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  temperature,
  onOpenSettings,
  onOpenSandbox,
  onResetChat,
  hasMessages,
}) => {
  return (
    <header className="sticky top-4 z-40 px-4 sm:px-6 w-full max-w-5xl mx-auto">
      <motion.div
        initial={{ y: -16, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="vibrant-pill rounded-full px-5 py-3 flex items-center justify-between gap-4"
      >
        {/* Brand Zone */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 via-rose-500 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-orange-500/20">
            <Sparkles className="w-4 h-4 fill-white" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-base font-extrabold tracking-tight text-neutral-900 font-sans">
              Aura <span className="text-orange-600 font-black">Muse</span>
            </span>
            <span className="hidden sm:inline-block text-[11px] font-bold text-neutral-500 tracking-wide uppercase px-2 py-0.5 rounded-full bg-neutral-100 border border-neutral-200">
              Muse Glimmer 30B
            </span>
          </div>
        </div>

        {/* Center: Temperature Display */}
        <button
          onClick={onOpenSettings}
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 text-xs text-neutral-700 font-medium transition-colors cursor-pointer"
          title="Adjust Temperature"
        >
          <span className="w-2 h-2 rounded-full bg-orange-500" />
          <span>Temp:</span>
          <span className="font-mono font-bold text-neutral-900">{temperature.toFixed(2)}</span>
        </button>

        {/* Action Controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onOpenSandbox}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold transition-all shadow-sm shadow-blue-500/20 cursor-pointer"
            title="Open Live Code Sandbox"
            aria-label="Open Code Sandbox"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>Sandbox</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 active:scale-95 text-neutral-800 text-xs font-semibold transition-all cursor-pointer"
            title="Adjust Temperature"
            aria-label="Adjust Temperature"
          >
            <Sliders className="w-3.5 h-3.5 text-neutral-600" />
            <span className="hidden sm:inline">Temp</span>
          </button>

          {hasMessages && (
            <button
              onClick={onResetChat}
              className="p-2 rounded-full bg-neutral-100 hover:bg-rose-100 text-neutral-500 hover:text-rose-600 active:scale-95 transition-all cursor-pointer"
              title="Reset Conversation"
              aria-label="Reset Conversation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </motion.div>
    </header>
  );
};
