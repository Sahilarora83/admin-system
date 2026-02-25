<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    // ──────────────────────────────────────────────────────────────
    // Generic ping
    // ──────────────────────────────────────────────────────────────
    public function stats(): JsonResponse
    {
        $total = DB::table('orders')->count();
        $cod = DB::table('orders')->where('payment_method', 'COD')->count();
        $rto = DB::table('orders')->where('status', 'rto')->count();
        return response()->json([
            'total_orders' => $total,
            'cod_orders' => $cod,
            'rto_orders' => $rto,
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // 1. RTO Metrics — top KPI cards
    // ──────────────────────────────────────────────────────────────
    public function rtoMetrics(): JsonResponse
    {
        $totalOrders = DB::table('orders')->count();
        $codOrdersCount = DB::table('orders')->where('payment_method', 'COD')->count();
        $rtoOrdersCount = DB::table('orders')->where('status', 'rto')->count();

        // Fallback to demo values when DB is empty
        if ($totalOrders === 0) {
            return response()->json([
                ['title' => "Total Orders", 'value' => "3,450", 'gradient' => "from-purple-100 to-transparent", 'lineColor' => "text-purple-400"],
                ['title' => "COD Orders", 'value' => "65%", 'gradient' => "from-blue-100 to-transparent", 'lineColor' => "text-blue-400"],
                ['title' => "RTO Rate", 'value' => "24.8%", 'gradient' => "from-purple-100 to-transparent", 'lineColor' => "text-purple-400"],
                ['title' => "RTO Loss", 'value' => "₹3.24L", 'gradient' => "from-indigo-100 to-transparent", 'lineColor' => "text-indigo-400"],
            ]);
        }

        $codPct = $totalOrders > 0 ? round(($codOrdersCount / $totalOrders) * 100, 1) : 0;
        $rtoPct = $totalOrders > 0 ? round(($rtoOrdersCount / $totalOrders) * 100, 1) : 0;

        // Avg order amount * rto count = approximate RTO loss
        $avgAmount = DB::table('orders')->avg('amount') ?: 0;
        $rtoLoss = round($rtoOrdersCount * $avgAmount);
        $formattedLoss = $rtoLoss >= 100000
            ? '₹' . round($rtoLoss / 100000, 2) . 'L'
            : '₹' . number_format($rtoLoss);

        return response()->json([
            ['title' => "Total Orders", 'value' => number_format($totalOrders), 'gradient' => "from-purple-100 to-transparent", 'lineColor' => "text-purple-400"],
            ['title' => "COD Orders", 'value' => $codPct . "%", 'gradient' => "from-blue-100 to-transparent", 'lineColor' => "text-blue-400"],
            ['title' => "RTO Rate", 'value' => $rtoPct . "%", 'gradient' => "from-purple-100 to-transparent", 'lineColor' => "text-purple-400"],
            ['title' => "RTO Loss", 'value' => $formattedLoss, 'gradient' => "from-indigo-100 to-transparent", 'lineColor' => "text-indigo-400"],
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // 2. Fraud Customers — highest risk_level customers
    // ──────────────────────────────────────────────────────────────
    public function fraudCustomers(): JsonResponse
    {
        $customers = DB::table('customers')
            ->whereIn('risk_level', ['High', 'Medium'])
            ->orderByRaw("FIELD(risk_level, 'High', 'Medium')")
            ->orderBy('rto_count', 'desc')
            ->take(10)
            ->get();

        if ($customers->isEmpty()) {
            return response()->json([
                ['name' => "Ajay Sharma", 'id' => "21333-22322", 'phone' => "9878542210", 'risk' => "High", 'riskColor' => "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400", 'avatar' => "/images/user/user-01.jpg", 'blocked' => true],
                ['name' => "Priya Malhotra", 'id' => "47943-37221", 'phone' => "8766432109", 'risk' => "Medium", 'riskColor' => "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400", 'avatar' => "/images/user/user-02.jpg", 'blocked' => false],
                ['name' => "Rahul Verma", 'id' => "65087-77908", 'phone' => "9988770655", 'risk' => "High", 'riskColor' => "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400", 'avatar' => "/images/user/user-03.jpg", 'blocked' => false],
            ]);
        }

        return response()->json($customers->map(function ($c) {
            $riskColor = match ($c->risk_level) {
                'High' => "text-red-500 bg-red-50 dark:bg-red-900/20 dark:text-red-400",
                'Low' => "text-green-500 bg-green-50 dark:bg-green-900/20 dark:text-green-400",
                default => "text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 dark:text-yellow-400",
            };
            return [
                'name' => $c->name,
                'id' => $c->id,
                'phone' => $c->phone,
                'risk' => $c->risk_level,
                'riskColor' => $riskColor,
                'avatar' => "/images/user/user-01.jpg",
                'blocked' => (bool) $c->is_blocked,
            ];
        }));
    }

    // ──────────────────────────────────────────────────────────────
    // 3. Courier Performance
    // ──────────────────────────────────────────────────────────────
    public function courierPerformance(): JsonResponse
    {
        $couriers = DB::table('orders')
            ->whereNotNull('courier_name')
            ->select('courier_name', DB::raw('COUNT(*) as total'), DB::raw("SUM(status='rto') as rto_count"))
            ->groupBy('courier_name')
            ->having('total', '>', 0)
            ->get();

        if ($couriers->isEmpty()) {
            return response()->json([
                ['name' => "Delhivery", 'value' => "28%", 'stroke' => "text-purple-400", 'fillColor' => "text-purple-400", 'path' => "M0,35 C15,35 20,15 35,15 C50,15 55,40 70,40 C85,40 90,20 100,20 L100,50 L0,50 Z", 'line' => "M0,35 C15,35 20,15 35,15 C50,15 55,40 70,40 C85,40 90,20 100,20"],
                ['name' => "Blue Dart", 'value' => "17%", 'stroke' => "text-blue-400", 'fillColor' => "text-blue-400", 'path' => "M0,20 C15,20 25,40 40,40 C55,40 65,15 80,15 C90,15 95,25 100,25 L100,50 L0,50 Z", 'line' => "M0,20 C15,20 25,40 40,40 C55,40 65,15 80,15 C90,15 95,25 100,25"],
                ['name' => "Xpressbees", 'value' => "28%", 'stroke' => "text-purple-400", 'fillColor' => "text-purple-400", 'path' => "M0,30 C15,30 20,10 35,10 C50,10 60,40 75,40 C85,40 95,25 100,25 L100,50 L0,50 Z", 'line' => "M0,30 C15,30 20,10 35,10 C50,10 60,40 75,40 C85,40 95,25 100,25"],
            ]);
        }

        $colors = ['text-purple-400', 'text-blue-400', 'text-emerald-400', 'text-orange-400', 'text-pink-400'];
        return response()->json($couriers->values()->map(function ($c, $i) use ($colors) {
            $rtoPct = $c->total > 0 ? round(($c->rto_count / $c->total) * 100) : 0;
            $color = $colors[$i % count($colors)];
            return [
                'name' => $c->courier_name,
                'value' => $rtoPct . '%',
                'stroke' => $color,
                'fillColor' => $color,
                'path' => "M0,35 C15,35 20,15 35,15 C50,15 55,40 70,40 C85,40 90,20 100,20 L100,50 L0,50 Z",
                'line' => "M0,35 C15,35 20,15 35,15 C50,15 55,40 70,40 C85,40 90,20 100,20",
            ];
        }));
    }

    // ──────────────────────────────────────────────────────────────
    // 4. Pincode Risk
    // ──────────────────────────────────────────────────────────────
    public function pincodeRisk(): JsonResponse
    {
        // Compute pincode RTO rates from orders
        $pincodeStats = DB::table('orders')
            ->join('pincodes', 'orders.pincode_id', '=', 'pincodes.id')
            ->select(
                'pincodes.pincode',
                'pincodes.risk_level',
                DB::raw('COUNT(*) as total'),
                DB::raw("SUM(orders.status = 'rto') as rto_count")
            )
            ->groupBy('pincodes.id', 'pincodes.pincode', 'pincodes.risk_level')
            ->orderBy('rto_count', 'desc')
            ->get();

        // Compute and update pincode risk levels
        foreach ($pincodeStats as $ps) {
            $rate = $ps->total > 0 ? ($ps->rto_count / $ps->total) * 100 : 0;
            $risk = $rate > 30 ? 'high' : ($rate > 15 ? 'medium' : 'low');
            DB::table('pincodes')->where('pincode', $ps->pincode)->update([
                'rto_rate' => round($rate, 2),
                'total_orders' => $ps->total,
                'rto_orders' => $ps->rto_count,
                'risk_level' => $risk,
            ]);
        }

        $highRiskCount = DB::table('pincodes')->where('risk_level', 'high')->count();

        // Top risky pincodes with customer info
        $risky = DB::table('pincodes')
            ->where('risk_level', 'high')
            ->orderBy('rto_rate', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'highRiskCount' => $highRiskCount ?: 148,
            'pincodes' => $risky,
            'users' => [
                ['name' => "Ajay Sharma", 'id' => "57985779090", 'blocked' => true, 'avatar' => "/images/user/user-01.jpg"],
                ['name' => "Rahul Verma", 'id' => "97882272066", 'blocked' => false, 'avatar' => "/images/user/user-03.jpg"],
            ],
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // 5. Delivery Speed
    // ──────────────────────────────────────────────────────────────
    public function deliverySpeed(): JsonResponse
    {
        return response()->json([
            'current' => [80, 50, 30, 40, 100],
            'target' => [20, 30, 40, 80, 50],
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // 6. Cashflow Insights
    // ──────────────────────────────────────────────────────────────
    public function cashflowInsights(): JsonResponse
    {
        $codDelivered = DB::table('orders')
            ->where('payment_method', 'COD')
            ->where('status', 'delivered')
            ->sum('amount');

        $codRTO = DB::table('orders')
            ->where('payment_method', 'COD')
            ->where('status', 'rto')
            ->sum('amount');

        $totalCOD = DB::table('orders')->where('payment_method', 'COD')->sum('amount');

        $rtoHigherBy = $totalCOD > 0 ? round(($codRTO / $totalCOD) * 100) . '%' : '34%';
        $amountSaved = number_format($codDelivered - $codRTO);

        return response()->json([
            'zoneCode' => "COD-Zone-A",
            'rtoHigherBy' => $rtoHigherBy,
            'amountSaved' => $amountSaved ?: '1,25,000',
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // 7. RTO Trends (last 8 months)
    // ──────────────────────────────────────────────────────────────
    public function rtoTrends(): JsonResponse
    {
        $months = [];
        $rtoData = [];
        $codData = [];

        for ($i = 7; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $label = $date->format('M');
            $months[] = $label;

            $total = DB::table('orders')->whereYear('ordered_at', $date->year)->whereMonth('ordered_at', $date->month)->count();
            $rto = DB::table('orders')->whereYear('ordered_at', $date->year)->whereMonth('ordered_at', $date->month)->where('status', 'rto')->count();
            $cod = DB::table('orders')->whereYear('ordered_at', $date->year)->whereMonth('ordered_at', $date->month)->where('payment_method', 'COD')->count();

            $rtoData[] = $total > 0 ? round(($rto / $total) * 100, 1) : 0;
            $codData[] = $total > 0 ? round(($cod / $total) * 100, 1) : 0;
        }

        $hasData = array_sum($rtoData) > 0;

        // Weekly revenue from orders
        $weeklyRev = DB::table('orders')
            ->where('ordered_at', '>=', now()->subDays(7))
            ->where('status', 'delivered')
            ->sum('amount');

        $rtoLoss = DB::table('orders')
            ->where('ordered_at', '>=', now()->subDays(7))
            ->where('status', 'rto')
            ->sum('amount');

        $codRate = DB::table('orders')->count() > 0
            ? round((DB::table('orders')->where('payment_method', 'COD')->count() / DB::table('orders')->count()) * 100) . '%'
            : '65%';

        return response()->json([
            'rto' => $hasData ? $rtoData : [1.10, 2.00, 1.40, 1.25, 1.80, 2.40, 2.80, 2.90],
            'cod' => $hasData ? $codData : [1.20, 1.50, 1.30, 1.50, 1.60, 1.90, 2.20, 2.10],
            'categories' => $hasData ? $months : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug"],
            'stats' => [
                ['label' => 'Weekly Revenue', 'value' => $weeklyRev > 0 ? '₹' . number_format($weeklyRev) : '₹4.7L', 'color' => 'indigo'],
                ['label' => 'RTO Loss', 'value' => $rtoLoss > 0 ? '₹' . number_format($rtoLoss) : '₹91,300', 'color' => 'pink'],
                ['label' => 'COD Rate', 'value' => $codRate, 'color' => 'emerald'],
                ['label' => 'Prepaid Rate', 'value' => '35%', 'color' => 'cyan'],
            ],
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // 8. Net Recovery
    // ──────────────────────────────────────────────────────────────
    public function netRecovery(): JsonResponse
    {
        // 5 data points — last 5 months
        $current = [];
        $target = [];
        $cats = [];

        for ($i = 4; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $cats[] = $date->format('M');
            $rev = DB::table('orders')->whereYear('ordered_at', $date->year)->whereMonth('ordered_at', $date->month)->where('status', 'delivered')->sum('amount');
            $current[] = (int) $rev;
            $target[] = (int) ($rev * 1.2); // 20% more than actual = target
        }

        $hasData = array_sum($current) > 0;

        return response()->json([
            'current' => $hasData ? $current : [22500, 24000, 27500, 28000, 30000],
            'target' => $hasData ? $target : [28000, 27000, 27500, 29000, 28500],
            'categories' => $hasData ? $cats : ["Jan", "Apr", "Jun", "Sep", "Dec"],
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // 9. Profile
    // ──────────────────────────────────────────────────────────────
    public function profile(): JsonResponse
    {
        $user = DB::table('users')->first();
        return response()->json([
            'firstName' => $user->first_name ?? 'Sahil',
            'lastName' => $user->last_name ?? 'Admin',
            'email' => $user->email ?? 'admin@rtoshield.com',
            'phone' => $user->phone ?? '+91 98765 43210',
            'bio' => $user->bio ?? 'Team Manager',
            'role' => $user->role ?? 'Team Manager',
            'location' => $user->location ?? 'New Delhi, India',
            'avatar' => $user->avatar ?? '/images/user/user-01.jpg',
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // 10. Statistics (monthly order counts)
    // ──────────────────────────────────────────────────────────────
    public function statistics(): JsonResponse
    {
        $sales = [];
        $revenue = [];
        $cats = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $year = now()->year;

        for ($m = 1; $m <= 12; $m++) {
            $cnt = DB::table('orders')->whereYear('ordered_at', $year)->whereMonth('ordered_at', $m)->count();
            $rev = DB::table('orders')->whereYear('ordered_at', $year)->whereMonth('ordered_at', $m)->where('status', 'delivered')->sum('amount');
            $sales[] = $cnt;
            $revenue[] = (int) ($rev / 1000); // in thousands
        }

        $hasData = array_sum($sales) > 0;

        return response()->json([
            'sales' => $hasData ? $sales : [180, 190, 170, 160, 175, 165, 170, 205, 230, 210, 240, 235],
            'revenue' => $hasData ? $revenue : [40, 30, 50, 40, 55, 40, 70, 100, 110, 120, 150, 140],
            'categories' => $cats,
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // 11. Monthly Sales Bar
    // ──────────────────────────────────────────────────────────────
    public function monthlySales(): JsonResponse
    {
        $sales = [];
        $cats = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        $year = now()->year;

        for ($m = 1; $m <= 12; $m++) {
            $cnt = DB::table('orders')->whereYear('ordered_at', $year)->whereMonth('ordered_at', $m)->count();
            $sales[] = $cnt;
        }

        $hasData = array_sum($sales) > 0;

        return response()->json([
            'sales' => $hasData ? $sales : [168, 385, 201, 298, 187, 195, 291, 110, 215, 390, 280, 112],
            'categories' => $cats,
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // 12. Monthly Target
    // ──────────────────────────────────────────────────────────────
    public function monthlyTarget(): JsonResponse
    {
        $month = now()->month;
        $year = now()->year;
        $revenue = DB::table('orders')->whereYear('ordered_at', $year)->whereMonth('ordered_at', $month)->where('status', 'delivered')->sum('amount');
        $target = DB::table('orders')->whereYear('ordered_at', $year)->whereMonth('ordered_at', $month)->sum('amount') * 1.2;
        $progress = $target > 0 ? round(($revenue / $target) * 100, 2) : 75.55;

        return response()->json([
            'progress' => $progress,
            'todayEarnings' => '₹' . number_format($revenue / max(now()->day, 1), 0),
            'target' => '₹' . ($target > 0 ? number_format($target / 1000) . 'K' : '20K'),
            'revenue' => '₹' . ($revenue > 0 ? number_format($revenue / 1000) . 'K' : '20K'),
            'today' => '₹' . number_format($revenue / max(now()->day, 1), 0),
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // 13. Cashflow Chart
    // ──────────────────────────────────────────────────────────────
    public function cashflowChart(): JsonResponse
    {
        $historical = [];
        $predictive = [null, null, null];

        for ($i = 3; $i >= 0; $i--) {
            $date = now()->subMonths($i);
            $rev = DB::table('orders')->whereYear('ordered_at', $date->year)->whereMonth('ordered_at', $date->month)->where('status', 'delivered')->sum('amount');
            $historical[] = $rev > 0 ? (int) $rev : null;
        }

        // Simple linear projection for next 2 months
        $lastTwo = array_filter(array_slice($historical, -2));
        $avg = count($lastTwo) ? array_sum($lastTwo) / count($lastTwo) : 60000;
        $predictive = [null, null, null, end($historical), (int) ($avg * 1.25), (int) ($avg * 1.5)];
        array_push($historical, null, null);

        $hasData = array_sum(array_filter($historical)) > 0;

        return response()->json([
            'historical' => $hasData ? $historical : [42000, 50000, 47000, 62000, null, null],
            'predictive' => $hasData ? $predictive : [null, null, null, 62000, 78000, 95000],
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // 14. Delivery Table (courier × zone RTO)
    // ──────────────────────────────────────────────────────────────
    public function deliveryTable(): JsonResponse
    {
        // Zone mapping (state → region)
        $northStates = ['Delhi', 'Haryana', 'Punjab', 'Uttar Pradesh', 'Uttarakhand', 'Himachal Pradesh', 'Jammu and Kashmir', 'Rajasthan'];
        $southStates = ['Karnataka', 'Tamil Nadu', 'Kerala', 'Telangana', 'Andhra Pradesh'];
        $westStates = ['Maharashtra', 'Gujarat', 'Goa', 'Madhya Pradesh', 'Chhattisgarh'];
        $eastStates = ['West Bengal', 'Bihar', 'Jharkhand', 'Odisha', 'Assam'];

        $couriers = DB::table('orders')
            ->whereNotNull('courier_name')
            ->select('courier_name')
            ->distinct()
            ->pluck('courier_name');

        if ($couriers->isEmpty()) {
            return response()->json([
                ["name" => "Delhivery", "north" => "24%", "south" => "19%", "west" => "19%", "east" => "38%", "bgNorth" => "bg-blue-300", "bgSouth" => "bg-orange-200", "bgWest" => "bg-orange-200", "bgEast" => "bg-red-300"],
                ["name" => "Blue Dart", "north" => "31%", "south" => "11%", "west" => "18%", "east" => "24%", "bgNorth" => "bg-blue-400", "bgSouth" => "bg-orange-100", "bgWest" => "bg-orange-100", "bgEast" => "bg-red-200"],
                ["name" => "Ecom Express", "north" => "33%", "south" => "23%", "west" => "23%", "east" => "35%", "bgNorth" => "bg-purple-300", "bgSouth" => "bg-orange-300", "bgWest" => "bg-orange-300", "bgEast" => "bg-red-300"],
                ["name" => "Xpressbees", "north" => "22%", "south" => "17%", "west" => "27%", "east" => "30%", "bgNorth" => "bg-blue-300", "bgSouth" => "bg-orange-200", "bgWest" => "bg-orange-200", "bgEast" => "bg-red-300"],
            ]);
        }

        $bgColor = function (float $pct): string {
            if ($pct > 30)
                return "bg-red-300";
            if ($pct > 20)
                return "bg-orange-300";
            if ($pct > 10)
                return "bg-orange-200";
            return "bg-blue-300";
        };

        $getZonePct = function (string $courier, array $states) {
            $total = DB::table('orders')->where('courier_name', $courier)->whereIn('state', $states)->count();
            $rto = DB::table('orders')->where('courier_name', $courier)->whereIn('state', $states)->where('status', 'rto')->count();
            return $total > 0 ? round(($rto / $total) * 100) : 0;
        };

        return response()->json($couriers->map(function ($c) use ($getZonePct, $bgColor, $northStates, $southStates, $westStates, $eastStates) {
            $n = $getZonePct($c, $northStates);
            $s = $getZonePct($c, $southStates);
            $w = $getZonePct($c, $westStates);
            $e = $getZonePct($c, $eastStates);
            return [
                'name' => $c,
                'north' => $n . '%',
                'bgNorth' => $bgColor($n),
                'south' => $s . '%',
                'bgSouth' => $bgColor($s),
                'west' => $w . '%',
                'bgWest' => $bgColor($w),
                'east' => $e . '%',
                'bgEast' => $bgColor($e),
            ];
        }));
    }

    // ──────────────────────────────────────────────────────────────
    // 15. Notifications
    // ──────────────────────────────────────────────────────────────
    public function notifications(): JsonResponse
    {
        $notifications = DB::table('notifications')->orderBy('id', 'desc')->get();
        if ($notifications->isNotEmpty()) {
            return response()->json($notifications->map(fn($n) => [
                "id" => $n->id,
                "name" => "RTOShield System",
                "action" => $n->title,
                "project" => $n->message,
                "time" => "Just now",
                "avatar" => "/images/user/user-01.jpg",
                "status" => $n->is_read ? "offline" : "online",
            ]));
        }

        return response()->json([
            ["id" => 1, "name" => "RTOShield", "action" => "High RTO pincode detected", "project" => "Pincode 110044", "time" => "5 min ago", "avatar" => "/images/user/user-02.jpg", "status" => "online"],
            ["id" => 2, "name" => "RTOShield", "action" => "New COD order flagged", "project" => "Order #OD1812", "time" => "8 min ago", "avatar" => "/images/user/user-03.jpg", "status" => "online"],
            ["id" => 3, "name" => "RTOShield", "action" => "Courier RTO spike", "project" => "Delhivery > 30%", "time" => "15 min ago", "avatar" => "/images/user/user-04.jpg", "status" => "online"],
            ["id" => 4, "name" => "RTOShield", "action" => "COD order delivered", "project" => "Order #OD1803", "time" => "1 hr ago", "avatar" => "/images/user/user-05.jpg", "status" => "offline"],
        ]);
    }
}
