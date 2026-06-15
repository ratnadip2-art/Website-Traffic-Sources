/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { TrafficLog, DeviceType, BrowserType, TrafficMedium } from '../types';
import { Search, Download, Trash2, SlidersHorizontal, ArrowUpDown, Check, RefreshCw, Layers } from 'lucide-react';

interface TrafficTableProps {
  logs: TrafficLog[];
  onClearLogs: () => void;
  onResetLogs: () => void;
}

export default function TrafficTable({ logs, onClearLogs, onResetLogs }: TrafficTableProps) {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedMedium, setSelectedMedium] = useState<string>('all');
  const [selectedDevice, setSelectedDevice] = useState<string>('all');
  const [onlyConverted, setOnlyConverted] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<'timestamp' | 'duration'>('timestamp');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const itemsPerPage = 10;

  // Filter and Search Pipeline
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.pagePath.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.campaign.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesMedium = selectedMedium === 'all' || log.medium === selectedMedium;
    const matchesDevice = selectedDevice === 'all' || log.device === selectedDevice;
    const matchesConversion = !onlyConverted || log.converted;

    return matchesSearch && matchesMedium && matchesDevice && matchesConversion;
  });

  // Sort Pipeline
  const sortedLogs = [...filteredLogs].sort((a, b) => {
    if (sortBy === 'timestamp') {
      const aTime = new Date(a.timestamp).getTime();
      const bTime = new Date(b.timestamp).getTime();
      return sortOrder === 'asc' ? aTime - bTime : bTime - aTime;
    } else {
      return sortOrder === 'asc' ? a.duration - b.duration : b.duration - a.duration;
    }
  });

  // Pagination bounds
  const totalPages = Math.ceil(sortedLogs.length / itemsPerPage) || 1;
  const paginatedLogs = sortedLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleSort = (field: 'timestamp' | 'duration') => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const formatDuration = (sec: number) => {
    if (sec < 60) return `${sec}s`;
    const mins = Math.floor(sec / 60);
    const remainingSec = sec % 60;
    return `${mins}m ${remainingSec}s`;
  };

  const formatTimestamp = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // CSV Exporter
  const downloadLogsCSV = () => {
    const headers = ['ID', 'Timestamp', 'Source', 'Medium', 'Campaign', 'Device', 'Browser', 'Country', 'PagePath', 'Duration', 'Converted', 'ConversionType', 'Bounce'];
    const rows = logs.map((log) => [
      log.id,
      log.timestamp,
      `"${log.source}"`,
      log.medium,
      `"${log.campaign}"`,
      log.device,
      log.browser,
      `"${log.country}"`,
      `"${log.pagePath}"`,
      log.duration,
      log.converted,
      log.conversionType,
      log.bounce,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `traffic_sources_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="traffic-table-panel" className="rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800/80 dark:bg-slate-900/90 overflow-hidden">
      
      {/* Header and Toolbar filter controls */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 font-sans text-lg font-bold text-slate-800 dark:text-white">
            <Layers size={18} className="text-violet-500" />
            Website Traffic Ledger
          </h2>
          <p className="text-xs text-slate-400 dark:text-slate-500">Record journal of simulated and manual visits ({filteredLogs.length} matching)</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={downloadLogsCSV}
            title="Download CSV"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
          >
            <Download size={14} /> Export CSV
          </button>
          
          <button
            onClick={onResetLogs}
            title="Repopulate standard metrics"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-50 hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 hover:text-indigo-600 dark:text-slate-400 border border-slate-100 dark:border-slate-800 transition-colors cursor-pointer"
          >
            <RefreshCw size={14} /> Reset Data
          </button>

          <button
            onClick={onClearLogs}
            title="Wipe table"
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400 border border-rose-100/40 dark:border-rose-900/20 transition-colors cursor-pointer"
          >
            <Trash2 size={14} /> Wipe logs
          </button>
        </div>
      </div>

      {/* Inputs toolbar */}
      <div className="p-4 bg-slate-50/50 dark:bg-slate-800/20 border-b border-slate-100 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Search */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-3.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search source, country, path..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="pl-9 pr-4 py-2 w-full text-xs font-medium border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl focus:border-indigo-500/50 focus:outline-hidden"
          />
        </div>

        {/* Medium category */}
        <div>
          <select
            value={selectedMedium}
            onChange={(e) => {
              setSelectedMedium(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2.5 w-full text-xs font-semibold border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-hidden"
          >
            <option value="all">Channels: All</option>
            <option value="organic">Organic Search</option>
            <option value="direct">Direct</option>
            <option value="referral">Referrals</option>
            <option value="social">Social Media</option>
            <option value="email">Email</option>
            <option value="cpc">CPC Ads</option>
          </select>
        </div>

        {/* Device select */}
        <div>
          <select
            value={selectedDevice}
            onChange={(e) => {
              setSelectedDevice(e.target.value);
              setCurrentPage(1);
            }}
            className="px-3 py-2.5 w-full text-xs font-semibold border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 rounded-xl focus:outline-hidden"
          >
            <option value="all">Devices: All</option>
            <option value="desktop">Desktop</option>
            <option value="mobile">Mobile</option>
            <option value="tablet">Tablet</option>
          </select>
        </div>

        {/* Converted only toggle checkbox card */}
        <div className="flex items-center justify-between px-3.5 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
          <label htmlFor="conv-check" className="text-xs font-semibold text-slate-600 dark:text-slate-300 select-none cursor-pointer">
            Conversions Only
          </label>
          <input
            id="conv-check"
            type="checkbox"
            checked={onlyConverted}
            onChange={(e) => {
              setOnlyConverted(e.target.checked);
              setCurrentPage(1);
            }}
            className="h-4 w-4 text-indigo-600 border-slate-200 dark:border-slate-800 rounded-sm focus:ring-0 cursor-pointer"
          />
        </div>
      </div>

      {/* Main Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 text-[11px] font-semibold uppercase tracking-wider border-b border-slate-100 dark:border-slate-800/80">
              <th className="p-4 pl-6">Source</th>
              <th className="p-4">Medium</th>
              <th className="p-4">Campaign (UTM)</th>
              <th className="p-4 cursor-pointer hover:bg-slate-100/35 dark:hover:bg-slate-800/40" onClick={() => toggleSort('timestamp')}>
                <div className="flex items-center gap-1.5">
                  Timestamp <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="p-4">Geography</th>
              <th className="p-4">Landing Page</th>
              <th className="p-4 cursor-pointer hover:bg-slate-100/35 dark:hover:bg-slate-800/40" onClick={() => toggleSort('duration')}>
                <div className="flex items-center gap-1.5">
                  Duration <ArrowUpDown size={12} />
                </div>
              </th>
              <th className="p-4 pr-6 text-right">Activity Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50 text-xs">
            {paginatedLogs.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-400 dark:text-slate-500 font-medium">
                  No matching website hits detected under current filter selection.
                </td>
              </tr>
            ) : (
              paginatedLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10 transition-colors">
                  {/* Source */}
                  <td className="p-4 pl-6 font-semibold text-slate-800 dark:text-slate-200">
                    {log.source}
                  </td>
                  
                  {/* Medium */}
                  <td className="p-4">
                    <span className="capitalize">{log.medium}</span>
                  </td>

                  {/* Campaign */}
                  <td className="p-4 text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                    {log.campaign === 'none' ? (
                      <span className="text-slate-300 dark:text-slate-700">None</span>
                    ) : (
                      log.campaign
                    )}
                  </td>

                  {/* Timestamp */}
                  <td className="p-4 font-mono text-slate-500">
                    {formatTimestamp(log.timestamp)}
                  </td>

                  {/* Geography */}
                  <td className="p-4">
                    {log.country}
                  </td>

                  {/* Page Path */}
                  <td className="p-4 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                    {log.pagePath}
                  </td>

                  {/* Duration */}
                  <td className="p-4 font-mono">
                    {log.bounce ? (
                      <span className="text-rose-500 font-medium">{formatDuration(log.duration)}</span>
                    ) : (
                      <span className="text-slate-700 dark:text-slate-300">{formatDuration(log.duration)}</span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="p-4 pr-6 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {log.bounce && (
                        <span className="inline-flex rounded-full bg-rose-50 dark:bg-rose-950/20 px-2 py-0.5 text-[10px] font-semibold text-rose-500 uppercase">
                          Bounce
                        </span>
                      )}
                      {log.converted && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-950/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wide border border-emerald-100/30">
                          🎯 {log.conversionType}
                        </span>
                      )}
                      {!log.bounce && !log.converted && (
                        <span className="text-slate-300 dark:text-slate-700 font-mono text-[10px]">Browsed</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination control footer */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/20 dark:bg-slate-950/5 flex items-center justify-between">
        <div className="text-xs text-slate-400 font-medium">
          Showing <span className="text-slate-800 dark:text-slate-200 font-bold">{Math.min(filteredLogs.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredLogs.length, currentPage * itemsPerPage)}</span> of <span className="font-bold">{filteredLogs.length}</span> entries
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(c => Math.max(c - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-45 cursor-pointer"
          >
            Prev
          </button>
          
          {[...Array(totalPages)].map((_, idx) => {
            const index = idx + 1;
            // Only show neighboring numbers to reduce clutter if too many pages
            if (totalPages > 5 && Math.abs(currentPage - index) > 1 && index !== 1 && index !== totalPages) {
              if (index === 2 || index === totalPages - 1) {
                return <span key={index} className="px-1 text-slate-400 font-bold text-xs">...</span>;
              }
              return null;
            }
            return (
              <button
                key={index}
                onClick={() => setCurrentPage(index)}
                className={`h-7 w-7 rounded-lg text-xs font-bold transition-all ${
                  currentPage === index
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {index}
              </button>
            );
          })}

          <button
            onClick={() => setCurrentPage(c => Math.min(c + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-45 cursor-pointer"
          >
            Next
          </button>
        </div>
      </div>

    </div>
  );
}
