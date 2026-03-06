import { useState, useEffect } from 'react';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { BarChart3, TrendingUp, Users, CheckCircle, XCircle, Clock } from 'lucide-react';

export default function AnalyticsPage() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await api.get('/admin/dashboard');
            setData(res.data);
        } catch (err) {
            toast.error('Failed to load analytics: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
        </div>
    );

    const stats = [
        { label: 'Total Students', value: data?.stats?.total_students || 0, icon: Users, color: 'text-primary-500', bg: 'bg-primary-50 dark:bg-primary-900/10' },
        { label: 'Approved', value: data?.stats?.approved || 0, icon: CheckCircle, color: 'text-green-500', bg: 'bg-green-50 dark:bg-green-900/10' },
        { label: 'Pending', value: data?.stats?.pending || 0, icon: Clock, color: 'text-yellow-500', bg: 'bg-yellow-50 dark:bg-yellow-900/10' },
        { label: 'Rejected', value: data?.stats?.rejected || 0, icon: XCircle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/10' },
    ];

    return (
        <div className="animate-fade-in space-y-6">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <BarChart3 className="w-6 h-6 text-primary-500" />
                    Analytics & Insights
                </h1>
                <p className="text-surface-500 text-sm mt-1">Real-time data on application trends and performance.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, i) => (
                    <div key={i} className="card p-5 flex items-center gap-4 transition-transform hover:scale-[1.02]">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${stat.bg}`}>
                            <stat.icon className={`w-6 h-6 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-sm font-medium text-surface-500">{stat.label}</p>
                            <p className="text-2xl font-bold">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Trends Chart (Simplified Visualization) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 card p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="font-bold flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-primary-500" />
                            Application Trends
                        </h3>
                        <span className="text-xs font-semibold px-2 py-1 rounded bg-primary-100 dark:bg-primary-900/30 text-primary-600">Last 6 Months</span>
                    </div>

                    <div className="h-64 flex items-end justify-between gap-2">
                        {data?.trends?.map((item, i) => {
                            const max = Math.max(...data.trends.map(t => t.count), 1);
                            const height = (item.count / max) * 100;
                            return (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                                    <div className="w-full relative flex flex-col items-center justify-end h-full">
                                        <div
                                            className="w-full bg-primary-500/20 dark:bg-primary-500/10 rounded-t-lg transition-all group-hover:bg-primary-500/40 relative"
                                            style={{ height: `${height}%` }}
                                        >
                                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                                                {item.count}
                                            </div>
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-medium text-surface-500 rotate-45 lg:rotate-0 mt-2">{item.month}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="card p-6">
                    <h3 className="font-bold mb-4">Quick Breakdown</h3>
                    <div className="space-y-4">
                        {data?.stats && Object.entries(data.stats).filter(([key]) => key !== 'total_students').map(([key, value], i) => {
                            const percentage = (value / data.stats.total_students) * 100 || 0;
                            return (
                                <div key={i} className="space-y-1.5">
                                    <div className="flex justify-between text-xs font-semibold">
                                        <span className="capitalize">{key.replace('_', ' ')}</span>
                                        <span>{Math.round(percentage)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-1000 ${key === 'approved' ? 'bg-green-500' :
                                                    key === 'rejected' ? 'bg-red-500' :
                                                        'bg-primary-500'
                                                }`}
                                            style={{ width: `${percentage}%` }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-8 p-4 rounded-2xl bg-primary-500 text-white shadow-glow">
                        <p className="text-xs opacity-80">Top performing region</p>
                        <p className="text-lg font-bold">Mombasa Campus</p>
                        <div className="mt-2 flex items-center gap-1 text-[10px]">
                            <TrendingUp className="w-3 h-3" />
                            <span>15% growth this month</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
