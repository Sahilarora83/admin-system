import { BrowserRouter as Router, Routes, Route } from "react-router";
import { lazy, Suspense } from "react";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";

// Eagerly load the main dashboard (first paint)
import Home from "./pages/Dashboard/Home";

// Lazy-load all other routes (code splitting)
const NotFound = lazy(() => import("./pages/OtherPage/NotFound"));
const UserProfiles = lazy(() => import("./pages/UserProfiles"));
const Metrics = lazy(() => import("./pages/Metrics"));
const Trends = lazy(() => import("./pages/Trends"));
const Couriers = lazy(() => import("./pages/Couriers"));
const Frauds = lazy(() => import("./pages/Frauds"));
const Delivery = lazy(() => import("./pages/Delivery"));
const Cashflow = lazy(() => import("./pages/Cashflow"));
const Settings = lazy(() => import("./pages/Settings"));
const Notifications = lazy(() => import("./pages/Notifications"));
const Orders = lazy(() => import("./pages/Orders"));

// Minimal skeleton shown while a lazy chunk loads
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/" element={<Home />} />

            {/* Lazy sidebar pages */}
            <Route path="/metrics" element={<Suspense fallback={<PageLoader />}><Metrics /></Suspense>} />
            <Route path="/trends" element={<Suspense fallback={<PageLoader />}><Trends /></Suspense>} />
            <Route path="/couriers" element={<Suspense fallback={<PageLoader />}><Couriers /></Suspense>} />
            <Route path="/frauds" element={<Suspense fallback={<PageLoader />}><Frauds /></Suspense>} />
            <Route path="/delivery" element={<Suspense fallback={<PageLoader />}><Delivery /></Suspense>} />
            <Route path="/cashflow" element={<Suspense fallback={<PageLoader />}><Cashflow /></Suspense>} />
            <Route path="/settings" element={<Suspense fallback={<PageLoader />}><Settings /></Suspense>} />
            <Route path="/profile" element={<Suspense fallback={<PageLoader />}><UserProfiles /></Suspense>} />
            <Route path="/notifications" element={<Suspense fallback={<PageLoader />}><Notifications /></Suspense>} />
            <Route path="/orders" element={<Suspense fallback={<PageLoader />}><Orders /></Suspense>} />
          </Route>

          {/* Fallback Route */}
          <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
        </Routes>
      </Router>
    </>
  );
}
