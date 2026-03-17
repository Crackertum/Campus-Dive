import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    Calendar, MapPin, Link as LinkIcon, 
    MessageSquare, Users, Edit3, Grid, List, Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../../components/ui/StatusBadge';
import PostCard from '../../components/social/PostCard';

const mockPosts = [
    {
      id: 1,
      initials: 'LM',
      gradient: 'from-purple-500 to-indigo-600',
      author: 'Lena Mueller',
      group: 'Web Dev Group',
      time: '2h ago',
      content: 'Just shipped our new React dashboard for the Campus Dive platform 🚀 Super stoked about the dark mode toggle — check the demo link in the comments!',
      hasImage: true,
      likes: 24,
      comments: 8,
    }
];

export default function SocialProfilePage() {
    const { id } = useParams();
    const { user } = useAuth();
    const isOwnProfile = !id || id === '1'; // Mock logic for demo
    const [viewMode, setViewMode] = useState('grid');

    const profile = {
        name: isOwnProfile ? `${user?.firstname} ${user?.lastname}` : 'Lena Mueller',
        role: isOwnProfile ? (user?.role_name || 'Student') : 'Lead Developer',
        bio: 'Passionate student developer and open source enthusiast. Building cool things at Technical University of Mombasa.',
        joined: 'Sept 2024',
        stats: {
            posts: 12,
            groups: 5,
            rank: 'Pro'
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
            {/* Profile Header */}
            <div className="card border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] p-8 overflow-hidden relative">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary-500 to-purple-600" />
                
                <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
                    <div className="relative group">
                        <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white dark:border-slate-900 shadow-2xl relative">
                            <UserAvatar user={isOwnProfile ? user : { firstname: 'Lena', lastname: 'M' }} size="full" />
                        </div>
                        {isOwnProfile && (
                            <button className="absolute -bottom-2 -right-2 p-2.5 bg-primary-500 text-white rounded-xl shadow-glow hover:scale-110 transition-all">
                                <Plus className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    
                    <div className="flex-1 text-center md:text-left pt-2">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                            <div>
                                <h1 className="text-3xl font-black dark:text-white tracking-tight leading-tight">{profile.name}</h1>
                                <p className="text-xs font-black text-primary-500 uppercase tracking-[0.2em] mt-1">{profile.role}</p>
                            </div>
                            <div className="flex items-center gap-2 justify-center">
                                {isOwnProfile ? (
                                    <button className="px-6 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-all flex items-center gap-2">
                                        <Edit3 className="w-4 h-4" />
                                        Edit Profile
                                    </button>
                                ) : (
                                    <button className="px-8 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-glow shadow-primary-500/20 transition-all hover:-translate-y-1">
                                        Follow
                                    </button>
                                )}
                            </div>
                        </div>

                        <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 leading-relaxed mb-6 max-w-2xl">
                            {profile.bio}
                        </p>

                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-[10px] font-black uppercase tracking-widest text-slate-400">
                            <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-primary-500" /> Mombasa, KE</div>
                            <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5 text-emerald-500" /> Joined {profile.joined}</div>
                            <div className="flex items-center gap-2"><LinkIcon className="w-3.5 h-3.5 text-indigo-500" /> portfolio.io</div>
                        </div>
                    </div>
                </div>

                {/* Stats Bar */}
                <div className="grid grid-cols-3 gap-4 mt-10 pt-10 border-t border-slate-50 dark:border-white/5">
                    <div className="text-center">
                        <p className="text-2xl font-black dark:text-white">{profile.stats.posts}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Total Posts</p>
                    </div>
                    <div className="text-center border-x border-slate-50 dark:border-white/5 px-4">
                        <p className="text-2xl font-black dark:text-white">{profile.stats.groups}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Group Hubs</p>
                    </div>
                    <div className="text-center">
                        <p className="text-2xl font-black text-emerald-500">{profile.stats.rank}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">Contributor</p>
                    </div>
                </div>
            </div>

            {/* Content Filters */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-6">
                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 border-b-2 border-primary-500 pb-2">Feed Posts</button>
                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 pb-2 transition-colors">Shared Media</button>
                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 pb-2 transition-colors">Joined Groups</button>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 p-1 rounded-lg border border-slate-200 dark:border-slate-800">
                    <button 
                        onClick={() => setViewMode('grid')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-surface-800 text-primary-500 shadow-sm' : 'text-slate-400'}`}
                    >
                        <Grid className="w-4 h-4" />
                    </button>
                    <button 
                        onClick={() => setViewMode('list')}
                        className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white dark:bg-surface-800 text-primary-500 shadow-sm' : 'text-slate-400'}`}
                    >
                        <List className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Content View */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-6' : 'space-y-6'}>
                {mockPosts.map(post => <PostCard key={post.id} post={post} />)}
                {/* Repetitive for demo */}
                {mockPosts.map(post => <PostCard key={post.id + 10} post={{...post, content: 'Another amazing day building Campus Dive!'}} />)}
            </div>
        </div>
    );
}
