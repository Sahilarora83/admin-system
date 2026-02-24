<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ShopifyImportController;
use Illuminate\Support\Facades\Route;

Route::get('/dashboard-stats', [DashboardController::class, 'stats']);
Route::get('/rto-metrics', [DashboardController::class, 'rtoMetrics']);
Route::get('/fraud-customers', [DashboardController::class, 'fraudCustomers']);
Route::get('/courier-performance', [DashboardController::class, 'courierPerformance']);
Route::get('/pincode-risk', [DashboardController::class, 'pincodeRisk']);
Route::get('/delivery-speed', [DashboardController::class, 'deliverySpeed']);
Route::get('/cashflow-insights', [DashboardController::class, 'cashflowInsights']);
Route::get('/rto-trends', [DashboardController::class, 'rtoTrends']);
Route::get('/net-recovery', [DashboardController::class, 'netRecovery']);
Route::get('/profile', [DashboardController::class, 'profile']);
Route::get('/statistics', [DashboardController::class, 'statistics']);
Route::get('/monthly-sales', [DashboardController::class, 'monthlySales']);
Route::get('/monthly-target', [DashboardController::class, 'monthlyTarget']);
Route::get('/cashflow-chart', [DashboardController::class, 'cashflowChart']);
Route::get('/delivery-table', [DashboardController::class, 'deliveryTable']);
Route::get('/notifications', [DashboardController::class, 'notifications']);

Route::post('/shopify/import', [ShopifyImportController::class, 'upload']);
