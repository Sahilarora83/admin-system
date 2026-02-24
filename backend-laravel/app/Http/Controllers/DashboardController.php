<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Models\Pincode;
use App\Models\Courier;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    // Generic Dashboard Stats
    public function stats(): JsonResponse
    {
        return response()->json(['total_views' => 1500, 'total_sales' => 2450.50, 'new_users' => 45]);
    }

    // 1. RTO Metrics Endpoint
    public function rtoMetrics(): JsonResponse
    {
        return response()->json([
            ['title' => "Total Orders", 'value' => "3,450", 'gradient' => "from-purple-100 to-transparent", 'lineColor' => "text-purple-400"],
            ['title' => "COD Orders", 'value' => "65%", 'gradient' => "from-blue-100 to-transparent", 'lineColor' => "text-blue-400"],
            ['title' => "RTO Rate", 'value' => "24.8%", 'gradient' => "from-purple-100 to-transparent", 'lineColor' => "text-purple-400"],
            ['title' => "RTO Loss", 'value' => "₹3.24L", 'gradient' => "from-indigo-100 to-transparent", 'lineColor' => "text-indigo-400"],
        ]);
    }

    // 2. Fraud Customers Endpoint
    public function fraudCustomers(): JsonResponse
    {
        return response()->json([
            ['name' => "Ajay Sharma", 'id' => "21333-22322", 'phone' => "9878542210", 'risk' => "High", 'riskColor' => "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400", 'avatar' => "/images/user/user-01.jpg", 'blocked' => true],
            ['name' => "Priya Malhotra", 'id' => "47943-37221", 'phone' => "8766432109", 'risk' => "Medium", 'riskColor' => "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400", 'avatar' => "/images/user/user-02.jpg", 'blocked' => false],
            ['name' => "Rahul Verma", 'id' => "65087-77908", 'phone' => "9988770655", 'risk' => "High", 'riskColor' => "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400", 'avatar' => "/images/user/user-03.jpg", 'blocked' => false]
        ]);
    }

    // 3. Courier Performance Endpoint
    public function courierPerformance(): JsonResponse
    {
        return response()->json([
            ['name' => "Delhivery", 'value' => "28%", 'stroke' => "text-purple-400", 'fillColor' => "text-purple-400", 'path' => "M0,35 C15,35 20,15 35,15 C50,15 55,40 70,40 C85,40 90,20 100,20 L100,50 L0,50 Z", 'line' => "M0,35 C15,35 20,15 35,15 C50,15 55,40 70,40 C85,40 90,20 100,20"],
            ['name' => "Blue Dart", 'value' => "17%", 'stroke' => "text-blue-400", 'fillColor' => "text-blue-400", 'path' => "M0,20 C15,20 25,40 40,40 C55,40 65,15 80,15 C90,15 95,25 100,25 L100,50 L0,50 Z", 'line' => "M0,20 C15,20 25,40 40,40 C55,40 65,15 80,15 C90,15 95,25 100,25"],
            ['name' => "Xpressbees", 'value' => "28%", 'stroke' => "text-purple-400", 'fillColor' => "text-purple-400", 'path' => "M0,30 C15,30 20,10 35,10 C50,10 60,40 75,40 C85,40 95,25 100,25 L100,50 L0,50 Z", 'line' => "M0,30 C15,30 20,10 35,10 C50,10 60,40 75,40 C85,40 95,25 100,25"]
        ]);
    }

    // 4. Pincode Risk Endpoint
    public function pincodeRisk(): JsonResponse
    {
        return response()->json([
            'highRiskCount' => 148,
            'users' => [
                ['name' => "Ajay Sharma", 'id' => "57985779090", 'blocked' => true, 'avatar' => "/images/user/user-01.jpg"],
                ['name' => "Rahul Verma", 'id' => "97882272066", 'blocked' => false, 'avatar' => "/images/user/user-03.jpg"]
            ]
        ]);
    }

    // 5. Delivery Speed Endpoint
    public function deliverySpeed(): JsonResponse
    {
        return response()->json([
            'current' => [80, 50, 30, 40, 100],
            'target' => [20, 30, 40, 80, 50]
        ]);
    }

    // 6. Cashflow Insights Endpoint
    public function cashflowInsights(): JsonResponse
    {
        return response()->json([
            'zoneCode' => "1A1-Ins57+",
            'rtoHigherBy' => "34%",
            'amountSaved' => "1,25,000"
        ]);
    }

    // 7. RTO Trends Endpoint
    public function rtoTrends(): JsonResponse
    {
        return response()->json([
            'rto' => [1.10, 2.00, 1.40, 1.25, 1.80, 2.40, 2.80, 2.90],
            'cod' => [1.20, 1.50, 1.30, 1.50, 1.60, 1.90, 2.20, 2.10],
            'categories' => ["1:00 PM", "6:00 PM", "8:00 PM", "10:00 PM", "12:00 PM", "8:10 PM", "1:00 PM", "12:33 PM"],
            'stats' => [
                ['label' => 'Weekly Revenue', 'value' => '₹4.7L', 'color' => 'indigo'],
                ['label' => 'RTO Loss', 'value' => '₹91,300', 'color' => 'pink'],
                ['label' => 'COD Rate', 'value' => '65%', 'color' => 'emerald'],
                ['label' => 'Prepaid Rate', 'value' => '35%', 'color' => 'cyan']
            ]
        ]);
    }

    // 8. Net Recovery Endpoint
    public function netRecovery(): JsonResponse
    {
        return response()->json([
            'current' => [22500, 24000, 27500, 28000, 30000],
            'target' => [28000, 27000, 27500, 29000, 28500],
            'categories' => ["1:00 PM", "4:00 PM", "12:00 PM", "23:00 PM", "12:00 PM"],
        ]);
    }

    // 9. Profile Endpoint
    public function profile(): JsonResponse
    {
        return response()->json([
            'firstName' => 'Sahil',
            'lastName' => 'Admin',
            'email' => 'admin@rtoshield.com',
            'phone' => '+91 98765 43210',
            'bio' => 'Team Manager',
            'role' => 'Team Manager',
            'location' => 'New Delhi, India',
            'avatar' => '/images/user/user-01.jpg'
        ]);
    }

    // 10. Statistics (Months)
    public function statistics(): JsonResponse
    {
        return response()->json([
            'sales' => [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
            'revenue' => [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
            'categories' => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        ]);
    }

    // 11. Monthly Sales Bar Chart
    public function monthlySales(): JsonResponse
    {
        return response()->json([
            'sales' => [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
            'categories' => ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
        ]);
    }

    // 12. Monthly Target Progress
    public function monthlyTarget(): JsonResponse
    {
        return response()->json([
            'progress' => 75.55,
            'todayEarnings' => '$3,287',
            'target' => '$20K',
            'revenue' => '$20K',
            'today' => '$20K'
        ]);
    }

    // 13. Cashflow Chart Data
    public function cashflowChart(): JsonResponse
    {
        return response()->json([
            'historical' => [42000, 50000, 47000, 62000, null, null],
            'predictive' => [null, null, null, 62000, 78000, 95000]
        ]);
    }

    // 14. Delivery Table Data
    public function deliveryTable(): JsonResponse
    {
        return response()->json([
            ["name" => "Delhivery", "north" => "24%", "south" => "19%", "west" => "19%", "east" => "38%", "bgNorth" => "bg-blue-300", "bgSouth" => "bg-orange-200", "bgWest" => "bg-orange-200", "bgEast" => "bg-red-300"],
            ["name" => "Blue Dart", "north" => "31%", "south" => "11%", "west" => "18%", "east" => "24%", "bgNorth" => "bg-blue-400", "bgSouth" => "bg-orange-100", "bgWest" => "bg-orange-100", "bgEast" => "bg-red-200"],
            ["name" => "Ecom Express", "north" => "33%", "south" => "23%", "west" => "23%", "east" => "35%", "bgNorth" => "bg-purple-300", "bgSouth" => "bg-orange-300", "bgWest" => "bg-orange-300", "bgEast" => "bg-red-300"],
            ["name" => "Xpressbees", "north" => "22%", "south" => "17%", "west" => "27%", "east" => "30%", "bgNorth" => "bg-blue-300", "bgSouth" => "bg-orange-200", "bgWest" => "bg-orange-200", "bgEast" => "bg-red-300"]
        ]);
    }
    // 15. Notifications Data
    public function notifications(): JsonResponse
    {
        return response()->json([
            ["id" => 1, "name" => "Terry Franci", "action" => "requests permission to change", "project" => "Project - Nganter App", "time" => "5 min ago", "avatar" => "/images/user/user-02.jpg", "status" => "online"],
            ["id" => 2, "name" => "Alena Franci", "action" => "requests permission to change", "project" => "Project - Nganter App", "time" => "8 min ago", "avatar" => "/images/user/user-03.jpg", "status" => "online"],
            ["id" => 3, "name" => "Jocelyn Kenter", "action" => "requests permission to change", "project" => "Project - Nganter App", "time" => "15 min ago", "avatar" => "/images/user/user-04.jpg", "status" => "online"],
            ["id" => 4, "name" => "Brandon Philips", "action" => "requests permission to change", "project" => "Project - Nganter App", "time" => "1 hr ago", "avatar" => "/images/user/user-05.jpg", "status" => "offline"]
        ]);
    }
}
