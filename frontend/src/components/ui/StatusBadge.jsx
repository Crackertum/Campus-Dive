const STATUS_CONFIG = {
    submitted: { label: 'Submitted', color: 'badge-neutral' },
    pending: { label: 'Pending', color: 'badge-warning' },
    documents_uploaded: { label: 'Docs Uploaded', color: 'badge-info' },
    under_review: { label: 'Under Review', color: 'badge-info' },
    interview_scheduled: { label: 'Interview', color: 'badge-warning' },
    approved: { label: 'Approved', color: 'badge-success' },
    rejected: { label: 'Rejected', color: 'badge-danger' },
};

export function StatusBadge({ status }) {
    const config = STATUS_CONFIG[status] || { label: status, color: 'badge-neutral' };
    return <span className={config.color}>{config.label}</span>;
}

export function UserAvatar({ user, size = 'md' }) {
    const sizes = {
        sm: 'w-8 h-8 text-xs',
        md: 'w-10 h-10 text-sm',
        lg: 'w-14 h-14 text-lg',
        xl: 'w-20 h-20 text-2xl',
    };

    if (user?.avatar_image) {
        return (
            <img
                src={`/${user.avatar_image}`}
                alt={`${user.firstname} ${user.lastname}`}
                className={`${sizes[size]} rounded-full object-cover ring-2 ring-surface-200 dark:ring-surface-700`}
            />
        );
    }

    const initials = user?.avatar || (user?.firstname?.[0] || '') + (user?.lastname?.[0] || '');
    return (
        <div className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-semibold ring-2 ring-surface-200 dark:ring-surface-700`}>
            {initials}
        </div>
    );
}
