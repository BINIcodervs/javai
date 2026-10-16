import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Code, Sparkles, Binary, Layers } from 'lucide-react';

interface StarterPromptsProps {
  onSelectPrompt: (promptText: string) => void;
}

export const StarterPrompts: React.FC<StarterPromptsProps> = ({ onSelectPrompt }) => {
  const cards = [
    {
      title: 'Which number is larger, 9.11 or 9.8?',
      subtitle: 'Meta Muse Glimmer Benchmark',
      tag: 'Math & Logic',
      bg: 'bg-[#FFF7ED] hover:bg-[#FFEDD5] border-[#FED7AA] hover:border-[#EA580C]',
      tagBg: 'bg-white text-orange-800 border-orange-200',
      arrowColor: 'text-orange-600',
      icon: Binary,
      iconBg: 'bg-orange-500 text-white',
    },
    {
      title: 'Build an animated spring physics toggle button in React & Tailwind',
      subtitle: 'UI Craft & Physics',
      tag: 'Frontend',
      bg: 'bg-[#EFF6FF] hover:bg-[#DBEAFE] border-[#BFDBFE] hover:border-[#2563EB]',
      tagBg: 'bg-white text-blue-800 border-blue-200',
      arrowColor: 'text-blue-600',
      icon: Sparkles,
      iconBg: 'bg-blue-600 text-white',
    },
    {
      title: 'Refactor an O(N²) nested array search into O(1) hash map lookups',
      subtitle: 'Algorithmic Optimization',
      tag: 'Performance',
      bg: 'bg-[#ECFDF5] hover:bg-[#D1FAE5] border-[#A7F3D0] hover:border-[#059669]',
      tagBg: 'bg-white text-emerald-800 border-emerald-200',
      arrowColor: 'text-emerald-600',
      icon: Code,
      iconBg: 'bg-emerald-600 text-white',
    },
    {
      title: 'Explain JavaScript Event Loop, Tasks, & Microtasks with execution diagrams',
      subtitle: 'Runtime Architecture',
      tag: 'Concepts',
      bg: 'bg-[#F5F3FF] hover:bg-[#EDE9FE] border-[#DDD6FE] hover:border-[#7C3AED]',
      tagBg: 'bg-white text-purple-800 border-purple-200',
      arrowColor: 'text-purple-600',
      icon: Layers,
      iconBg: 'bg-purple-600 text-white',
    },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-8 sm:py-12 px-4">
      {/* Big Expressive 2016-Style Editorial Hero */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="text-center mb-10 sm:mb-12"
      >
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white border border-neutral-200/90 shadow-sm mb-4">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
          <span className="text-xs font-bold text-neutral-800 tracking-wide font-sans">
            Meta Muse Glimmer 30B Studio
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-neutral-900 mb-4 leading-[1.1] font-sans">
          Code in Full Color.{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-rose-500 to-indigo-600">
            Think in High-Def.
          </span>
        </h1>

        <p className="text-base sm:text-lg text-neutral-600 max-w-2xl mx-auto font-sans leading-relaxed">
          The delightful coding workspace. Accurate reasoning, instant interactive code sandbox preview, and tactile temperature control.
        </p>
      </motion.div>

      {/* Grid of 2016 Vibrant Color-Blocked Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {cards.map((c, i) => {
          const IconComponent = c.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.35 }}
              onClick={() => onSelectPrompt(c.title)}
              className={`group p-5 sm:p-6 rounded-3xl border transition-all duration-200 cursor-pointer flex flex-col justify-between shadow-sm hover:shadow-md hover:-translate-y-1 ${c.bg}`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-sm ${c.iconBg}`}>
                      <IconComponent className="w-4 h-4" />
                    </div>
                    <span className={`text-[11px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full border shadow-2xs ${c.tagBg}`}>
                      {c.tag}
                    </span>
                  </div>
                  <div className={`w-7 h-7 rounded-full bg-white flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform ${c.arrowColor}`}>
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>

                <h3 className="text-base sm:text-lg font-extrabold text-neutral-900 group-hover:text-black transition-colors leading-snug">
                  {c.title}
                </h3>
              </div>

              <div className="mt-5 pt-3 border-t border-black/5 flex items-center justify-between text-xs text-neutral-500 font-medium">
                <span>{c.subtitle}</span>
                <span className="font-bold text-neutral-900 group-hover:underline">
                  Ask model &rarr;
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
