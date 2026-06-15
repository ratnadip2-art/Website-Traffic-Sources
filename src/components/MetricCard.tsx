/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface MetricCardProps {
  id: string;
  label: string;
  value: string | number;
  changeValue: number;
  changeType: 'increase' | 'decrease' | 'neutral';
  sparklineData: number[];
  colorTheme?: 'indigo' | 'emerald' | 'amber' | 'blue' | 'rose';
}

export default function MetricCard({
  id,
  label,
  value,
  changeValue,
  changeType,
  sparklineData,
  colorTheme = 'indigo',
}: MetricCardProps) {
  // Theme styling configurations
  const themeStyles = {
    indigo: {
      bg: 'from-indigo-50/40 to-indigo-100/10 dark:from-indigo-950/20 dark:to-slate-900/10',
      border: 'hover:border-indigo-400/40 dark:hover:border-indigo-800/40',
      text: 'text-indigo-600 dark:text-indigo-400',
      spark: 'stroke-indigo-500 dark:stroke-indigo-400',
      sparkFill: 'fill-indigo-50/20 dark:fill-indigo-950/10',
    },
    emerald: {
      bg: 'from-emerald-50/40 to-emerald-100/10 dark:from-emerald-950/20 dark:to-slate-900/10',
      border: 'hover:border-emerald-400/40 dark:hover:border-emerald-800/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      spark: 'stroke-emerald-500 dark:stroke-emerald-400',
      sparkFill: 'fill-emerald-50/20 dark:fill-emerald-950/10',
    },
    amber: {
      bg: 'from-amber-50/40 to-amber-100/10 dark:from-amber-950/20 dark:to-slate-900/10',
      border: 'hover:border-amber-400/40 dark:hover:border-amber-800/40',
      text: 'text-amber-600 dark:text-amber-400',
      spark: 'stroke-amber-500 dark:stroke-amber-400',
      sparkFill: 'fill-amber-50/20 dark:fill-amber-950/10',
    },
    blue: {
      bg: 'from-blue-50/40 to-blue-100/10 dark:from-blue-950/20 dark:to-slate-900/10',
      border: 'hover:border-blue-400/40 dark:hover:border-blue-800/40',
      text: 'text-blue-600 dark:text-blue-400',
      spark: 'stroke-blue-500 dark:stroke-blue-400',
      sparkFill: 'fill-blue-50/20 dark:fill-blue-950/10',
    },
    rose: {
      bg: 'from-rose-50/40 to-rose-100/10 dark:from-rose-950/20 dark:to-slate-900/10',
      border: 'hover:border-rose-400/40 dark:hover:border-rose-800/40',
      text: 'text-rose-600 dark:text-rose-400',
      spark: 'stroke-rose-500 dark:stroke-rose-400',
      sparkFill: 'fill-rose-50/20 dark:fill-rose-950/10',
    }
  };

  const currentTheme = themeStyles[colorTheme] || themeStyles.indigo;

  // Render sparkline SVG points
  const width = 120;
  const height = 40;
  const maxVal = Math.max(...sparklineData, 1);
  const minVal = Math.min(...sparklineData, 0);
  const range = maxVal - minVal;

  const points = sparklineData
    .map((val, idx) => {
      const x = (idx / (sparklineData.length - 1)) * width;
      const y = height - 4 - ((val - minVal) / (range || 1)) * (height - 8);
      return `${x},${y}`;
    })
    .join(' ');

  const fillPoints = `${points} ${width},${height} 0,${height}`;

  return (
    <motion.div
      id={`metric-card-${id}`}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={`relative overflow-hidden rounded-2xl border border-slate-100 bg-linear-to-b bg-white p-5 shadow-xs transition-colors dark:border-slate-800/80 dark:bg-slate-900/90 ${currentTheme.bg} ${currentTheme.border}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-[13px] font-medium text-slate-500 uppercase tracking-wider dark:text-slate-400">{label}</span>
        
        {changeType === 'increase' && (
          <div className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400">
            <TrendingUp size={12} className="inline" />
            <span>+{changeValue}%</span>
          </div>
        )}
        {changeType === 'decrease' && (
          <div className="flex items-center gap-1 rounded-full bg-rose-50 px-2 py-0.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/30 dark:text-rose-400">
            <TrendingDown size={12} className="inline" />
            <span>{changeValue}%</span>
          </div>
        )}
        {changeType === 'neutral' && (
          <div className="flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-xs font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
            <Minus size={12} className="inline" />
            <span>{changeValue}%</span>
          </div>
        )}
      </div>

      <div className="mt-3 flex items-end justify-between">
        <div>
          <h3 className="font-sans text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            {value}
          </h3>
          <p className="mt-1 text-[11px] text-slate-400 dark:text-slate-500">vs 30d average</p>
        </div>

        {/* Custom SVG Sparkline */}
        <div className="w-[120px] h-[40px] opacity-80 hover:opacity-100 transition-opacity">
          <svg width={width} height={height}>
            {/* Sparkline Gradient fill */}
            <polyline
              fill="url(#sparkline-grad)"
              className={currentTheme.sparkFill}
              points={fillPoints}
            />
            {/* Sparkline Stroke */}
            <polyline
              fill="none"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={currentTheme.spark}
              points={points}
            />
            <defs>
              <linearGradient id="sparkline-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="currentColor" stopOpacity="0.4" />
                <stop offset="100%" stopColor="currentColor" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    </motion.div>
  );
}
