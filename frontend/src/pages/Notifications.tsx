import PageMeta from "../components/common/PageMeta";
import { useEffect, useState } from "react";
import Avatar from "../components/ui/avatar/Avatar";

export default function Notifications() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/notifications')
            .then(res => res.json())
            .then(data => {
                setNotifications(data);
                setLoading(false);
            })
            .catch(err => {
                console.error("Failed to load notifications:", err);
                setLoading(false);
            });
    }, []);

    return (
        <>
            <PageMeta title="RTOShield | Notifications" description="View all notifications" />
            <div className="p-3 sm:p-4 md:p-6 lg:p-8 font-sans max-w-5xl mx-auto">
                <div className="mb-5 sm:mb-8">
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-white/90">All Notifications</h2>
                    <p className="text-gray-500 mt-1 text-sm dark:text-gray-400">View recent activities and requests.</p>
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden min-h-[400px]">
                    {loading ? (
                        <div className="flex h-[400px] flex-col items-center justify-center gap-3">
                            <div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin"></div>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Loading notifications...</p>
                        </div>
                    ) : notifications.length > 0 ? (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {notifications.map((item) => (
                                <div key={item.id} className="flex gap-4 p-4 sm:p-5 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                                    <div className="shrink-0">
                                        <div className="h-10 w-10 sm:h-12 sm:w-12 text-sm sm:text-base">
                                            <Avatar src={item.avatar} size="large" status={item.status as any} />
                                        </div>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300">
                                            <span className="font-semibold text-gray-900 dark:text-white mr-1">{item.name}</span>
                                            {item.action}
                                            <span className="font-semibold text-gray-900 dark:text-white ml-1">{item.project}</span>
                                        </p>
                                        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-500 flex items-center gap-2">
                                            <span>Project</span>
                                            <span className="w-1 h-1 bg-gray-400 rounded-full"></span>
                                            <span>{item.time}</span>
                                        </p>
                                    </div>
                                    <div className="shrink-0 flex items-center">
                                        <button className="text-brand-500 text-sm font-medium hover:text-brand-600 dark:hover:text-brand-400">View</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-[400px] px-4 text-center">
                            <svg className="w-16 h-16 text-gray-300 dark:text-gray-700 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                            </svg>
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">No Notifications</h3>
                            <p className="text-gray-500 dark:text-gray-400 max-w-xs mt-1">You're all caught up! There are no new notifications right now.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
