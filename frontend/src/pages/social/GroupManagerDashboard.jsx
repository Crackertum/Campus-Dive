import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
    LayoutDashboard, Settings, Users, ShieldAlert, 
    ArrowLeft, Loader2, Save, Trash2, Check, X,
    Image as ImageIcon, Palette, Globe, Lock, ShieldCheck
} from 'lucide-react';
import { socialApi } from '../../api/social';
import { useAuth } from '../../context/AuthContext';
import MediaUrlInput from '../../components/social/MediaUrlInput';

export default function GroupManagerDashboard() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    
    const [group, setGroup] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
    const [isSaving, setIsSaving] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState({
        description: '',
        category: '',
        cover_color: '#6366f1',
        is_private: false,
        post_approval_required: false,
        avatar_url: ''
    });

    useEffect(() => {
        fetchGroupDetail();
    }, [slug]);

    const fetchGroupDetail = async () => {
        setIsLoading(true);
        try {
            const res = await socialApi.getGroupDetail(slug);
            if (res.data?.user_role !== 'manager' && res.data?.user_role !== 'admin') {
                navigate('/social/groups');
                return;
            }
            setGroup(res.data);
            setFormData({
                description: res.data.description || '',
                category: res.data.category || '',
                cover_color: res.data.cover_color || '#6366f1',
                is_private: !!res.data.is_private,
                post_approval_required: !!res.data.post_approval_required,
                avatar_url: res.data.avatar_url || ''
            });
        } catch (err) {
            console.error('Failed to fetch group:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            await socialApi.updateGroupSettings(group.id, formData);
            alert('Settings updated successfully!');
            fetchGroupDetail();
        } catch (err) {
            alert(err.message || 'Update failed');
        } finally {
            setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
                <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Loading Manager...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Link to={`/social/groups/${slug}`} className="p-2 bg-slate-100 dark:bg-white/5 rounded-full text-slate-500 hover:text-primary-500 transition-all">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black dark:text-white flex items-center gap-2 tracking-tight leading-none mb-1">
                            {group.name} <span className="text-xs font-black text-primary-500 uppercase tracking-widest bg-primary-500/10 px-2 py-0.5 rounded-lg border border-primary-500/20">Manager</span>
                        </h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Hub Control Center</p>
                    </div>
                </div>
                <div className="flex gap-3">
                     <button 
                        onClick={handleSaveSettings}
                        disabled={isSaving}
                        className="btn-primary px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-glow shadow-primary-500/20 disabled:opacity-50"
                     >
                        {isSaving ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-4 h-4" />}
                        Save Changes
                     </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8">
                {/* Sidebar Nav */}
                <aside className="space-y-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                        { id: 'settings', label: 'Settings', icon: Settings },
                        { id: 'moderation', label: 'Moderation', icon: ShieldAlert },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-6 py-4 rounded-3xl text-xs font-black uppercase tracking-widest transition-all ${
                                activeTab === tab.id 
                                ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20 translate-x-1' 
                                : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-white'
                            }`}
                        >
                            <tab.icon className="w-5 h-5" />
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </aside>

                {/* Main Content */}
                <main className="space-y-8">
                    {activeTab === 'overview' && (
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <div className="card p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] text-center">
                                <p className="text-4xl font-black dark:text-white mb-2 leading-none">{group.member_count}</p>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Total Members</p>
                            </div>
                            <div className="card p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] text-center">
                                <p className="text-4xl font-black dark:text-white mb-2 leading-none">0</p>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">Pending Posts</p>
                            </div>
                            <div className="card p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] text-center">
                                <p className="text-4xl font-black dark:text-white mb-2 leading-none">0</p>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">New This Week</p>
                            </div>
                        </div>
                    )}

                    {activeTab === 'settings' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                            {/* General Settings */}
                            <div className="card p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] space-y-6">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">General Settings</h3>
                                
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Description</label>
                                    <textarea 
                                        value={formData.description}
                                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                                        className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 text-sm dark:text-white focus:ring-primary-500 min-h-[120px]"
                                        placeholder="Describe your hub..."
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Category</label>
                                        <input 
                                            type="text"
                                            value={formData.category}
                                            onChange={(e) => setFormData({...formData, category: e.target.value})}
                                            className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-sm dark:text-white focus:ring-primary-500"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Theme Color</label>
                                        <div className="flex items-center gap-3">
                                            <input 
                                                type="color"
                                                value={formData.cover_color}
                                                onChange={(e) => setFormData({...formData, cover_color: e.target.value})}
                                                className="w-10 h-10 rounded-lg p-0 border-none bg-transparent cursor-pointer"
                                            />
                                            <span className="text-xs font-mono dark:text-slate-400 uppercase">{formData.cover_color}</span>
                                        </div>
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-1">Group Avatar URL</label>
                                    <div className="flex items-center gap-4">
                                        <div className="w-16 h-16 rounded-2xl bg-slate-100 dark:bg-white/5 flex items-center justify-center overflow-hidden border border-slate-200 dark:border-slate-800">
                                            {formData.avatar_url ? (
                                                <img src={formData.avatar_url} alt="Avatar Preview" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-xl font-black text-slate-400">{group.icon_initials || group.name[0]}</span>
                                            )}
                                        </div>
                                        <input 
                                            type="text"
                                            value={formData.avatar_url}
                                            onChange={(e) => setFormData({...formData, avatar_url: e.target.value})}
                                            className="flex-1 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800 rounded-xl px-4 py-2 text-sm dark:text-white focus:ring-primary-500"
                                            placeholder="Paste image URL..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Privacy & Permissions */}
                            <div className="card p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] space-y-6">
                                <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Privacy & Permissions</h3>
                                
                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-primary-500/10 rounded-xl">
                                            <Lock className="w-5 h-5 text-primary-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black dark:text-white uppercase">Private Community</p>
                                            <p className="text-[10px] text-slate-500 font-bold">Only members can see group content.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setFormData({...formData, is_private: !formData.is_private})}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${formData.is_private ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.is_private ? 'translate-x-6' : ''}`} />
                                    </button>
                                </div>

                                <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-amber-500/10 rounded-xl">
                                            <ShieldCheck className="w-5 h-5 text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black dark:text-white uppercase">Post Approval Required</p>
                                            <p className="text-[10px] text-slate-500 font-bold">New posts must be approved by a manager.</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setFormData({...formData, post_approval_required: !formData.post_approval_required})}
                                        className={`w-12 h-6 rounded-full transition-colors relative ${formData.post_approval_required ? 'bg-primary-500' : 'bg-slate-300 dark:bg-slate-700'}`}
                                    >
                                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${formData.post_approval_required ? 'translate-x-6' : ''}`} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'moderation' && (
                        <div className="text-center py-20 card border-dashed border-2 bg-transparent border-slate-200 dark:border-slate-800">
                            <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                            <h3 className="text-lg font-black dark:text-white mb-2">Moderation Queue</h3>
                            <p className="text-sm text-slate-500">No pending items to review at this time.</p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
