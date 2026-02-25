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
        $agg = DB::table('rto_aggregations')->orderBy('date', 'desc')->first();
        return response()->json([
            'total_orders' => $agg->total_orders_today ?? 0,
            'cod_orders' => DB::table('orders')->where('payment_method', 'COD')->count(), // Keep minor one or move to agg
            'rto_orders' => $agg->today_rto ?? 0,
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // 1. RTO Metrics — top KPI cards
    // ──────────────────────────────────────────────────────────────
    public function rtoMetrics(): JsonResponse
    {
        $agg = DB::table('rto_aggregations')->orderBy('date', 'desc')->first();

        if (!$agg) {
            return response()->json([
                ['title' => "Total Orders", 'value' => "0", 'gradient' => "from-purple-100 to-transparent", 'lineColor' => "text-purple-400"],
                ['title' => "COD Orders", 'value' => "0%", 'gradient' => "from-blue-100 to-transparent", 'lineColor' => "text-blue-400"],
                ['title' => "RTO Rate", 'value' => "0%", 'gradient' => "from-purple-100 to-transparent", 'lineColor' => "text-purple-400"],
                ['title' => "RTO Loss", 'value' => "₹0", 'gradient' => "from-indigo-100 to-transparent", 'lineColor' => "text-indigo-400"],
            ]);
        }

        $total = $agg->total_orders_today ?: 1;
        $codOrdersCount = DB::table('orders')->whereDate('ordered_at', $agg->date)->where('payment_method', 'COD')->count();
        $codPct = round(($codOrdersCount / $total) * 100, 1);
        $rtoPct = round(($agg->today_rto / $total) * 100, 1);

        $formattedLoss = $agg->rto_loss_today >= 100000
            ? '₹' . round($agg->rto_loss_today / 100000, 2) . 'L'
            : '₹' . number_format($agg->rto_loss_today);

        return response()->json([
            ['title' => "Total Orders", 'value' => number_format($agg->total_orders_today), 'gradient' => "from-purple-100 to-transparent", 'lineColor' => "text-purple-400"],
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

        if ($customers->isEmpty() && !DB::table('orders')->exists()) {
            return response()->json([]);
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
        $couriers = DB::table('courier_summary')
            ->orderBy('rto_percentage', 'desc')
            ->take(5)
            ->get();

        if ($couriers->isEmpty()) {
            return response()->json([]);
        }

        $colors = ['text-purple-400', 'text-blue-400', 'text-emerald-400', 'text-orange-400', 'text-pink-400'];
        return response()->json($couriers->map(function ($c, $i) use ($colors) {
            $color = $colors[$i % count($colors)];
            return [
                'name' => $c->courier_name,
                'value' => $c->rto_percentage . '%',
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
        $highRiskCount = DB::table('pincode_summary')->where('risk_level', 'high')->count();

        $risky = DB::table('pincode_summary')
            ->where('risk_level', 'high')
            ->orderBy('rto_percentage', 'desc')
            ->take(5)
            ->get();

        return response()->json([
            'highRiskCount' => $highRiskCount,
            'pincodes' => $risky,
            'users' => DB::table('customers')
                ->where('is_fraud', 1)
                ->take(3)
                ->get()
                ->map(fn($u) => [
                    'name' => $u->name,
                    'id' => (string) $u->id,
                    'blocked' => (bool) $u->is_blocked,
                    'avatar' => "/images/user/user-01.jpg"
                ]),
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // 5. Delivery Speed
    // ──────────────────────────────────────────────────────────────
    public function deliverySpeed(): JsonResponse
    {
        $hasData = DB::table('shipments')->exists();
        if (!$hasData) {
            return response()->json([
                'current' => [0, 0, 0, 0, 0],
                'target' => [90, 85, 95, 98, 95],
            ]);
        }

        // ── Calculate metrics for Radar Chart axes: ["Speed", "On-Time", "Returns", "Damage", "Support"] ────
        $summary = DB::table('courier_summary')
            ->select(
                DB::raw('AVG(avg_delivery_days) as avg_days'),
                DB::raw('AVG(100 - rto_percentage) as on_time_score')
            )->first();

        $avgDays = $summary->avg_days ?? 5;
        $speed = max(0, min(100, 100 - ($avgDays - 3) * 10));
        $onTime = $summary->on_time_score ?? 0;

        // Returns (RTO Rate Inverse)
        $total = DB::table('orders')->count();
        $rto = DB::table('orders')->where('status', 'rto')->count();
        $returnsScore = $total > 0 ? max(0, 100 - ($rto / $total * 100)) : 100;

        // Damage & Support (Mocked from risk scores since we don't track damage yet)
        $damage = 95;
        $support = 88;

        return response()->json([
            'current' => [round($speed), round($onTime), round($returnsScore), $damage, $support],
            'target' => [90, 85, 95, 98, 95],
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
        $rtoHigherBy = $totalCOD > 0 ? round(($codRTO / $totalCOD) * 100) . '%' : '0%';
        $amountSaved = number_format($codDelivered);

        return response()->json([
            'zoneCode' => "COD-Analysis",
            'rtoHigherBy' => $rtoHigherBy,
            'amountSaved' => $amountSaved,
        ]);
    }

    // ──────────────────────────────────────────────────────────────
    // 7. RTO Trends (last 8 months)
    // ──────────────────────────────────────────────────────────────
    public function rtoTrends(): JsonResponse
    {
        $aggs = DB::table('rto_aggregations')
            ->orderBy('date', 'desc')
            ->take(8)
            ->get()
            ->reverse();

        $months = [];
        $rtoData = [];
        $codData = [];

        foreach ($aggs as $agg) {
            $months[] = \Carbon\Carbon::parse($agg->date)->format('M d');
            $total = $agg->total_orders_today ?: 1;
            $rtoData[] = round(($agg->today_rto / $total) * 100, 1);
            // approximate COD for trend from agg or minor query
            $codData[] = 65; // stable avg or fetch if stored in agg
        }

        $hasData = $aggs->isNotEmpty();

        $latestAgg = $aggs->last();
        $weeklyRev = $latestAgg->total_orders_today > 0 ? $latestAgg->cod_collected_today * 7 : 0; // heuristic or fix agg
        $rtoLoss = $latestAgg->rto_loss_today ?? 0;

        return response()->json([
            'rto' => $hasData ? $rtoData : [0, 0, 0, 0, 0, 0, 0, 0],
            'cod' => $hasData ? $codData : [0, 0, 0, 0, 0, 0, 0, 0],
            'categories' => $hasData ? $months : ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "August"],
            'stats' => [
                ['label' => 'Weekly Revenue', 'value' => $weeklyRev > 0 ? '₹' . number_format($weeklyRev) : '₹0', 'color' => 'indigo'],
                ['label' => 'RTO Loss', 'value' => $rtoLoss > 0 ? '₹' . number_format($rtoLoss) : '₹0', 'color' => 'pink'],
                ['label' => 'COD Rate', 'value' => '65%', 'color' => 'emerald'],
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

        $hasData = DB::table('orders')->where('status', 'delivered')->exists();

        return response()->json([
            'current' => $hasData ? $current : [0, 0, 0, 0, 0],
            'target' => $hasData ? $target : [0, 0, 0, 0, 0],
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

        $hasData = DB::table('orders')->exists();

        return response()->json([
            'sales' => $hasData ? $sales : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            'revenue' => $hasData ? $revenue : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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

        $hasData = DB::table('orders')->exists();

        return response()->json([
            'sales' => $hasData ? $sales : [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
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

        $hasData = DB::table('orders')->exists();

        return response()->json([
            'historical' => $hasData ? $historical : [0, 0, 0, 0, null, null],
            'predictive' => $hasData ? $predictive : [null, null, null, 0, 0, 0],
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

        if ($couriers->isEmpty() && !DB::table('orders')->exists()) {
            return response()->json([]);
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

    // ──────────────────────────────────────────────────────────────
    // 16. Bot Query (Shield Assistant)
    // ──────────────────────────────────────────────────────────────
    public function botQuery(Request $request): JsonResponse
    {
        $input = strtolower($request->input('message', ''));
        $botMsg = ['text' => "", 'status' => 'neutral', 'actions' => []];

        if (str_contains($input, 'ship') || str_contains($input, 'order') || str_contains($input, 'dispatch')) {
            $count = DB::table('orders')->count();
            $botMsg['text'] = "I've found **{$count} total orders** in your system. You can manage them all on the **Orders** page.";
            $botMsg['actions'][] = ['label' => "Go to Orders", 'type' => "nav", 'payload' => "/ecommerce/orders", 'variant' => "primary"];
        } elseif (str_contains($input, 'rto') || str_contains($input, 'return') || str_contains($input, 'risk')) {
            $rtoCount = DB::table('orders')->where('status', 'rto')->count();
            $riskyPincodes = DB::table('pincodes')->where('risk_level', 'high')->count();
            $botMsg['text'] = "Your system currently has **{$rtoCount} RTO orders**. Also, I've flagged **{$riskyPincodes} high-risk pincodes** that need your attention.";
            $botMsg['status'] = 'warning';
            $botMsg['actions'][] = ['label' => "View Pincode Risk", 'type' => "nav", 'payload' => "/ecommerce/metrics", 'variant' => "danger"];
        } elseif (str_contains($input, 'revenue') || str_contains($input, 'sale') || str_contains($input, 'stat')) {
            $revenue = DB::table('orders')->where('status', 'delivered')->sum('amount');
            $botMsg['text'] = "Your total delivered revenue is **₹" . number_format($revenue) . "**. Would you like to see the detailed sales charts?";
            $botMsg['actions'][] = ['label' => "Check Dashboard", 'type' => "nav", 'payload' => "/", 'variant' => "success"];
        } elseif (str_contains($input, 'fraud') || str_contains($input, 'customer') || str_contains($input, 'block')) {
            $fraudCount = DB::table('customers')->where('is_fraud', 1)->count();
            $botMsg['text'] = "I've identified **{$fraudCount} potentially fraudulent customers**. Most of them have multiple RTO attempts.";
            $botMsg['actions'][] = ['label' => "Review Fraud List", 'type' => "nav", 'payload' => "/frauds", 'variant' => "danger"];
        } else {
            $botMsg['text'] = "I'm Shield Assistant! I can help you find **Real-time Stats**, analyze **RTO Risks**, or track **Shipping Performance**. What would you like to know?";
            $botMsg['actions'][] = ['label' => "Check Stats", 'type' => "api", 'payload' => "/api/dashboard-stats", 'variant' => "secondary"];
        }

        return response()->json($botMsg);
    }

    // ──────────────────────────────────────────────────────────────
    // 17. Demographics (State-wise)
    // ──────────────────────────────────────────────────────────────
    public function demographicStats(): JsonResponse
    {
        $stats = DB::table('orders')
            ->select('state', DB::raw('count(*) as count'))
            ->whereNotNull('state')
            ->where('state', '!=', '')
            ->groupBy('state')
            ->orderByDesc('count')
            ->take(5)
            ->get();

        $total = DB::table('orders')->count();

        return response()->json($stats->map(function ($s) use ($total) {
            $pct = $total > 0 ? round(($s->count / $total) * 100, 1) : 0;
            return [
                'name' => $s->state,
                'count' => $s->count,
                'pct' => $pct,
                'image' => '/images/country/country-05.svg'
            ];
        }));
    }
}
