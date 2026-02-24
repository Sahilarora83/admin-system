# RTOShield — Modern E-commerce & RTO Analytics Dashboard

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Laravel](https://img.shields.io/badge/Laravel-8.x-FF2D20?logo=laravel)](https://laravel.com/)
[![MySQL](https://img.shields.io/badge/MySQL-Ready-4479A1?logo=mysql)](https://www.mysql.com/)

**RTOShield** is a premium, high-performance admin dashboard designed specifically for e-commerce businesses to track, analyze, and mitigate **RTO (Return to Origin)** risks. This repository contains the complete full-stack solution, combining a blazing-fast React frontend with a robust Laravel backend API.

---

## 🚀 Key Features

- **Full-Stack Architecture**: React 19 Frontend powered by a Laravel REST API.
- **RTO Analytics**: Specialized charts for RTO Trends, Net Recovery, and Courier Performance.
- **Risk Management**: Geographic risk overview with an interactive Pincode Risk map.
- **Fraud Detection**: Real-time monitoring of high-risk customers and orders.
- **Premium UI**: Crafted with **Tailwind CSS v4** featuring Glassmorphism and smooth micro-animations.
- **Dark Mode**: Native, system-aware dark mode support.
- **Production Ready**: Optimized frontend builds (Vite) and secure backend configurations (CORS, .env).

---

## 🛠️ Tech Stack

### Frontend (`/frontend`)
- **Core**: React 19, TypeScript
- **Styling**: Tailwind CSS v4
- **Visuals**: ApexCharts, React-jVectorMap
- **Build Tool**: Vite (Lightning-fast HMR)
- **Deployment**: Output to `dist` for Vercel/Netlify

### Backend (`/backend-laravel`)
- **Framework**: Laravel 8+ (PHP)
- **Database**: MySQL / PostgreSQL (Schema provided in `/database/init_schema.sql`)
- **API**: RESTful JSON Controllers

---

## 📦 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **PHP**: v8.0 or higher
- **Composer** (for Laravel)
- **MySQL/PostgreSQL**

### Installation

1. **Clone the Repo**
   ```bash
   git clone https://github.com/Sahilarora83/admin-system.git
   cd admin-system
   ```

### 🖥️ Frontend Setup (React)

Open a terminal and navigate to the frontend folder:
```bash
cd frontend
npm install
npm run dev
```
*Your frontend will run on `http://localhost:5174`*

**To build for production (Vercel):**
```bash
npm run build
```

### ⚙️ Backend Setup (Laravel)

Open a new terminal and navigate to the backend folder:
```bash
cd backend-laravel
composer install
```

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Generate the application key:
   ```bash
   php artisan key:generate
   ```
3. Update `.env` with your database credentials and set `FRONTEND_URL` for CORS.
4. Import the provided SQL schema: `backend-laravel/database/init_schema.sql` into your database.
5. Serve the API locally:
   ```bash
   php artisan serve
   ```
*Your backend will run on `http://localhost:8000` (Make sure Vite proxy points here).*

---

## ☁️ Deployment Guide

### Deploying the Frontend (Vercel)
1. Import the repository into Vercel.
2. Set the Root Directory to **`frontend`**.
3. Framework Preset: **Vite**.
4. Build Command: `npm run build` | Output Directory: `dist`.
5. Deploy.

### Deploying the Backend (Render/Railway/Hostinger)
1. Host the `backend-laravel` code on a PHP-capable server.
2. Link your MySQL database and import `init_schema.sql`.
3. In your production `.env`, set:
   - `APP_ENV=production`
   - `APP_DEBUG=false`
   - `FRONTEND_URL=https://your-vercel-app-url.vercel.app` (To allow API requests).
4. Update your React frontend to fetch from your new live Backend URL instead of local proxy.

---

## 📂 Project Structure

```text
admin-system/
├── frontend/             # React Application
│   ├── src/              # React code, components, pages
│   ├── public/           # Static assets
│   └── vite.config.ts    # Frontend build & proxy config
│
└── backend-laravel/      # Laravel Application
    ├── app/Http/Controllers/  # API Logic (DashboardController)
    ├── routes/           # API Endpoints (api.php)
    ├── config/           # App Configs (cors.php)
    ├── database/         # init_schema.sql
    └── .env              # Environment Variables
```

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

Built with ❤️ by [Sahil Arora](https://github.com/Sahilarora83)
