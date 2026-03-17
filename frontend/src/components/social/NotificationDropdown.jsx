import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

const notifications = [
    { 
        id: 1, 
        initials: 'TD', 
        gradient: 'from-blue-500 to-indigo-600',
        message: 'TUM Dev Club posted a new event: Hackathon 2025',
        time: '3 min ago', 
        read: false 
    },
    { 
        id: 2, 
        initials: 'DG', 
        gradient: 'from-rose-500 to-pink-600',
        message: 'Design Guild shared a new announcement',
        time: '1 hr ago', 
        read: true 
    }
];

export default function NotificationDropdown({ onClose }) {
    const dropdownRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div 
            ref={dropdownRef}
            className="absolute right-0 top-full mt-4 w-80 bg-white dark:bg-[#0B1120] rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200"
        >
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <h3 className="font-black text-sm tracking-tight dark:text-white">Notifications</h3>
                <span className="bg-primary-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">2 New</span>
            </div>
            
            <div className="max-h-[400px] overflow-y-auto">
                {notifications.map(notif => (
                    <div 
                        key={notif.id} 
                        className={`p-4 flex gap-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer ${!notif.read ? 'bg-primary-500/5' : ''}`}
                    >
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${notif.gradient} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}>
                            {notif.initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm leading-snug dark:text-slate-200 mb-1">
                                {notif.message}
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{notif.time}</span>
                                {!notif.read && <div className="w-1.5 h-1.5 rounded-full bg-primary-500 animate-pulse" />}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            <Link 
                to="/social/notifications" 
                onClick={onClose}
                className="block p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-slate-800 text-center text-[10px] font-black tracking-[0.2em] text-slate-400 hover:text-primary-500 transition-colors uppercase"
            >
                View All Notifications →
            </Link>
        </div>
    );
}
