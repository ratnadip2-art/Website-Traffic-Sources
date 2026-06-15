/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Play, Pause, Zap, Flame, Monitor, Smartphone, Tablet } from 'lucide-react';
import { TrafficLog, DeviceType, BrowserType } from '../types';
import { createTrafficLogRecord } from '../data/mockData';

interface SimulationStreamProps {
  onNewLog: (log: TrafficLog) => void;
}

export default function SimulationStream({ onNewLog }: SimulationStreamProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speedMs, setSpeedMs] = useState<number>(2000);
  const [activeUsers, setActiveUsers] = useState<number>(45);
  const [recentLiveLogs, setRecentLiveLogs] = useState<TrafficLog[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fluctuating concurrent active users count for realistic live vibe
  useEffect(() => {
    const userInterval = setInterval(() => {
      setActiveUsers(prev => {
        const offset = Math.floor(Math.random() * 5) - 2; // -2 to +2
        const next = prev + offset;
        return next > 10 ? (next < 150 ? next : 120) : 15;
      });
    }, 4000);
    return () => clearInterval(userInterval);
  }, []);

  // Ticker for generating new live visitor logs when simulator is running
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const newLog = createTrafficLogRecord(new Date());
        
        // Pass to parent so dashboard reflects real-time hits immediately!
        onNewLog(newLog);

        // Keep local historical live log buffer for the ticker ui
        setRecentLiveLogs(prev => [newLog, ...prev.slice(0, 7)]);
      }, speedMs);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, speedMs, onNewLog]);

  const getDeviceIcon = (device: DeviceType) => {
    switch (device) {
      case 'desktop': return <Monitor size={14} className="text-slate-500" />;
      case 'mobile': return <Smartphone size={14} className="text-slate-500" />;
      case 'tablet': return <Tablet size={14} className="text-slate-500" />;
    }
  };

  const getMediumBadgeClass = (medium: string) => {
    switch (medium) {
      case 'organic': return 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/40';
      case 'direct': return 'bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/40';
      case 'referral': return 'bg-cyan-50 dark:bg-cyan-950/20 text-cyan-700 dark:text-cyan-400 border border-cyan-100 dark:border-cyan-900/40';
      case 'social': return 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100 dark:border-amber-900/40';
      case 'email': return 'bg-pink-50 dark:bg-pink-950/20 text-pink-700 dark:text-pink-400 border border-pink-100 dark:border-pink-900/40';
      case 'cpc': return 'bg-violet-50 dark:bg-violet-950/20 text-violet-700 dark:text-violet-400 border border-violet-100 dark:border-violet-900/40';
      default: return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/90 h-full flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-600 dark:bg-rose-950/40 dark:text-rose-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
              </span>
              LIVE STREAM
            </span>
            <h2 className="mt-1 font-sans text-lg font-bold text-slate-800 dark:text-white flex items-center gap-1">
              Active Visitor Stream
            </h2>
          </div>

          <div className="text-right">
            <div className="flex items-center gap-1 font-mono text-2xl font-black text-rose-600 dark:text-rose-400 justify-end">
              <Flame className="fill-rose-100 animate-bounce text-rose-500" size={20} />
              {activeUsers}
            </div>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold dark:text-slate-500">Users Online Now</p>
          </div>
        </div>

        {/* Control toolbar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100/60 dark:border-slate-800/50">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                isPlaying
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-xs'
                  : 'bg-indigo-500 hover:bg-indigo-600 text-white shadow-xs'
              }`}
            >
              {isPlaying ? (
                <>
                  <Pause size={13} className="fill-current" /> Pause
                </>
              ) : (
                <>
                  <Play size={13} className="fill-current" /> Play Sim
                </>
              )}
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-slate-500 font-medium">Frequency:</span>
            <select
              value={speedMs}
              onChange={e => setSpeedMs(Number(e.target.value))}
              disabled={!isPlaying}
              className="px-2 py-1 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-hidden disabled:bg-slate-100/50 dark:disabled:bg-slate-950/20"
            >
              <option value={1000}>High (1 Hit/s)</option>
              <option value={2000}>Std (1 Hit/2s)</option>
              <option value={5000}>Eco (1 Hit/5s)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Dynamic Logs Real-time Ticker Feed */}
      <div className="mt-5 flex-1 min-h-[240px] border border-slate-100 dark:border-slate-800/80 rounded-xl bg-slate-50/25 dark:bg-slate-950/10 p-4 overflow-y-auto">
        {recentLiveLogs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
            <Zap className="text-slate-300 dark:text-slate-700 mb-2 animate-pulse" size={32} />
            <p className="text-xs font-semibold">Ready to Stream Website Visits</p>
            <p className="text-[10px] text-slate-400 mt-1">Incoming live visitor packets will slide in here.</p>
          </div>
        ) : (
          <div className="space-y-3 relative">
            <AnimatePresence initial={false}>
              {recentLiveLogs.map((log) => (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: -16, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  transition={{ duration: 0.35 }}
                  className="rounded-xl border border-slate-100 bg-white p-3 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/90 flex flex-col gap-1 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-mono text-slate-400 dark:text-slate-500">
                      {new Date(log.timestamp).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                    <div className="flex items-center gap-1 bg-slate-100/60 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px] text-slate-500 dark:text-slate-400">
                      {getDeviceIcon(log.device)}
                      <span className="capitalize">{log.device}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-[13px] text-slate-800 dark:text-slate-200">
                        {log.source}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        Page: <span className="text-slate-700 dark:text-slate-300 font-mono">{log.pagePath}</span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${getMediumBadgeClass(log.medium)}`}>
                        {log.medium}
                      </span>
                      
                      {log.converted && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-400 px-1.5 rounded animate-pulse">
                          🎯 {log.conversionType}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <div className="mt-3.5 text-center text-[10px] text-slate-400 dark:text-slate-500">
        Logs automatically propagate. Pausing simulator retains historic logs perfectly.
      </div>
    </div>
  );
}
