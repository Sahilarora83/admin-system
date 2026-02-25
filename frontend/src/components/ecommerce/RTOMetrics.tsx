import { useEffect, useState } from "react";
import { apiFetch } from "../../utils/api";

export default function RTOMetrics() {
    const [metrics, setMetrics] = useState<any[]>([]);

    useEffect(() => {
        apiFetch('/api/rto-metrics')
            .then(data => setMetrics(data))
            .catch(err => console.error("Failed to load metrics", err));
    }, []);

    return (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {metrics.map((metric, idx) => (
                <div key={idx} className="relative overflow-hidden rounded-2xl bg-white p-4 md:p-5 shadow-sm border border-gray-100 dark:bg-gray-900 dark:border-gray-800">
                    <div className="flex flex-col gap-1 relative z-10">
                        <span className="text-gray-500 text-xs sm:text-sm font-medium dark:text-gray-400 leading-tight">
                            {metric.title}
                        </span>
                        <h4 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white/90 leading-tight mt-0.5">
                            {metric.value}
                        </h4>
                    </div>
                    <div className={`absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t ${metric.gradient} opacity-50 dark:opacity-10`} />
                    <svg className={`absolute bottom-0 left-0 w-full h-8 ${metric.lineColor}`} preserveAspectRatio="none" viewBox="0 0 1440 320" xmlns="http://www.w3.org/2000/svg">
                        <path fill="currentColor" fillOpacity="0.2" d="M0,160L48,170.7C96,181,192,203,288,186.7C384,171,480,117,576,106.7C672,96,768,128,864,138.7C960,149,1056,139,1152,144C1248,149,1344,171,1392,181.3L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z" />
                    </svg>
                </div>
            ))}
        </div>
    );
}

