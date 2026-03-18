import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge, UserAvatar } from '../../components/ui/StatusBadge';
import { SkeletonStats, SkeletonCard } from '../../components/ui/Skeleton';
import { FileText, MessageSquare, Bell, Clock, CheckCircle, ArrowRight, Upload } from 'lucide-react';
import NotificationDropdown from '../../components/social/NotificationDropdown';

const STEPS = [
    { key: 'submitted', label: 'Submitted', icon: CheckCircle },
    { key: 'documents_uploaded', label: 'Documents', icon: Upload },
    { key: 'under_review', label: 'Review', icon: Clock },
    { key: 'interview_scheduled', label: 'Interview', icon: MessageSquare },
    { key: 'approved', label: 'Approved', icon: CheckCircle },
];

function ProgressTracker({ status }) {
    const currentIdx = STEPS.findIndex(s => s.key === status);
    const rejected = status === 'rejected';

    return (
        <div className="card p-6">
            <h3 className="text-lg font-semibold mb-6">Application Progress</h3>
            {rejected ? (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <span className="text-red-600 text-lg">✕</span>
                    </div>
                    <div>
                        <p className="font-medium text-red-700 dark:text-red-400">Application Not Approved</p>
                        <p className="text-sm text-red-600/70 dark:text-red-400/70">Please contact support for more information.</p>
                    </div>
                </div>
            ) : (
                <div className="flex items-center">
                    {STEPS.map((step, i) => {
                        const done = i <= currentIdx;
                        const active = i === currentIdx;
                        return (
                            <div key={step.key} className="flex items-center flex-1 last:flex-none">
                                <div className="flex flex-col items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300
                    ${done ? 'bg-primary-600 text-white shadow-glow' : 'bg-surface-100 dark:bg-surface-800 text-surface-400'}
                    ${active ? 'ring-4 ring-primary-200 dark:ring-primary-900/50' : ''}
                  `}>
                                        <step.icon className="w-5 h-5" />
                                    </div>
                                    <span className={`mt-2 text-xs font-medium ${done ? 'text-primary-600' : 'text-surface-400'}`}>
                                        {step.label}
                                    </span>
                                </div>
                                {i < STEPS.length - 1 && (
                                    <div className={`flex-1 h-0.5 mx-2 mt-[-1rem] transition-all duration-500 ${i < currentIdx ? 'bg-primary-500' : 'bg-surface-200 dark:bg-surface-700'}`} />
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function StudentDashboard() {
    const { user } = useAuth();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);

    useEffect(() => {
        api.get('/student/dashboard').then(res => {
            setData(res.data);
            setLoading(false);
        }).catch(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <SkeletonStats count={3} />
                <SkeletonCard />
                <SkeletonCard />
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Welcome Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Welcome back, {user?.firstname}! 👋</h1>
                    <p className="text-surface-500 dark:text-surface-400 mt-1">Here's your application overview</p>
                </div>
                <div className="relative z-50">
                    <button 
                        onClick={() => setShowNotifications(true)}
                        className="w-12 h-12 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-500 hover:text-primary-600 hover:border-primary-200 transition-all relative shadow-sm"
                    >
                        <Bell className="w-6 h-6" />
                        {data?.unread_notifications > 0 && (
                            <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-red-500 border-2 border-white dark:border-surface-800 rounded-full" />
                        )}
                    </button>
                    {showNotifications && (
                        <NotificationDropdown 
                            notifications={data?.notifications || []} 
                            unreadCount={data?.unread_notifications || 0}
                            onClose={() => setShowNotifications(false)} 
                        />
                    )}
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="card-hover p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{data?.document_count || 0}</p>
                            <p className="text-sm text-surface-500">Documents</p>
                        </div>
                    </div>
                </div>
                <div className="card-hover p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{data?.unread_messages || 0}</p>
                            <p className="text-sm text-surface-500">Unread Messages</p>
                        </div>
                    </div>
                </div>
                <div className="card-hover p-6">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center">
                            <Bell className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold">{data?.unread_notifications || 0}</p>
                            <p className="text-sm text-surface-500">Notifications</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Progress Tracker */}
            <ProgressTracker status={data?.application_status || 'submitted'} />

            {/* Recent Documents */}
            <div className="grid grid-cols-1 gap-6">
                <div className="card">
                    <div className="flex items-center justify-between p-6 border-b border-surface-100 dark:border-surface-800">
                        <h3 className="font-semibold">Recent Documents</h3>
                        <Link to="/documents" className="text-sm font-medium text-primary-600 hover:text-primary-700 flex items-center gap-1">
                            View all <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>
                    <div className="divide-y divide-surface-100 dark:divide-surface-800">
                        {data?.documents?.length > 0 ? data.documents.slice(0, 4).map(doc => (
                            <div key={doc.id} className="flex items-center gap-4 p-4 hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors">
                                <div className="w-10 h-10 rounded-lg bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                                    <FileText className="w-5 h-5 text-surface-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">{doc.document_name || doc.original_name}</p>
                                    <p className="text-xs text-surface-500">{new Date(doc.uploaded_at).toLocaleDateString()}</p>
                                </div>
                                <StatusBadge status={doc.status || 'pending'} />
                            </div>
                        )) : (
                            <div className="p-8 text-center text-surface-400">
                                <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No documents yet</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
