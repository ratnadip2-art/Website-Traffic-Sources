/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TrafficLog, DeviceType, BrowserType, TrafficMedium } from '../types';
import { generateId } from '../data/mockData';
import { X, Plus, Sparkles, Check } from 'lucide-react';

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (log: TrafficLog) => void;
}

export default function AddLogModal({ isOpen, onClose, onSubmit }: AddLogModalProps) {
  const [source, setSource] = useState<string>('GitHub Sponsors');
  const [medium, setMedium] = useState<TrafficMedium>('referral');
  const [campaign, setCampaign] = useState<string>('developer_sponsorship');
  const [device, setDevice] = useState<DeviceType>('desktop');
  const [browser, setBrowser] = useState<BrowserType>('Chrome');
  const [country, setCountry] = useState<string>('United States');
  const [pagePath, setPagePath] = useState<string>('/pricing');
  const [duration, setDuration] = useState<number>(180);
  const [converted, setConverted] = useState<boolean>(true);
  const [conversionType, setConversionType] = useState<'signup' | 'purchase' | 'newsletter'>('purchase');
  const [bounce, setBounce] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newLog: TrafficLog = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      source,
      medium,
      campaign: campaign.trim() || 'none',
      device,
      browser,
      country,
      pagePath,
      duration: bounce ? Math.floor(2 + Math.random() * 8) : Number(duration),
      converted: !bounce && converted,
      conversionType: (!bounce && converted) ? conversionType : 'none',
      bounce,
    };

    onSubmit(newLog);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Title */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-500">
              <Plus size={16} />
            </span>
            <div>
              <h2 className="font-sans text-base font-bold text-slate-900 dark:text-white">Simulate Custom Referrer Event</h2>
              <p className="text-[10px] text-slate-400 dark:text-slate-500">Inject a custom packet payload into the analytics engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-pointer transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            {/* Source */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Source Name</label>
              <input
                type="text"
                required
                value={source}
                onChange={e => setSource(e.target.value)}
                placeholder="e.g. YouTube, GitHub sponsors, Newsletter"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            {/* Medium */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Medium</label>
              <select
                value={medium}
                onChange={e => setMedium(e.target.value as TrafficMedium)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="organic">organic</option>
                <option value="direct">direct</option>
                <option value="referral">referral</option>
                <option value="social">social</option>
                <option value="email">email</option>
                <option value="cpc">cpc</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Campaign Name */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Campaign (utm_campaign)</label>
              <input
                type="text"
                value={campaign}
                onChange={e => setCampaign(e.target.value)}
                placeholder="e.g. spring_launch_2026"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>

            {/* Country */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Geography / Country</label>
              <input
                type="text"
                required
                value={country}
                onChange={e => setCountry(e.target.value)}
                placeholder="e.g. United States, India, Germany"
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {/* Device */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">DeviceType</label>
              <select
                value={device}
                onChange={e => setDevice(e.target.value as DeviceType)}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
                <option value="tablet">Tablet</option>
              </select>
            </div>

            {/* Browser */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Browser</label>
              <select
                value={browser}
                onChange={e => setBrowser(e.target.value as BrowserType)}
                className="w-full px-2.5 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-hidden"
              >
                <option value="Chrome">Chrome</option>
                <option value="Safari">Safari</option>
                <option value="Firefox">Firefox</option>
                <option value="Edge">Edge</option>
                <option value="Brave">Brave</option>
              </select>
            </div>

            {/* Path */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Landing Path</label>
              <input
                type="text"
                required
                value={pagePath}
                onChange={e => setPagePath(e.target.value)}
                placeholder="e.g. /pricing"
                className="w-full px-2.5 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-hidden font-mono"
              />
            </div>
          </div>

          {/* Behavior Swappers: duration and checkboxes */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100/80 dark:border-slate-850 grid grid-cols-2 gap-4">
            
            {/* Bounce State */}
            <div className="flex items-center gap-2">
              <input
                id="bounce-sw"
                type="checkbox"
                checked={bounce}
                onChange={e => {
                  setBounce(e.target.checked);
                  if (e.target.checked) setConverted(false);
                }}
                className="h-4 w-4 text-rose-500 border-slate-300 rounded-sm"
              />
              <label htmlFor="bounce-sw" className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none cursor-pointer">
                Simulate Immediate Bounce
              </label>
            </div>

            {/* Conversion Toggle (only enabled if not a bounce) */}
            <div className="flex items-center gap-2">
              <input
                id="conv-sw"
                type="checkbox"
                disabled={bounce}
                checked={converted}
                onChange={e => setConverted(e.target.checked)}
                className="h-4 w-4 text-emerald-500 border-slate-300 rounded-sm disabled:opacity-45"
              />
              <label htmlFor="conv-sw" className="text-xs font-semibold text-slate-700 dark:text-slate-300 select-none cursor-pointer disabled:opacity-45">
                Register a Goal Conversion
              </label>
            </div>
          </div>

          {!bounce && (
            <div className="grid grid-cols-2 gap-4 animate-in fade-in duration-100">
              {/* Duration */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Duration spent (seconds)</label>
                <input
                  type="number"
                  required
                  min={1}
                  value={duration}
                  onChange={e => setDuration(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-hidden拧"
                />
              </div>

              {/* Conversion Actions */}
              {converted && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase mb-1">Conversion Type</label>
                  <select
                    value={conversionType}
                    onChange={e => setConversionType(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-700 dark:text-slate-200 rounded-lg focus:outline-hidden"
                  >
                    <option value="signup">Lead Signup Completed</option>
                    <option value="purchase">Software Purchase Completed</option>
                    <option value="newsletter">Joined Newsletter</option>
                  </select>
                </div>
              )}
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-lg bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 text-slate-600 dark:text-slate-300 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm cursor-pointer"
            >
              <Sparkles size={13} />
              Inject Referral Hit
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
