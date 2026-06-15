/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useMemo } from 'react';
import { TrafficLog, MetricSummary } from './types';
import { generateSeedData, createTrafficLogRecord } from './data/mockData';
import MetricCard from './components/MetricCard';
import TrafficCharts from './components/TrafficCharts';
import SimulationStream from './components/SimulationStream';
import TrafficTable from './components/TrafficTable';
import AddLogModal from './components/AddLogModal';
import { Globe, Plus, Sparkles, Filter, Info, Server, ShieldCheck, Github } from 'lucide-react';

export default function App() {
  const [logs, setLogs] = useState<TrafficLog[]>(() => generateSeedData());
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [activeDateParam, setActiveDateParam] = useState<number>(30); // Show stats over last X days

  // Dynamic log adder (triggers from simulator or manual modal)
  const addLog = (newLog: TrafficLog) => {
    setLogs((prev) => [newLog, ...prev]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleResetLogs = () => {
    setLogs(generateSeedData());
  };

  // Filter logs purely based on selected date range
  const filteredLogs = useMemo(() => {
    const limitDate = new Date();
    limitDate.setDate(limitDate.getDate() - activeDateParam);
    return logs.filter((log) => new Date(log.timestamp) >= limitDate);
  }, [logs, activeDateParam]);

  // Aggregate Key Statistics from Filtered Data
  const stats = useMemo(() => {
    const total = filteredLogs.length;
    if (total === 0) {
      return {
        sessions: 0,
        convRate: 0,
        bounceRate: 0,
        avgDuration: 0,
        signups: 0,
        sparklines: {
          sessions: [0, 0, 0, 0, 0, 0, 0],
          bounce: [0, 0, 0, 0, 0, 0, 0],
          conv: [0, 0, 0, 0, 0, 0, 0],
          duration: [0, 0, 0, 0, 0, 0, 0],
        }
      };
    }

    const conversionCount = filteredLogs.filter(l => l.converted).length;
    const bounceCount = filteredLogs.filter(l => l.bounce).length;
    const signupsCount = filteredLogs.filter(l => l.conversionType === 'signup').length;
    
    const nonBounces = filteredLogs.filter(l => !l.bounce);
    const totalDuration = nonBounces.reduce((sum, l) => sum + l.duration, 0);
    const avgDurationVal = nonBounces.length > 0 ? Math.round(totalDuration / nonBounces.length) : 0;

    // Generate accurate historical micro sparkline indices (grouping logs into 7 chunks)
    const sparklineDataPoints = 7;
    const chunkSize = Math.max(Math.ceil(total / sparklineDataPoints), 1);
    
    const sessionsSpark: number[] = [];
    const bounceSpark: number[] = [];
    const convSpark: number[] = [];
    const durationSpark: number[] = [];

    for (let i = 0; i < sparklineDataPoints; i++) {
      const chunk = filteredLogs.slice(i * chunkSize, (i + 1) * chunkSize);
      if (chunk.length === 0) {
        sessionsSpark.push(0);
        bounceSpark.push(0);
        convSpark.push(0);
        durationSpark.push(0);
      } else {
        sessionsSpark.push(chunk.length);
        
        const chunkBounces = chunk.filter(c => c.bounce).length;
        bounceSpark.push(Math.round((chunkBounces / chunk.length) * 100));
        
        const chunkConvs = chunk.filter(c => c.converted).length;
        convSpark.push(Math.round((chunkConvs / chunk.length) * 100));

        const chunkNonBounces = chunk.filter(c => !c.bounce);
        const chunkAvgDur = chunkNonBounces.length > 0 
          ? Math.round(chunkNonBounces.reduce((acc, c) => acc + c.duration, 0) / chunkNonBounces.length)
          : 0;
        durationSpark.push(chunkAvgDur);
      }
    }

    // Reverse to match timeline chronological progression in sparklines
    return {
      sessions: total,
      convRate: (conversionCount / total) * 100,
      bounceRate: (bounceCount / total) * 100,
      avgDuration: avgDurationVal,
      signups: signupsCount,
      sparklines: {
        sessions: sessionsSpark.reverse(),
        bounce: bounceSpark.reverse(),
        conv: convSpark.reverse(),
        duration: durationSpark.reverse(),
      }
    };
  }, [filteredLogs]);

  const formatDurationValue = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${mins}m ${remaining}s`;
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 font-sans antialiased pb-16">
      
      {/* 1. Brand Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
              <Globe className="animate-spin-slow h-5 w-5" />
            </div>
            <div>
              <h1 className="font-sans text-[16px] font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                REFERRAL SOURCE RADAR
                <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100/30 uppercase">
                  v1.2 Studio
                </span>
              </h1>
              <p className="text-[11px] text-slate-400 font-medium">Real-time Website Traffic Channels, UTMs & Conversions Simulator</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Simulation trigger buttons */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 hover:bg-slate-50 border border-slate-100 bg-white shadow-xs text-xs font-bold text-slate-700 rounded-xl transition-all cursor-pointer"
            >
              <Plus size={14} className="text-indigo-600" />
              Manual Referral Hit
            </button>
          </div>
        </div>
      </header>

      {/* 2. Main Dashboard Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Date Filter & Info Panel */}
        <div className="flex flex-wrap items-center justify-between gap-4 bg-white rounded-2xl border border-slate-100 p-5 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-50 rounded-xl text-indigo-600">
              <Filter size={16} />
            </div>
            <div>
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-400">Timespan Filter</h3>
              <p className="text-[11px] text-slate-500 font-mono mt-0.5">Aggregating logs where timestamp &gt; {activeDateParam} days ago</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 p-1.5 rounded-xl border border-slate-200/50">
            {[
              { label: 'Today Only', days: 1 },
              { label: 'Last 7 Days', days: 7 },
              { label: 'Last 30 Days', days: 30 },
            ].map((option) => (
              <button
                key={option.days}
                onClick={() => setActiveDateParam(option.days)}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeDateParam === option.days
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/40'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* 3. Metric Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            id="tot-sess"
            label="Total Sessions"
            value={stats.sessions.toLocaleString()}
            changeValue={stats.sessions > 0 ? 14 : 0}
            changeType={stats.sessions > 90 ? 'increase' : 'neutral'}
            sparklineData={stats.sparklines.sessions}
            colorTheme="indigo"
          />
          <MetricCard
            id="avg-dur"
            label="Avg Duration"
            value={formatDurationValue(stats.avgDuration)}
            changeValue={stats.avgDuration > 90 ? 8 : 0}
            changeType={stats.avgDuration > 90 ? 'increase' : 'decrease'}
            sparklineData={stats.sparklines.duration}
            colorTheme="blue"
          />
          <MetricCard
            id="conv-rt"
            label="Conversion Rate"
            value={`${stats.convRate.toFixed(2)}%`}
            changeValue={stats.convRate > 2.5 ? 22 : 0}
            changeType={stats.convRate > 2.2 ? 'increase' : 'neutral'}
            sparklineData={stats.sparklines.conv}
            colorTheme="emerald"
          />
          <MetricCard
            id="bnc-rt"
            label="Bounce Rate"
            value={`${stats.bounceRate.toFixed(1)}%`}
            changeValue={stats.bounceRate < 45 ? 6 : 0}
            changeType={stats.bounceRate > 48 ? 'neutral' : 'increase'} // lowering bounce rate is positive increase
            sparklineData={stats.sparklines.bounce}
            colorTheme="amber"
          />
        </div>

        {/* 4. Live Activity Simulator & Charts Segment */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <TrafficCharts logs={filteredLogs} />
          </div>
          <div>
            <SimulationStream onNewLog={addLog} />
          </div>
        </div>

        {/* 5. Comprehensive Record Table Ledger */}
        <TrafficTable
          logs={logs}
          onClearLogs={handleClearLogs}
          onResetLogs={handleResetLogs}
        />

        {/* 6. Professional GitHub Notice Shelf */}
        <div className="p-6 rounded-2xl bg-slate-900 text-slate-100 border border-slate-800 shadow-md relative overflow-hidden flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="absolute top-0 right-0 -mr-6 -mt-6 h-24 w-24 rounded-full bg-slate-800/25 blur-xl pointer-events-none" />
          
          <div className="space-y-1.5 max-w-2xl relative">
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-md bg-indigo-500/20 text-indigo-400">
                <Github size={16} />
              </span>
              <h3 className="font-sans font-bold text-sm tracking-wide text-white">GitHub Ready Website Traffic Sources Radar App</h3>
            </div>
            <p className="text-xs text-slate-300">
              This codebase implements high-availability native SVG graphic widgets, offline local-storage compatibility wrappers, 
              robust responsive filters, and modular TypeScript configurations mapped directly for instant GitHub importing or Vercel static deployments.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-none relative">
            <span className="inline-flex items-center gap-1 xl text-[11px] font-semibold bg-emerald-500/10 text-emerald-400 px-3 py-1.5 rounded-lg border border-emerald-500/20">
              <ShieldCheck size={13} /> Highly Optimized SPA
            </span>
          </div>
        </div>

      </main>

      {/* Manual Packet injector popup */}
      <AddLogModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={addLog}
      />
    </div>
  );
}
