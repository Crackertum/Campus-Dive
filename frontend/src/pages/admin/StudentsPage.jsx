import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { StatusBadge, UserAvatar } from '../../components/ui/StatusBadge';
import { ConfirmModal } from '../../components/ui/Modal';
import { SkeletonTable } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { Search, Filter, ChevronLeft, ChevronRight, MoreVertical, Check, X, Trash2, Eye, Users, MessageSquare } from 'lucide-react';

export default function StudentsPage() {
    const [students, setStudents] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selected, setSelected] = useState(new Set());
    const [actionMenu, setActionMenu] = useState(null);
    const [confirmModal, setConfirmModal] = useState(null);
    const toast = useToast();
    const navigate = useNavigate();

    const fetchStudents = useCallback(async (page = 1) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ page, limit: 20 });
            if (search) params.set('search', search);
            if (statusFilter) params.set('status', statusFilter);
            const res = await api.get(`/admin/students?${params}`);
            setStudents(res.data.data);
            setPagination(res.data.pagination);
        } catch (err) {
            toast.error(err.message || 'Failed to load students');
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => { fetchStudents(); }, [fetchStudents]);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => fetchStudents(), 300);
        return () => clearTimeout(timer);
    }, [search]);

    const updateStatus = async (id, status) => {
        try {
            await api.put(`/admin/students/${id}/status`, { status });
            toast.success('Status updated');
            fetchStudents(pagination.page);
        } catch (err) {
            toast.error(err.message);
        }
        setActionMenu(null);
    };

    const bulkAction = async (action) => {
        if (selected.size === 0) return;
        try {
            await api.post('/admin/students/bulk-action', {
                action,
                student_ids: Array.from(selected),
            });
            toast.success(`Bulk ${action} completed on ${selected.size} students`);
            setSelected(new Set());
            fetchStudents(pagination.page);
        } catch (err) {
            toast.error(err.message);
        }
    };

    const toggleAll = () => {
        if (selected.size === students.length) {
            setSelected(new Set());
        } else {
            setSelected(new Set(students.map(s => s.id)));
        }
    };

    const toggleOne = (id) => {
        const next = new Set(selected);
        next.has(id) ? next.delete(id) : next.add(id);
        setSelected(next);
    };

    const statuses = ['', 'submitted', 'pending', 'documents_uploaded', 'under_review', 'interview_scheduled', 'approved', 'rejected'];

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Students</h1>
                    <p className="text-surface-500 mt-1">{pagination.total} total students</p>
                </div>
            </div>

            {/* Filters */}
            <div className="card p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="input-field pl-11"
                            placeholder="Search by name or email..."
                        />
                    </div>
                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value)}
                            className="input-field pl-11 pr-8 min-w-[160px]"
                        >
                            <option value="">All statuses</option>
                            {statuses.filter(Boolean).map(s => (
                                <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Bulk Actions */}
            {selected.size > 0 && (
                <div className="card p-3 flex items-center gap-3 bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800">
                    <span className="text-sm font-medium text-primary-700 dark:text-primary-400 ml-2">
                        {selected.size} selected
                    </span>
                    <div className="flex gap-2 ml-auto">
                        <button onClick={() => bulkAction('approve')} className="btn-primary py-1.5 px-3 text-sm">
                            <Check className="w-4 h-4" /> Approve
                        </button>
                        <button onClick={() => bulkAction('reject')} className="btn-secondary py-1.5 px-3 text-sm">
                            <X className="w-4 h-4" /> Reject
                        </button>
                        <button onClick={() => setConfirmModal({ action: 'delete' })} className="btn-danger py-1.5 px-3 text-sm">
                            <Trash2 className="w-4 h-4" /> Delete
                        </button>
                    </div>
                </div>
            )}

            {/* Table */}
            {loading ? <SkeletonTable rows={8} cols={5} /> : students.length === 0 ? (
                <EmptyState icon={Users} title="No students found" description="Try adjusting your search or filters." />
            ) : (
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50 dark:bg-surface-800/50">
                                    <th className="p-4 w-12">
                                        <input type="checkbox" checked={selected.size === students.length && students.length > 0} onChange={toggleAll} className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
                                    </th>
                                    <th className="p-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Student</th>
                                    <th className="p-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Email</th>
                                    <th className="p-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Status</th>
                                    <th className="p-4 text-left text-xs font-semibold text-surface-500 uppercase tracking-wider">Date</th>
                                    <th className="p-4 w-12"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-surface-100 dark:divide-surface-800">
                                {students.map(s => (
                                    <tr key={s.id} className={`hover:bg-surface-50 dark:hover:bg-surface-800/50 transition-colors ${selected.has(s.id) ? 'bg-primary-50/50 dark:bg-primary-900/10' : ''}`}>
                                        <td className="p-4">
                                            <input type="checkbox" checked={selected.has(s.id)} onChange={() => toggleOne(s.id)} className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
                                        </td>
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <UserAvatar user={s} size="sm" />
                                                <div>
                                                    <p className="font-medium text-sm">{s.firstname} {s.lastname}</p>
                                                    <p className="text-xs text-surface-500">{s.student_id || 'N/A'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 text-sm text-surface-600 dark:text-surface-400">{s.email}</td>
                                        <td className="p-4"><StatusBadge status={s.status} /></td>
                                        <td className="p-4 text-sm text-surface-500">{new Date(s.created_at).toLocaleDateString()}</td>
                                        <td className="p-4 relative">
                                            <button onClick={() => setActionMenu(actionMenu === s.id ? null : s.id)} className="btn-icon w-8 h-8">
                                                <MoreVertical className="w-4 h-4" />
                                            </button>
                                            {actionMenu === s.id && (
                                                <div className="absolute right-4 top-full z-20 w-48 card p-2 shadow-soft">
                                                    <button onClick={() => updateStatus(s.id, 'approved')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-50 dark:hover:bg-surface-800 text-left">
                                                        <Check className="w-4 h-4 text-emerald-500" /> Approve
                                                    </button>
                                                    <button onClick={() => updateStatus(s.id, 'rejected')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-50 dark:hover:bg-surface-800 text-left">
                                                        <X className="w-4 h-4 text-red-500" /> Reject
                                                    </button>
                                                    <button onClick={() => updateStatus(s.id, 'under_review')} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-50 dark:hover:bg-surface-800 text-left">
                                                        <Eye className="w-4 h-4 text-blue-500" /> Under Review
                                                    </button>
                                                    <button onClick={() => navigate('/messages', { state: { userId: s.id } })} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-surface-50 dark:hover:bg-surface-800 text-left">
                                                        <MessageSquare className="w-4 h-4 text-primary-500" /> Message
                                                    </button>
                                                    <hr className="my-1 border-surface-100 dark:border-surface-800" />
                                                    <button onClick={() => { setConfirmModal({ action: 'delete', ids: [s.id] }); setActionMenu(null); }} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-red-50 dark:hover:bg-red-900/10 text-red-600 text-left">
                                                        <Trash2 className="w-4 h-4" /> Delete
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {pagination.pages > 1 && (
                        <div className="flex items-center justify-between p-4 border-t border-surface-100 dark:border-surface-800">
                            <p className="text-sm text-surface-500">
                                Page {pagination.page} of {pagination.pages} ({pagination.total} results)
                            </p>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => fetchStudents(pagination.page - 1)}
                                    disabled={pagination.page <= 1}
                                    className="btn-secondary py-1.5 px-3 text-sm"
                                >
                                    <ChevronLeft className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => fetchStudents(pagination.page + 1)}
                                    disabled={pagination.page >= pagination.pages}
                                    className="btn-secondary py-1.5 px-3 text-sm"
                                >
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Delete Confirm Modal */}
            <ConfirmModal
                isOpen={!!confirmModal}
                onClose={() => setConfirmModal(null)}
                onConfirm={() => bulkAction('delete')}
                title="Delete Students"
                message={`Are you sure you want to delete ${confirmModal?.ids ? confirmModal.ids.length : selected.size} student(s)? This cannot be undone.`}
                confirmText="Delete"
                danger
            />
        </div>
    );
}
