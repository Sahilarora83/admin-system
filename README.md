# RTOShield — Modern E-commerce & RTO Analytics Dashboard

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.0-646CFF?logo=vite)](https://vitejs.dev/)

**RTOShield** is a premium, high-performance admin dashboard designed specifically for e-commerce businesses to track, analyze, and mitigate **RTO (Return to Origin)** risks. Built with the latest tech stack, it offers a seamless, responsive experience across all devices.

---

## 🚀 Key Features

- **Responsive Design**: Fully optimized for Mobile (320px+), Tablet, and Desktop.
- **RTO Analytics**: Specialized charts for RTO Trends, Net Recovery, and Courier Performance.
- **Risk Management**: Geographic risk overview with an interactive Pincode Risk map.
- **Fraud Detection**: Real-time monitoring of high-risk customers and orders.
- **Premium UI**: Crafted with **Tailwind CSS v4** featuring Glassmorphism and smooth micro-animations.
- **Dark Mode**: Native, system-aware dark mode support.
- **Optimized Performance**: Lazy loading, code splitting, and memoized components for < 1s interactions.

## 🛠️ Tech Stack

- **Core**: React 19, TypeScript
- **Styling**: Tailwind CSS v4 (PostCSS)
- **Visuals**: ApexCharts, React-jVectorMap (Custom India Map)
- **Icons**: Custom SVG icons + Lucide-style iconography
- **Build Tool**: Vite (Lightning-fast HMR)
- **Deployment**: Production-ready build with chunk optimization

---

## 📦 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm**: v9.x or higher

### Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/Sahilarora83/admin-system.git
   cd admin-system
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development**
   ```bash
   npm run dev
   ```

4. **Build for Production**
   ```bash
   npm run build
   ```

---

## 📂 Project Structure

```text
src/
├── components/     # Specialized UI & Analytics components
│   ├── ecommerce/  # RTO-specific widgets (Trends, Metrics, Maps)
│   ├── common/     # Reusable UI elements (Tabs, Buttons, Modals)
│   └── header/     # Interactive header components
├── layout/         # Core Page Shell & Sidebar logic
├── pages/          # Full page views with route-based code splitting
└── context/        # Global state (Sidebar, Theme)
```

---

## 🎨 Dashboard Preview

- **Home**: centralized view of RTO Metrics, Trends, and Courier performance.
- **Trends**: Deep dive into historical data.
- **Risk Map**: Interactive geographic analysis of high-risk pincodes.
- **Couriers**: Detailed breakdown of delivery partner performance.

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

Built with ❤️ by [Sahil Arora](https://github.com/Sahilarora83)
