/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import { TrafficLog, DeviceType } from '../types';
import { Monitor, Smartphone, Tablet, ChevronRight, BarChart3, PieChart } from 'lucide-react';

interface TrafficChartsProps {
  logs: TrafficLog[];
}

export default function TrafficCharts({ logs }: TrafficChartsProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);
  const chartRef = useRef<HTMLDivElement>(null);

  // Group logs by past days to build trend data (last 7 days by default)
  const getTrendData = () => {
    const counts: { [date: string]: { total: number; conversions: number } } = {};
    const now = new Date();
    
    // Initialize past 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dateString = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      counts[dateString] = { total: 0, conversions: 0 };
    }

    logs.forEach(log => {
      const date = new Date(log.timestamp);
      // Only keep within last 7 days for the main trend trend
      const dateString = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (counts[dateString] !== undefined) {
        counts[dateString].total += 1;
        if (log.converted) {
          counts[dateString].conversions += 1;
        }
      }
    });

    return Object.entries(counts).map(([name, val]) => ({
      name,
      sessions: val.total,
      conversions: val.conversions,
    }));
  };

  const trendData = getTrendData();

  // Group by Channels (Mediums)
  const getChannelData = () => {
    const channels: { [key: string]: number } = {
      organic: 0,
      direct: 0,
      referral: 0,
      social: 0,
      email: 0,
      cpc: 0,
    };
    
    logs.forEach(log => {
      if (channels[log.medium] !== undefined) {
        channels[log.medium]++;
      }
    });

    const total = logs.length || 1;
    return Object.entries(channels)
      .map(([channel, count]) => ({
        channel,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  };

  const channelData = getChannelData();

  // Convert Mediums to user-friendly Channel Name
  const formatMedium = (medium: string) => {
    switch (medium) {
      case 'organic': return 'Organic Search';
      case 'direct': return 'Direct Visit';
      case 'referral': return 'Referral Links';
      case 'social': return 'Social Media';
      case 'email': return 'Email Campaign';
      case 'cpc': return 'Paid Ads (CPC)';
      default: return medium;
    }
  };

  const getMediumColor = (medium: string) => {
    switch (medium) {
      case 'organic': return '#10b981'; // emerald
      case 'direct': return '#6366f1'; // indigo
      case 'referral': return '#06b6d4'; // cyan
      case 'social': return '#f59e0b'; // amber
      case 'email': return '#ec4899'; // pink
      case 'cpc': return '#8b5cf6'; // violet
      default: return '#64748b';
    }
  };

  // Group by Devices
  const getDeviceData = () => {
    const devices: { [key in DeviceType]: number } = { desktop: 0, mobile: 0, tablet: 0 };
    logs.forEach(log => {
      if (devices[log.device] !== undefined) {
        devices[log.device]++;
      }
    });

    const total = logs.length || 1;
    return Object.entries(devices).map(([device, count]) => ({
      device: device as DeviceType,
      count,
      percentage: Math.round((count / total) * 100),
    })).sort((a, b) => b.count - a.count);
  };

  const deviceData = getDeviceData();

  // SVG dimensions for Trend area chart
  const svgWidth = 500;
  const svgHeight = 200;
  const paddingX = 40;
  const paddingY = 20;

  const maxSessions = Math.max(...trendData.map(d => d.sessions), 25);
  const chartMaxVal = Math.ceil(maxSessions * 1.15);

  // Generate SVG coordinates for trend point paths
  const trendPoints = trendData.map((d, index) => {
    const x = paddingX + (index / (trendData.length - 1)) * (svgWidth - paddingX * 2);
    const y = svgHeight - paddingY - (d.sessions / chartMaxVal) * (svgHeight - paddingY * 2);
    return { x, y, ...d };
  });

  const pathD = trendPoints.length > 0
    ? `M ${trendPoints[0].x} ${trendPoints[0].y} ` +
      trendPoints.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ')
    : '';

  const fillD = trendPoints.length > 0
    ? `${pathD} L ${trendPoints[trendPoints.length - 1].x} ${svgHeight - paddingY} L ${trendPoints[0].x} ${svgHeight - paddingY} Z`
    : '';

  // Handle hover interactions over Area charts
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    if (!chartRef.current) return;
    const rect = chartRef.current.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    
    // Find closest index point
    let closestId = 0;
    let minDistance = Infinity;
    
    trendPoints.forEach((p, idx) => {
      const distance = Math.abs(p.x - mouseX);
      if (distance < minDistance) {
        minDistance = distance;
        closestId = idx;
      }
    });

    const point = trendPoints[closestId];
    if (point) {
      setHoveredPoint({
        x: point.x,
        y: point.y,
        label: point.name,
        value: point.sessions,
      });
    }
  };

  // Convert Device keys to visual indicators
  const getDeviceIcon = (device: DeviceType) => {
    switch (device) {
      case 'desktop': return <Monitor size={14} className="text-slate-500 dark:text-slate-400" />;
      case 'mobile': return <Smartphone size={14} className="text-slate-500 dark:text-slate-400" />;
      case 'tablet': return <Tablet size={14} className="text-slate-500 dark:text-slate-400" />;
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      
      {/* 1. Dynamic Area Trend Chart */}
      <div className="lg:col-span-2 rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/90" ref={chartRef}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="flex items-center gap-2 font-sans text-lg font-bold text-slate-800 dark:text-white">
              <BarChart3 size={18} className="text-indigo-500" />
              Traffic Volume Trend
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500">Live aggregated sessions over last 7 days</p>
          </div>
          <div className="flex items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" />
              <span className="text-slate-600 dark:text-slate-300">Sessions</span>
            </span>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto overflow-visible"
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setHoveredPoint(null)}
          >
            <defs>
              <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#6366f1" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((ratio, index) => {
              const y = paddingY + ratio * (svgHeight - paddingY * 2);
              const gridVal = Math.round(chartMaxVal * (1 - ratio));
              return (
                <g key={index} className="opacity-40">
                  <line
                    x1={paddingX}
                    y1={y}
                    x2={svgWidth - paddingX}
                    y2={y}
                    stroke="#cbd5e1"
                    strokeWidth="0.5"
                    strokeDasharray="4 4"
                    className="stroke-slate-200 dark:stroke-slate-800"
                  />
                  <text
                    x={paddingX - 8}
                    y={y + 3}
                    textAnchor="end"
                    fontSize="9"
                    className="fill-slate-400 dark:fill-slate-500 font-mono font-medium"
                  >
                    {gridVal}
                  </text>
                </g>
              );
            })}

            {/* Base line chart paths */}
            {pathD && (
              <>
                {/* Area under line */}
                <path d={fillD} fill="url(#areaGrad)" />
                {/* Line path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="#6366f1"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {/* SVG hover vertical guidelines and circle nodes */}
            {hoveredPoint && (
              <g>
                <line
                  x1={hoveredPoint.x}
                  y1={paddingY}
                  x2={hoveredPoint.x}
                  y2={svgHeight - paddingY}
                  stroke="#818cf8"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                  className="stroke-indigo-400 dark:stroke-indigo-600"
                />
                <circle
                  cx={hoveredPoint.x}
                  cy={hoveredPoint.y}
                  r="6"
                  fill="#ffffff"
                  stroke="#6366f1"
                  strokeWidth="3.5"
                  className="shadow-sm filter drop-shadow-[0_1px_2px_rgba(0,0,0,0.1)] dark:fill-slate-900"
                />
              </g>
            )}

            {/* Chart X-axis Labels */}
            {trendPoints.map((p, index) => (
              <text
                key={index}
                x={p.x}
                y={svgHeight - 4}
                textAnchor="middle"
                fontSize="9"
                className="fill-slate-400 dark:fill-slate-500 font-medium"
              >
                {p.name}
              </text>
            ))}
          </svg>

          {/* Floating custom HTML tooltip relative to SVG coordinates */}
          {hoveredPoint && (
            <div
              className="absolute z-10 p-2.5 bg-slate-950/95 text-white dark:bg-white dark:text-slate-900 rounded-lg shadow-md pointer-events-none text-xs flex flex-col font-sans border border-slate-800/80 dark:border-slate-100"
              style={{
                left: `${(hoveredPoint.x / svgWidth) * 100}%`,
                top: `${(hoveredPoint.y / svgHeight) * 90}%`,
                transform: 'translate(-50%, -115%)',
              }}
            >
              <span className="font-semibold text-slate-400 dark:text-slate-500">{hoveredPoint.label}</span>
              <span className="font-bold text-sm mt-0.5">{hoveredPoint.value} Visitors</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Donut & Metric Distribution of Channels */}
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-xs dark:border-slate-800/80 dark:bg-slate-900/90">
        <div>
          <h2 className="flex items-center gap-2 font-sans text-lg font-bold text-slate-800 dark:text-white">
            <PieChart size={18} className="text-emerald-500" />
            Top Traffic Channels
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Breakdown of mediums driving visits</p>
        </div>

        {/* Channels progress list */}
        <div className="mt-5 space-y-3.5">
          {channelData.map(channel => {
            const barPct = channel.percentage;
            const barCol = getMediumColor(channel.channel);
            return (
              <div key={channel.channel} className="group pr-1">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <span
                      className="h-2.5 w-2.5 rounded-full inline-block"
                      style={{ backgroundColor: barCol }}
                    />
                    {formatMedium(channel.channel)}
                  </span>
                  <div className="space-x-1.5 font-mono text-slate-400 dark:text-slate-500">
                    <span className="text-slate-800 dark:text-slate-200 font-semibold">{channel.count}</span>
                    <span>({barPct}%)</span>
                  </div>
                </div>
                
                {/* Custom animated progress tracks */}
                <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800/80 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700 ease-out"
                    style={{
                      width: `${barPct}%`,
                      backgroundColor: barCol,
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Device breakdown percentages rendering in bottom shelf */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-3.5">Device Split</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            {deviceData.map(dev => (
              <div key={dev.device} className="bg-slate-50/50 dark:bg-slate-800/30 rounded-xl p-2 border border-slate-100/50 dark:border-slate-800/40">
                <div className="flex justify-center mb-1">
                  {getDeviceIcon(dev.device)}
                </div>
                <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 capitalize">{dev.device}</div>
                <div className="text-[10px] font-mono font-medium text-slate-400 mt-0.5">{dev.percentage}%</div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
