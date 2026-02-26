# RTOShield — Modern E-commerce & RTO Analytics Dashboard

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Laravel](https://img.shields.io/badge/Laravel-8.x-FF2D20?logo=laravel)](https://laravel.com/)
[![MySQL](https://img.shields.io/badge/MySQL-Ready-4479A1?logo=mysql)](https://www.mysql.com/)
[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://admin-system-neon.vercel.app/)

**RTOShield** is a premium, enterprise-grade admin dashboard built for e-commerce businesses to intelligently track, analyze, and mitigate **RTO (Return to Origin)** risks. This complete full-stack solution combines a blazing-fast React 19 frontend with a robust Laravel backend API, featuring real-time analytics, fraud detection, and comprehensive risk management.

🌐 **[Live Demo](https://admin-system-neon.vercel.app/)** | 📖 **[Documentation](./docs)** | 🐛 **[Report Issues](https://github.com/Sahilarora83/admin-system/issues)**

---

## 🚀 Key Features

### 📊 **RTO Analytics Dashboard**
- **Advanced Charting**: RTO Trends, Net Recovery Analysis, and Courier Performance metrics
- **Real-time Dashboards**: Live order status updates and risk assessments
- **Predictive Insights**: Historical data analysis for forecasting

### 🗺️ **Geographic Risk Management**
- **Interactive Pincode Risk Map**: Visual representation of risky zones across India
- **Zone-based Analytics**: Delivery success rates by region
- **Risk Categorization**: Low, Medium, High risk classifications

### 🚨 **Intelligent Fraud Detection**
- **Customer Risk Scoring**: ML-ready framework for identifying high-risk customers
- **Anomaly Detection**: Automatic flagging of suspicious order patterns
- **Real-time Alerts**: Instant notifications for high-risk transactions

### 🎨 **Premium User Interface**
- **Modern Design**: Glassmorphic UI with smooth micro-animations
- **Dark/Light Mode**: Native, system-aware theme switching
- **Responsive**: Fully optimized for desktop, tablet, and mobile
- **Accessibility**: WCAG 2.1 compliant

### ⚡ **Performance Optimized**
- **Vite HMR**: Lightning-fast development experience
- **Code Splitting**: Optimized bundle sizes
- **API Caching**: Smart data caching strategies
- **Production Ready**: Security hardening and CORS configurations

### 🔐 **Merchant & Admin Controls**
- **Role-based Access Control (RBAC)**: Admin, Analyst, and User roles
- **Bulk Operations**: Manage multiple customers/orders at once
- **Data Export**: CSV exports for reporting
- **Audit Logs**: Track all system activities

---

## 🛠️ Tech Stack

### Frontend (`/frontend`)
- **Core**: React 19 + TypeScript 5.0
- **Styling**: Tailwind CSS v4 with custom components
- **Charting**: ApexCharts (dynamic, interactive visualizations)
- **Mapping**: React-jVectorMap (geographic visualizations)
- **State Management**: React Context API
- **Build Tool**: Vite (500ms+ faster than traditional bundlers)
- **HTTP Client**: Axios with interceptors
- **Deployment**: Vercel (serverless functions optional)

### Backend (`/backend-laravel`)
- **Framework**: Laravel 8+ (PHP 8.0+)
- **API Style**: RESTful JSON Architecture
- **Database**: MySQL 8.0 / PostgreSQL 13+
- **ORM**: Eloquent (SQL builder with relations)
- **Middleware**: CORS, Authentication, Sanctum tokens
- **Validation**: Form Request classes
- **Logging**: Monolog with structured logs
- **Mail**: Laravel Mail for notifications

### Database
- **9 Production Tables** with proper indexing
- **Relational Integrity**: Foreign keys and cascading deletes
- **Charsets**: UTF-8 for international support

---

## 📦 Getting Started

### Prerequisites
- **Node.js**: v18.x or higher
- **npm/yarn**: Package manager
- **PHP**: v8.0 or higher
- **Composer**: Dependency manager for PHP
- **MySQL**: v8.0 or PostgreSQL v13+
- **Git**: Version control

### ⚡ Quick Start (5 Minutes)

#### 1. Clone the Repository
```bash
git clone https://github.com/Sahilarora83/admin-system.git
cd admin-system
```

#### 2. Frontend Setup (React)
```bash
cd frontend
npm install
npm run dev
```
✅ Frontend runs on **http://localhost:5174**

#### 3. Backend Setup (Laravel)
Open a **new terminal**:
```bash
cd backend-laravel
composer install
cp .env.example .env
php artisan key:generate
```

#### 4. Database Setup
Import the complete SQL schema:
```bash
# Option 1: Using the complete database file
mysql -u root -p your_database_name < database_complete.sql

# Option 2: Manual import
# a. Create a new database
mysql -u root -p -e "CREATE DATABASE rtoshield;"

# b. Import the SQL file
mysql -u root -p rtoshield < database_complete.sql
```
Or via **phpMyAdmin/MySQL Workbench**: Import `database_complete.sql`

#### 5. Environment Configuration
Edit `backend-laravel/.env`:
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=rtoshield
DB_USERNAME=root
DB_PASSWORD=your_password

# Frontend CORS
FRONTEND_URL=http://localhost:5174

# Mail Configuration (optional)
MAIL_DRIVER=smtp
MAIL_HOST=smtp.mailtrap.io
MAIL_USERNAME=your_email
MAIL_PASSWORD=your_password
```

#### 6. Start Backend
```bash
php artisan serve
```
✅ Backend runs on **http://localhost:8000**

**🎉 Both services are now running!**

---

## 📊 Database Schema

The project includes a **complete, production-ready database** in `database_complete.sql` with:

### Tables Overview

| Table | Purpose | Records |
|-------|---------|---------|
| **users** | Admin accounts & staff | 3 sample users |
| **customers** | Client/merchant profiles | 8 sample customers |
| **couriers** | Logistics partners | 5 couriers (FedEx, DHL, BlueDart, etc.) |
| **pincodes** | Geographic zones & RTO rates | 15 pincode zones |
| **orders** | E-commerce transactions | 12 sample orders |
| **shipments** | Shipment tracking (AWB codes) | 10 shipments |
| **shipment_events** | Delivery tracking events | 8 tracking events |
| **notifications** | User alerts & messages | 5 notifications |
| **pincode_summary** | Zone analytics | 15 aggregated metrics |
| **rto_aggregations** | Monthly RTO stats | 5 monthly reports |

### Key Relationships
```
Orders
├── belongs to Customer
├── belongs to Courier
├── has many Shipments
├── has many ShipmentEvents
└── belongs to Pincode

Shipments
├── belongs to Order
├── has many ShipmentEvents
└── belongs to Courier

Customers
├── has many Orders
└── has risk_level (Low/Medium/High)

Pincodes
├── has many Orders
└── has PincodeSummary
```

---

## 🎯 Frontend Pages & Features

### Dashboard
- **KPI Cards**: Total Orders, RTO Count, Success Rate, Loss Amount
- **RTO Trend Chart**: 12-month historical analysis
- **Courier Performance**: Regional distribution (North/South/East/West)
- **Recent Orders**: Real-time order list with status
- **Geographic Map**: Interactive pincode risk visualization

### Orders
- **Order List**: Filterable, paginated orders
- **Search & Filter**: By Order ID, Customer, Status, Date Range
- **Bulk Actions**: Select multiple orders for operations
- **Order Details**: Full shipment tracking
- **Export**: CSV export for reporting

### Customers
- **Customer List**: All merchants with risk scores
- **Risk Management**: Mark as High/Medium/Low risk
- **Block/Unblock**: Fraud prevention controls
- **Customer Details**: Order history & metrics
- **Bulk Fraud Actions**: Mark multiple customers as fraudulent

### Couriers
- **Performance Metrics**: Real-time statistics
- **Regional Distribution**: Share by zone
- **Historical Data**: Trend analysis
- **Comparison**: Side-by-side courier comparison

### Pincodes
- **Zone Risk Map**: Interactive geographic visualization
- **RTO Analysis**: Percentage by pincode
- **Delivery Rates**: Success metrics by region
- **Performance Trends**: Historical data

### Settings
- **Profile Management**: Edit admin details
- **Theme Settings**: Dark/Light mode toggle
- **Email Notifications**: Notification preferences
- **System Settings**: Global configurations

### Notifications
- **Alert Center**: All system notifications
- **Read/Unread**: Mark notifications
- **Action Links**: Quick navigation to affected items
- **Timestamp**: Precise event timing

---

## ☁️ Deployment Guide

### Step 1: Frontend Deployment (Vercel)

1. **Push to GitHub**:
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Select your GitHub repository
   - Import the project

3. **Configure Settings**:
   - **Root Directory**: `frontend`
   - **Framework**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

4. **Add Environment Variables**:
   ```env
   VITE_API_URL=https://your-backend-api.com
   ```

5. **Deploy**:
   - Click "Deploy"
   - Your app will be live in ~2 minutes
   - Note the Vercel URL (e.g., `https://admin-system-neon.vercel.app`)

### Step 2: Backend Deployment (Render/Railroad/Hostinger)

#### Using Render.com:
1. Create a new **Web Service** on Render
2. Connect your GitHub repository
3. Select `backend-laravel` as root directory
4. **Build Command**: `composer install && php artisan optimize`
5. **Start Command**: `php artisan serve --host=0.0.0.0 --port=8000`
6. Add environment variables:
   ```env
   # Database
   DB_CONNECTION=mysql
   DB_HOST=your-mysql-host
   DB_DATABASE=rtoshield
   DB_USERNAME=admin
   DB_PASSWORD=strong_password

   # Frontend
   FRONTEND_URL=https://your-vercel-app.vercel.app

   # Security
   APP_ENV=production
   APP_DEBUG=false
   APP_KEY=base64:your_key

   # Mail (optional)
   MAIL_DRIVER=smtp
   MAIL_HOST=smtp.gmail.com
   ```

### Step 3: Database Setup (Production)

1. **Create Database on Shared Hosting**:
   - Connect to hosting control panel
   - Create new MySQL database
   - Note credentials

2. **Import Schema**:
   ```bash
   mysql -h your_host -u username -p database_name < database_complete.sql
   ```

3. **Verify Deployment**:
   - Frontend: Visit Vercel URL
   - Backend: Test API: `https://your-api.com/api/orders`
   - Database: Confirm data integrity

---

## 🔌 API Documentation

### Base URL
```
Local: http://localhost:8000/api
Production: https://your-api-domain.com/api
```

### Authentication
All endpoints require `Authorization` header with Bearer token (implement Sanctum):
```http
Authorization: Bearer {token}
```

### Endpoints

#### Orders
```http
GET    /api/orders              - Fetch all orders (with filters)
POST   /api/orders              - Create new order
GET    /api/orders/{id}         - Get order details
PUT    /api/orders/{id}         - Update order
DELETE /api/orders/{id}         - Delete order
POST   /api/orders/{id}/export  - Export order data
```

#### Customers
```http
GET    /api/customers           - Fetch all customers
POST   /api/customers           - Create new customer
GET    /api/customers/{id}      - Get customer details
PUT    /api/customers/{id}      - Update customer
DELETE /api/customers/{id}      - Delete customer
PUT    /api/customers/{id}/block - Block/unblock customer
```

#### Couriers
```http
GET    /api/couriers            - Fetch all couriers
POST   /api/couriers            - Create new courier
GET    /api/couriers/{id}       - Get courier details
PUT    /api/couriers/{id}       - Update performance metrics
```

#### Shipments
```http
GET    /api/shipments           - Fetch all shipments
GET    /api/shipments/{awb}     - Track shipment by AWB code
POST   /api/shipments/{awb}/events - Log tracking event
```

#### Shipment Events
```http
GET    /api/shipment-events     - Fetch all events
POST   /api/shipment-events     - Create event (webhook from courier)
```

#### Pincodes
```http
GET    /api/pincodes            - Fetch all pincodes
GET    /api/pincodes/{pincode}  - Get zone details
GET    /api/pincodes/{id}/summary - Get zone summary/metrics
```

#### Dashboard
```http
GET    /api/dashboard/stats     - KPI cards data
GET    /api/dashboard/charts    - Chart data (RTO trends, etc.)
GET    /api/dashboard/map       - Map data (pincode risks)
```

#### Notifications
```http
GET    /api/notifications       - Fetch user notifications
PUT    /api/notifications/{id}/read - Mark as read
DELETE /api/notifications/{id}  - Delete notification
```

---

## 📁 Project Structure

```text
admin-system/
│
├── frontend/                      # React 19 Application
│   ├── src/
│   │   ├── components/            # Reusable UI components
│   │   ├── pages/                 # Page components (Dashboard, Orders, etc.)
│   │   ├── context/               # React Context for state
│   │   ├── hooks/                 # Custom React hooks
│   │   ├── utils/                 # Utility functions & API calls
│   │   ├── layout/                # Layout components (Sidebar, Header)
│   │   ├── icons/                 # SVG icon components
│   │   ├── App.tsx                # Main app component
│   │   └── main.tsx               # Entry point
│   ├── public/                    # Static assets (images, fonts)
│   ├── index.html                 # HTML template
│   ├── vite.config.ts             # Vite build config & proxy
│   ├── tailwind.config.js         # Tailwind theming
│   ├── postcss.config.js          # PostCSS plugins
│   ├── tsconfig.json              # TypeScript config
│   ├── package.json               # Dependencies & scripts
│   └── eslint.config.js           # ESLint rules
│
├── backend-laravel/               # Laravel 8+ API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/       # API logic (DashboardController, OrderController, etc.)
│   │   │   ├── Middleware/        # CORS, Auth middleware
│   │   │   └── Kernel.php         # Middleware configuration
│   │   ├── Models/                # Eloquent models (User, Order, Customer, etc.)
│   │   ├── Services/              # Business logic (CODRiskService, etc.)
│   │   └── Exceptions/            # Custom exceptions
│   ├── routes/
│   │   ├── api.php                # API routes (v1, v2)
│   │   ├── web.php                # Web routes (if needed)
│   │   └── channels.php           # Broadcasting channels
│   ├── config/
│   │   ├── cors.php               # CORS settings
│   │   ├── database.php           # Database config
│   │   ├── auth.php               # Authentication config
│   │   └── services.php           # Third-party services
│   ├── database/
│   │   ├── database_complete.sql  # ✨ Complete production schema
│   │   ├── init_schema.sql        # Legacy schema file
│   │   ├── migrations/            # Migration files
│   │   ├── factories/             # Faker factories for testing
│   │   └── seeders/               # Database seeders
│   ├── tests/                     # Unit & Feature tests
│   ├── .env                       # Environment variables
│   ├── .env.example               # Example env file
│   ├── artisan                    # Laravel CLI
│   ├── composer.json              # PHP dependencies
│   ├── phpunit.xml                # Test configuration
│   └── server.php                 # Development server
│
├── database_complete.sql          # ✨ Complete SQL schema (NEW)
├── .gitignore                     # Git ignored files
├── LICENSE.md                     # MIT License
├── README.md                      # This file
├── orders_export.csv              # Sample data export
└── vercel.json                    # Vercel deployment config
```

---

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test
```

### Backend Testing
```bash
cd backend-laravel
php artisan test
```

---

## 🤝 Contributing

We welcome contributions! Here's how to get involved:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Commit changes** (`git commit -m 'Add amazing feature'`)
4. **Push to branch** (`git push origin feature/amazing-feature`)
5. **Open a Pull Request**

### Development Guidelines
- Follow PSR-12 for PHP code
- Follow ESLint rules for JavaScript/TypeScript
- Write meaningful commit messages
- Update documentation for new features
- Add tests for new functionality

---

## 🐛 Known Issues & Troubleshooting

### Issue: Vite proxy not connecting to Laravel
**Solution**: Ensure Laravel is running on `http://localhost:8000` and check `vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```

### Issue: CORS errors in production
**Solution**: Update `FRONTEND_URL` in `.env`:
```env
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

### Issue: Database connection failed
**Solution**: Verify MySQL credentials and ensure database exists:
```bash
mysql -u root -p -e "SHOW DATABASES;" | grep rtoshield
```

### Issue: Port 8000 already in use
**Solution**: Use different port:
```bash
php artisan serve --port=8001
```

---

## 📚 Additional Resources

- **React Documentation**: https://react.dev/
- **Laravel Documentation**: https://laravel.com/docs
- **Tailwind CSS**: https://tailwindcss.com/docs
- **TypeScript**: https://www.typescriptlang.org/docs
- **Vite**: https://vitejs.dev/guide

---

## 📄 License

Distributed under the **MIT License**. See [LICENSE.md](LICENSE.md) for more information.

---

## 👨‍💻 Author

**Sahil Arora** - Senior Full-Stack Developer  
- GitHub: [@Sahilarora83](https://github.com/Sahilarora83)
- Email: sahil@rtoshield.com

---

## 🙏 Acknowledgments

- **Tailwind CSS** for the beautiful UI framework
- **React** team for the amazing library
- **Laravel** community for the robust backend framework
- **ApexCharts** for stunning visualizations
- All contributors and supporters!

---

## 💡 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced ML-based fraud detection
- [ ] Shipping API integrations (Shiprocket, Shipium)
- [ ] Real-time WebSocket notifications
- [ ] Advanced reporting & analytics
- [ ] Multi-language support (Hindi, English, Marathi)
- [ ] Advanced permission system
- [ ] API rate limiting & throttling

---

**Built with ❤️ for Indian E-commerce Businesses**

⭐ If you find this project helpful, please consider giving it a star!
*Last Updated: February 26, 2026*
