import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { StatusBadge, UserAvatar } from '../../components/ui/StatusBadge';
import { SkeletonStats, SkeletonTable } from '../../components/ui/Skeleton';
import { Users, UserCheck, Clock, XCircle, TrendingUp, ArrowRight, Eye, MessageSquare, Bell } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import NotificationDropdown from '../../components/social/NotificationDropdown';

export default function AdminDashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        api.get('/admin/dashboard').then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <SkeletonStats count={4} />
                <SkeletonTable />
            </div>
        );
    }

    const stats = data?.stats || {};
    const statCards = [
        { label: 'Total Students', value: stats.total_students, icon: Users, color: 'blue', change: '+12%' },
        { label: 'Pending', value: stats.pending, icon: Clock, color: 'amber', change: null },
        { label: 'Approved', value: stats.approved, icon: UserCheck, color: 'emerald', change: '+8%' },
        { label: 'Rejected', value: stats.rejected, icon: XCircle, color: 'red', change: null },
    ];

    const colorClasses = {
        blue: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400' },
        amber: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400' },
        emerald: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', text: 'text-emerald-600 dark:text-emerald-400' },
        red: { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-600 dark:text-red-400' },
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">Campus recruitment overview</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        <button
                            onClick={() => setShowNotifications(!showNotifications)}
                            className={`btn-icon relative transition-all duration-300 ${showNotifications ? 'bg-primary-500 text-white shadow-glow' : 'bg-white dark:bg-surface-900 shadow-soft'}`}
                        >
                            <Bell className={`w-5 h-5 ${showNotifications ? 'animate-none' : 'hover:animate-swing'}`} />
                            {data?.unread_notifications > 0 && (
                                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-surface-900 animate-bounce">
                                    {data.unread_notifications}
                                </span>
                            )}
                        </button>

                        {showNotifications && (
                            <NotificationDropdown
                                notifications={data?.notifications}
                                unreadCount={data?.unread_notifications}
                                onClose={() => setShowNotifications(false)}
                            />
                        )}
                    </div>
                    <Link to="/admin/students" className="btn-primary">
                        <Users className="w-4 h-4" /> Manage Students
                    </Link>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statCards.map(stat => (
                    <div key={stat.label} className="card-hover p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className={`w-11 h-11 rounded-xl ${colorClasses[stat.color].bg} flex items-center justify-center`}>
                                <stat.icon className={`w-5 h-5 ${colorClasses[stat.color].text}`} />
                            </div>
                            {stat.change && (
                                <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                                    <TrendingUp className="w-3 h-3" /> {stat.change}
                                </span>
                            )}
                        </div>
                        <p className="text-3xl font-bold">{stat.value || 0}</p>
                        <p className="text-sm text-surface-500 mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Chart & Recent Students */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                {/* Trends Chart */}
                <div className="lg:col-span-3 card p-6">
                    <h3 className="font-semibold mb-6">Application Trends</h3>
                    {data?.trends?.length > 0 ? (
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={data.trends}>
                                <defs>
                                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                    </linearGradient>
                                    <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-surface-200 dark:stroke-surface-700" />
                                <XAxis dataKey="month" className="text-xs" tick={{ fill: '#94a3b8' }} />
                                <YAxis className="text-xs" tick={{ fill: '#94a3b8' }} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--tw-bg-opacity, #fff)',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '12px',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                                    }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#6366f1" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} name="Applications" />
                                <Area type="monotone" dataKey="approved" stroke="#10b981" fillOpacity={1} fill="url(#colorApproved)" strokeWidth={2} name="Approved" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-surface-400">
                            <p>No trend data available yet</p>
                        </div>
                    )}
                </div>

                {/* Recent Students */}
                <div className="lg:col-span-2 card">
                    <div className="flex items-center justify-between p-6 border-b border-surface-100 dark:border-surface-800">
                        <h3 className="font-semibold">Recent Applications</h3>
                        <Link to="/admin/students" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            All <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-surface-100 dark:divide-surface-800">
                        {data?.recent_students?.slice(0, 6).map(student => (
                            <Link
                                key={student.id}
                                to={`/admin/students?view=${student.id}`}
                                className="flex items-center gap-3 p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors"
                            >
                                <UserAvatar user={student} size="sm" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{student.firstname} {student.lastname}</p>
                                    <p className="text-xs text-surface-500">{new Date(student.created_at).toLocaleDateString()}</p>
                                </div>
                                <StatusBadge status={student.status} />
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="card p-6">
                <h3 className="font-semibold mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <Link to="/admin/students?status=pending" className="flex items-center gap-3 p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all">
                        <Clock className="w-5 h-5 text-amber-500" />
                        <div>
                            <p className="text-sm font-medium">Review Pending</p>
                            <p className="text-xs text-surface-500">{stats.pending || 0} awaiting review</p>
                        </div>
                    </Link>
                    <Link to="/messages" className="flex items-center gap-3 p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all">
                        <MessageSquare className="w-5 h-5 text-blue-500" />
                        <div>
                            <p className="text-sm font-medium">Messages</p>
                            <p className="text-xs text-surface-500">{data?.unread_messages || 0} unread</p>
                        </div>
                    </Link>
                    <Link to="/admin/analytics" className="flex items-center gap-3 p-4 rounded-xl border border-surface-200 dark:border-surface-700 hover:border-primary-300 dark:hover:border-primary-700 hover:bg-primary-50/50 dark:hover:bg-primary-900/10 transition-all">
                        <TrendingUp className="w-5 h-5 text-emerald-500" />
                        <div>
                            <p className="text-sm font-medium">Analytics</p>
                            <p className="text-xs text-surface-500">View reports</p>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
