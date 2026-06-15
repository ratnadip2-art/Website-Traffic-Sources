/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type DeviceType = 'desktop' | 'mobile' | 'tablet';
export type BrowserType = 'Chrome' | 'Safari' | 'Firefox' | 'Edge' | 'Brave';
export type TrafficMedium = 'organic' | 'direct' | 'social' | 'referral' | 'email' | 'cpc';

export interface TrafficLog {
  id: string;
  timestamp: string; // ISO string
  source: string;
  medium: TrafficMedium;
  campaign: string;
  device: DeviceType;
  browser: BrowserType;
  country: string;
  pagePath: string;
  duration: number; // in seconds
  converted: boolean;
  conversionType: 'signup' | 'purchase' | 'newsletter' | 'none';
  bounce: boolean;
}

export interface MetricSummary {
  label: string;
  value: string | number;
  changeValue: number; // positive or negative percentage
  changeType: 'increase' | 'decrease' | 'neutral';
  sparklineData: number[];
}

export interface ChannelPerformance {
  channel: string;
  sessions: number;
  percentage: number;
  conversions: number;
  conversionRate: number;
  bounceRate: number;
  avgDuration: number;
}

export interface GeoPerformance {
  country: string;
  sessions: number;
  percentage: number;
  conversions: number;
}

export interface DevicePerformance {
  device: DeviceType;
  sessions: number;
  percentage: number;
}

export interface DateRange {
  label: string;
  days: number;
}

export interface SimulatorSpeed {
  label: string;
  intervalMs: number;
}
