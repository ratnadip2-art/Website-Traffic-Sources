# 📊 Referral Source Radar & Traffic Sources Analyzer

An elegant, interactive single-page web application and real-time simulator to analyze website traffic sources, user behavior, UTM-tagged campaigns, conversion statistics, and geographic performance.

This project is fully ready for **GitHub tracking**, **Vercel/Netlify static deployments**, and **interactive simulation sessions**.

## ✨ Key Features

- **Live Activity Simulator Ticker**: Toggle a dynamic simulator that acts as a real-time visitor engine on port 3000. It pumps random, statistically realistic visits into your analytics loop.
- **Micro Animated SVG Sparklines**: High-fidelity, custom-drawn SVG lines render historical spark trends on individual stats cards detailing Sessions, Bounce rates, and Conversion Rate.
- **Interactive SVG Area Charts**: Fully responsive custom-built line graphs with dynamic HTML crosshair overlays tracking user sessions day-by-day.
- **Deep Analytics Ledger Table**: Sort, search, and page through logs. Filter by specific referrers, traffic mediums (`organic`, `direct`, `cpc`, `referral`, `social`, `email`), and device types (`desktop`, `mobile`, `tablet`).
- **Referrer Injection Form**: Manually inject custom referral packets with detailed parameters to test traffic categorization algorithms.
- **Client-Side CSV Exporter**: Download the complete visitor stream ledger as a highly formatted CSV spreadsheet instantly.
- **Zero Heavy Dependencies**: Rely 100% on React 19, Tailwind CSS, and lightweight Lucide icons. High UI build reliability guaranteed with complete immunity to breaking package collisions.

---

## 🛠️ Architecture

The app is decoupled into modular components:

1. **/src/types.ts**: Structural type rules, enums, and metric aggregator contracts.
2. **/src/data/mockData.ts**: Static configuration constants for referral mediums, countries, landing paths, and the dynamic `seedData` back-dated simulator engine.
3. **/src/components/MetricCard.tsx**: Individual statistical nodes decorated with custom responsive SVG sparklines.
4. **/src/components/TrafficCharts.tsx**: Vector-based grid area graphs, channel progress bars, and device split charts.
5. **/src/components/SimulationStream.tsx**: Chronological interactive logs ticker with play/pause velocity controls.
6. **/src/components/TrafficTable.tsx**: Ledger dashboard with multi-column filter search bars, sort indexes, and pagination bounds.
7. **/src/components/AddLogModal.tsx**: Custom packet overlay pop-up.

---

## 🚀 Getting Started

Follow these steps to run the application locally or deploy it to production:

### Prerequisites

Ensure you have **Node.js** (v18 or higher) and **npm** installed on your workstation.

### Local Installation

1. Clone or download the repository contents:
   ```bash
   git clone https://github.com/your-username/website-traffic-sources-analyzer.git
   cd website-traffic-sources-analyzer
   ```

2. Install pre-configured project dependencies:
   ```bash
   npm install
   ```

3. Launch the hot-reloading development server:
   ```bash
   npm run dev
   ```

   The app will run at: `http://localhost:3000`

### Static Production Build

Build the highly optimized client-side static assets (compiled into standard files in the `/dist` directory):

```bash
npm run build
```

You can drag-and-drop or import the `/dist` bundle directly to **Vercel**, **Vite Cloud**, **Netlify**, or **GitHub Pages**.

---

## 🎨 Design System Match

- **Color Palette**: Minimalist high-contrast Canvas (Slate-950 off-white backgrounds with vibrant emerald, indigo, and rose telemetry banners).
- **Typography Selection**: Generous negative space utilizing **Inter** for standard UI elements and **JetBrains Mono** for tracking identifiers.

---

## 📄 License

This software is licensed under the Apache-2.0 License.
