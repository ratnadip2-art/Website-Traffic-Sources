/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { TrafficLog, DeviceType, BrowserType, TrafficMedium } from '../types';

export const SOURCES_CONFIG = [
  { name: 'Google', medium: 'organic' as TrafficMedium, weight: 35, bounceRate: 0.38, avgDuration: 165, convRate: 0.024 },
  { name: 'Direct', medium: 'direct' as TrafficMedium, weight: 20, bounceRate: 0.45, avgDuration: 130, convRate: 0.035 },
  { name: 'GitHub', medium: 'referral' as TrafficMedium, weight: 12, bounceRate: 0.28, avgDuration: 220, convRate: 0.048 },
  { name: 'LinkedIn', medium: 'social' as TrafficMedium, weight: 8, bounceRate: 0.52, avgDuration: 90, convRate: 0.018 },
  { name: 'Google Ads', medium: 'cpc' as TrafficMedium, weight: 7, bounceRate: 0.58, avgDuration: 65, convRate: 0.030 },
  { name: 'Newsletter', medium: 'email' as TrafficMedium, weight: 6, bounceRate: 0.25, avgDuration: 190, convRate: 0.065 },
  { name: 'Twitter / X', medium: 'social' as TrafficMedium, weight: 5, bounceRate: 0.62, avgDuration: 55, convRate: 0.012 },
  { name: 'Dev.to', medium: 'referral' as TrafficMedium, weight: 3, bounceRate: 0.33, avgDuration: 140, convRate: 0.022 },
  { name: 'Facebook', medium: 'social' as TrafficMedium, weight: 2, bounceRate: 0.65, avgDuration: 45, convRate: 0.008 },
  { name: 'Reddit', medium: 'social' as TrafficMedium, weight: 2, bounceRate: 0.70, avgDuration: 80, convRate: 0.015 },
];

export const COUNTRIES = [
  { name: 'United States', code: 'US', weight: 42 },
  { name: 'India', code: 'IN', weight: 18 },
  { name: 'United Kingdom', code: 'GB', weight: 12 },
  { name: 'Germany', code: 'DE', weight: 8 },
  { name: 'Canada', code: 'CA', weight: 7 },
  { name: 'Japan', code: 'JP', weight: 5 },
  { name: 'Australia', code: 'AU', weight: 4 },
  { name: 'Brazil', code: 'BR', weight: 4 },
];

export const DEVICES: { type: DeviceType; weight: number }[] = [
  { type: 'desktop', weight: 55 },
  { type: 'mobile', weight: 38 },
  { type: 'tablet', weight: 7 },
];

export const BROWSERS: { type: BrowserType; weight: number }[] = [
  { type: 'Chrome', weight: 62 },
  { type: 'Safari', weight: 24 },
  { type: 'Firefox', weight: 8 },
  { type: 'Edge', weight: 4 },
  { type: 'Brave', weight: 2 },
];

export const PAGES = [
  { path: '/', weight: 45, label: 'Homepage' },
  { path: '/blog/getting-started', weight: 20, label: 'Blog - Getting Started' },
  { path: '/features', weight: 15, label: 'Product Features' },
  { path: '/pricing', weight: 12, label: 'Pricing Plans' },
  { path: '/docs', weight: 5, label: 'Documentation' },
  { path: '/signup', weight: 3, label: 'Signup Conversion Page' },
];

export const CAMPAIGNS = ['summer_launch_2026', 'q2_dev_relations', 'saas_blackfriday', 'product_hunt_top1', 'none'];

// Helper to select an item based on cumulative weights
function pickWeighted<T extends { weight: number }>(items: T[]): T {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let random = Math.random() * totalWeight;
  for (const item of items) {
    if (random < item.weight) return item;
    random -= item.weight;
  }
  return items[0];
}

// Generate a random string ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 11);
}

// Generate single traffic log with realistic stats
export function createTrafficLogRecord(timestamp: Date, overrides: Partial<TrafficLog> = {}): TrafficLog {
  const sourceCfg = pickWeighted(SOURCES_CONFIG);
  const countryCfg = pickWeighted(COUNTRIES);
  const deviceCfg = pickWeighted(DEVICES);
  const browserCfg = pickWeighted(BROWSERS);
  const pageCfg = pickWeighted(PAGES);

  // Modify bounce based on source, page and random noise
  const isBounce = Math.random() < sourceCfg.bounceRate;
  
  // Custom duration logic: bounces are shorter, desktop is longer, organic refers to higher duration
  let duration = Math.floor(sourceCfg.avgDuration * (0.4 + Math.random() * 1.2));
  if (isBounce) {
    duration = Math.floor(5 + Math.random() * 15);
  }
  if (deviceCfg.type === 'mobile') {
    duration = Math.floor(duration * 0.85);
  } else if (deviceCfg.type === 'tablet') {
    duration = Math.floor(duration * 0.75);
  }

  // Conversion determination
  const hasConverted = !isBounce && Math.random() < sourceCfg.convRate;
  let convType: 'signup' | 'purchase' | 'newsletter' | 'none' = 'none';

  if (hasConverted) {
    const rand = Math.random();
    if (rand < 0.45) convType = 'signup';
    else if (rand < 0.8) convType = 'newsletter';
    else convType = 'purchase';
  }

  // Campaign UTMs: newsletter usually means email, CPC always has UTM campaigns
  let campaignName = 'none';
  if (sourceCfg.medium === 'email') {
    campaignName = 'newsletter_weekly_q2';
  } else if (sourceCfg.medium === 'cpc') {
    campaignName = 'adwords_target_developer';
  } else if (Math.random() < 0.25) {
    // 25% of other referral traffic uses a campaign
    campaignName = CAMPAIGNS[Math.floor(Math.random() * (CAMPAIGNS.length - 1))];
  }

  // Ensure conversion landing pages list /signup and landing paths
  let actualPath = pageCfg.path;
  if (convType === 'signup' || convType === 'purchase') {
    actualPath = '/signup';
  }

  return {
    id: generateId(),
    timestamp: timestamp.toISOString(),
    source: sourceCfg.name,
    medium: sourceCfg.medium,
    campaign: campaignName,
    device: deviceCfg.type,
    browser: browserCfg.type,
    country: countryCfg.name,
    pagePath: actualPath,
    duration,
    converted: hasConverted,
    conversionType: convType,
    bounce: isBounce,
    ...overrides,
  };
}

// Generate past 30 days of data (e.g., ~450 logs)
export function generateSeedData(): TrafficLog[] {
  const data: TrafficLog[] = [];
  const now = new Date();
  
  // Generate logs with higher density on weekday and specific curves
  for (let i = 0; i < 480; i++) {
    const daysAgo = Math.random() * 30;
    const hour = Math.floor(Math.random() * 24);
    const minute = Math.floor(Math.random() * 60);
    
    const logDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    logDate.setHours(hour, minute, 0, 0);

    // Business curve simulation: fewer visits during weekends
    const isWeekend = logDate.getDay() === 0 || logDate.getDay() === 6;
    if (isWeekend && Math.random() > 0.55) {
      continue; // Skip some weekend traffic for realistic patterns
    }

    data.push(createTrafficLogRecord(logDate));
  }

  // Sort logs: chronological descending
  return data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}
