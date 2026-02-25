<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     *
     * @param  \Illuminate\Console\Scheduling\Schedule  $schedule
     * @return void
     */
    protected function schedule(Schedule $schedule)
    {
        // Nightly aggregation at 1:00 AM — updates RTO stats, pincode summary, courier summary
        $schedule->command('rto:aggregate')->dailyAt('01:00');

        // Every 30 min — fallback tracking sync for shipments without recent webhook
        $schedule->call(function () {
            app(\App\Http\Controllers\ShiprocketController::class)->syncTracking();
        })->everyThirtyMinutes();
    }

    /**
     * Register the commands for the application.
     *
     * @return void
     */
    protected function commands()
    {
        $this->load(__DIR__ . '/Commands');

        require base_path('routes/console.php');
    }
}
