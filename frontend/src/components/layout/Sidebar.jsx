import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { UserAvatar } from '../ui/StatusBadge';
import {
    LayoutDashboard, Users, MessageSquare, FileText, Settings,
    LogOut, Shield, BarChart3, Moon, Sun, Menu, X, ChevronDown, Users2
} from 'lucide-react';
import { useState, useEffect } from 'react';
import api from '../../api/client';

export default function Sidebar() {
    const { user, logout, isAdmin, isManager, isInterviewer } = useAuth();
    const { dark, toggle } = useTheme();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const navigate = useNavigate();

    const [counts, setCounts] = useState({ messages: 0, notifications: 0 });

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    useEffect(() => {
        if (!user) return;
        
        const fetchCounts = async () => {
            try {
                const [msgRes, notifRes] = await Promise.all([
                    api.get('/messages/unread-count'),
                    api.get('/notifications/unread-count')
                ]);
                setCounts({
                    messages: msgRes.data.unread_count || 0,
                    notifications: notifRes.data.unread_count || 0
                });
            } catch (err) {
                console.error("Failed to fetch unread counts", err);
            }
        };

        fetchCounts();
        // Refresh every 30 seconds
        const interval = setInterval(fetchCounts, 30000);
        return () => clearInterval(interval);
    }, [user]);

    const getBadge = (label) => {
        if (label === 'Messages' && counts.messages > 0) return counts.messages;
        if (label === 'Dashboard' && counts.notifications > 0) return counts.notifications;
        return null;
    };

    const studentLinks = [
        { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/documents', icon: FileText, label: 'Documents' },
        { to: '/messages', icon: MessageSquare, label: 'Messages' },
        { to: '/social', icon: Users2, label: 'Social Hub' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ];

    const adminLinks = [
        { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
        { to: '/admin/students', icon: Users, label: 'Students' },
        { to: '/admin/roles', icon: Shield, label: 'Roles' },
        { to: '/admin/social', icon: Users2, label: 'Hub Management' },
        { to: '/admin/social-hub', icon: Users2, label: 'Social Hub' },
        { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
        { to: '/messages', icon: MessageSquare, label: 'Messages' },
        { to: '/settings', icon: Settings, label: 'Settings' },
    ];

    const links = isAdmin || isManager ? adminLinks : studentLinks;

    const sidebarContent = (
        <div className="flex flex-col h-full glass">
            {/* Logo */}
            <div className="flex items-center gap-3 px-6 py-6 border-b border-white/10">
                <img src="/logo.png" alt="Campus Dive" className="w-10 h-10 object-contain rounded-xl shadow-glow" />
                {!collapsed && (
                    <span className="font-extrabold text-xl tracking-tighter bg-gradient-to-r from-surface-900 to-surface-500 dark:from-white dark:to-surface-400 bg-clip-text text-transparent">
                        Campus Dive
                    </span>
                )}
            </div>

            {/* Nav Links */}
            <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                {links.map(link => (
                    <NavLink
                        key={link.to}
                        to={link.to === '/admin/social-hub' ? '/social' : link.to}
                        target={link.target}
                        rel={link.target === '_blank' ? 'noopener noreferrer' : undefined}
                        end={link.to === '/dashboard' || link.to === '/admin'}
                        onClick={() => setMobileOpen(false)}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-300 group
              ${isActive && !link.target
                                ? 'bg-primary-500 text-white shadow-glow shadow-primary-500/20'
                                : 'text-surface-600 dark:text-surface-400 hover:bg-white dark:hover:bg-white/5 hover:shadow-sm'
                            }`
                        }
                    >
                        <link.icon className="w-5 h-5 shrink-0" />
                        {!collapsed && <span className="flex-1">{link.label}</span>}
                        {!collapsed && getBadge(link.label) && (
                            <span className="bg-white/20 text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                                {getBadge(link.label)}
                            </span>
                        )}
                    </NavLink>
                ))}
            </nav>

            {/* Bottom */}
            <div className="p-4 border-t border-white/10 space-y-3">
                <button
                    onClick={toggle}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold text-surface-600 dark:text-surface-400 hover:bg-white dark:hover:bg-white/5 transition-all group"
                >
                    <div className="w-5 h-5 flex items-center justify-center">
                        {dark ? <Sun className="w-5 h-5 group-hover:rotate-45 transition-transform" /> : <Moon className="w-5 h-5 group-hover:-rotate-12 transition-transform" />}
                    </div>
                    {!collapsed && <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>}
                </button>

                <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/50 dark:bg-white/5 border border-white/20 dark:border-white/5 glass shadow-sm">
                    <UserAvatar user={user} size="sm" />
                    {!collapsed && (
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold truncate">{user?.firstname} {user?.lastname}</p>
                            <p className="text-xs text-surface-500 font-medium truncate opacity-70">{user?.role_name || user?.role}</p>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold text-red-500 hover:bg-red-500/10 transition-all"
                >
                    <LogOut className="w-5 h-5" />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Mobile toggle */}
            <button
                onClick={() => setMobileOpen(true)}
                className="fixed top-4 left-4 z-40 lg:hidden btn-icon bg-white dark:bg-surface-900 shadow-soft"
            >
                <Menu className="w-5 h-5" />
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 lg:hidden">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
                    <div className="relative w-72 h-full bg-white dark:bg-surface-900 flex flex-col animate-slide-in-right shadow-xl">
                        <button onClick={() => setMobileOpen(false)} className="absolute top-4 right-4 btn-icon">
                            <X className="w-5 h-5" />
                        </button>
                        {sidebarContent}
                    </div>
                </div>
            )}

            {/* Desktop sidebar */}
            <aside className={`hidden lg:flex flex-col h-screen sticky top-0 border-r border-white/10 transition-all duration-500 ease-in-out ${collapsed ? 'w-24' : 'w-72'}`}>
                {sidebarContent}
            </aside>
        </>
    );
}
