import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../api/client';
import { UserAvatar } from '../../components/ui/StatusBadge';
import { User, Lock, Camera, Bell, Trash2, Save } from 'lucide-react';

export default function SettingsPage() {
    const { user, updateUser } = useAuth();
    const toast = useToast();
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);

    const [profile, setProfile] = useState({
        firstname: user?.firstname || '',
        lastname: user?.lastname || '',
        phone: user?.phone || '',
    });
    const [passwords, setPasswords] = useState({
        current_password: '', new_password: '', confirm_password: '',
    });

    const tabs = [
        { key: 'profile', label: 'Profile', icon: User },
        { key: 'security', label: 'Security', icon: Lock },
    ];

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await api.put('/student/profile', profile);
            updateUser(res.data);
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.errors ? Object.values(err.errors)[0] : err.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await api.put('/student/password', passwords);
            toast.success('Password changed!');
            setPasswords({ current_password: '', new_password: '', confirm_password: '' });
        } catch (err) {
            toast.error(err.errors ? Object.values(err.errors)[0] : err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAvatarUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append('avatar', file);
        try {
            const res = await api.upload('/student/avatar', formData);
            updateUser({ avatar_image: res.data.avatar_path });
            toast.success('Avatar updated!');
        } catch (err) {
            toast.error(err.message);
        }
    };

    return (
        <div className="animate-fade-in">
            <h1 className="text-2xl font-bold mb-6">Settings</h1>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Sidebar Tabs */}
                <div className="lg:col-span-1">
                    <div className="card p-2 space-y-1">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${activeTab === tab.key
                                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                                        : 'text-surface-600 dark:text-surface-400 hover:bg-surface-50 dark:hover:bg-surface-800'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4" /> {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-3">
                    {activeTab === 'profile' && (
                        <div className="card p-6 space-y-6">
                            <h3 className="text-lg font-semibold">Profile Information</h3>

                            {/* Avatar */}
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <UserAvatar user={user} size="xl" />
                                    <label className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary-600 text-white flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow-lg">
                                        <Camera className="w-4 h-4" />
                                        <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
                                    </label>
                                </div>
                                <div>
                                    <p className="font-medium">{user?.firstname} {user?.lastname}</p>
                                    <p className="text-sm text-surface-500">{user?.email}</p>
                                    <p className="text-xs text-surface-400 mt-1">{user?.role_name || user?.role}</p>
                                </div>
                            </div>

                            <form onSubmit={handleProfileUpdate} className="space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">First Name</label>
                                        <input type="text" value={profile.firstname} onChange={e => setProfile(p => ({ ...p, firstname: e.target.value }))} className="input-field" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Last Name</label>
                                        <input type="text" value={profile.lastname} onChange={e => setProfile(p => ({ ...p, lastname: e.target.value }))} className="input-field" required />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Phone</label>
                                    <input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="input-field" required />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1.5">Email</label>
                                    <input type="email" value={user?.email || ''} className="input-field opacity-60" disabled />
                                    <p className="text-xs text-surface-400 mt-1">Email cannot be changed</p>
                                </div>
                                <button type="submit" disabled={loading} className="btn-primary">
                                    <Save className="w-4 h-4" /> {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        </div>
                    )}

                    {activeTab === 'security' && (
                        <div className="space-y-6">
                            <div className="card p-6">
                                <h3 className="text-lg font-semibold mb-4">Change Password</h3>
                                <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Current Password</label>
                                        <input type="password" value={passwords.current_password} onChange={e => setPasswords(p => ({ ...p, current_password: e.target.value }))} className="input-field" required />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">New Password</label>
                                        <input type="password" value={passwords.new_password} onChange={e => setPasswords(p => ({ ...p, new_password: e.target.value }))} className="input-field" required minLength={6} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium mb-1.5">Confirm New Password</label>
                                        <input type="password" value={passwords.confirm_password} onChange={e => setPasswords(p => ({ ...p, confirm_password: e.target.value }))} className="input-field" required />
                                    </div>
                                    <button type="submit" disabled={loading} className="btn-primary">
                                        <Lock className="w-4 h-4" /> {loading ? 'Updating...' : 'Update Password'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
