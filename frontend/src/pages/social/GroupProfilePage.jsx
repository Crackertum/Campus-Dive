import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
    Users, MessageSquare, Info, ShieldCheck, Plus, 
    Link as LinkIcon, Calendar, MoreHorizontal, UserPlus 
} from 'lucide-react';
import PostCard from '../../components/social/PostCard';

const mockGroup = {
    id: 1,
    name: 'Web Devs TUM',
    initials: 'WD',
    color: 'from-blue-500 to-indigo-600',
    description: 'The official community for budding and professional web developers at Technical University of Mombasa. We host weekly workshops, code reviews, and project nights.',
    members: 1240,
    posts: 420,
    created: 'August 2024',
};

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

export default function GroupProfilePage() {
    const { id } = useParams();
    const [activeTab, setActiveTab] = useState('posts');
    const [isJoined, setIsJoined] = useState(true);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Cover Banner */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <div className={`h-48 sm:h-64 bg-gradient-to-br ${mockGroup.color} relative`}>
                    <div className="absolute inset-0 bg-mesh-primary opacity-30" />
                    <div className="absolute top-4 right-4 flex gap-2">
                        <button className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
                            <LinkIcon className="w-5 h-5" />
                        </button>
                        <button className="p-2 bg-white/10 backdrop-blur-md rounded-full text-white hover:bg-white/20 transition-all">
                            <MoreHorizontal className="w-5 h-5" />
                        </button>
                    </div>
                </div>
                
                <div className="bg-white dark:bg-[#0B1120] px-8 pb-8 border-x border-b border-slate-200 dark:border-slate-800">
                    <div className="flex flex-col sm:flex-row items-end gap-6 -mt-12 relative z-10 px-0 sm:px-4">
                        <div className={`w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-gradient-to-br ${mockGroup.color} border-8 border-white dark:border-[#0B1120] flex items-center justify-center text-white text-3xl sm:text-4xl font-black shadow-2xl`}>
                            {mockGroup.initials}
                        </div>
                        
                        <div className="flex-1 pb-4 text-center sm:text-left">
                            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-1">
                                <h1 className="text-3xl font-black dark:text-white tracking-tight">{mockGroup.name}</h1>
                                <span className="inline-flex items-center px-3 py-1 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 w-fit mx-auto sm:mx-0">
                                    Official
                                </span>
                            </div>
                            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 text-slate-500 text-xs font-bold uppercase tracking-widest">
                                <span className="flex items-center gap-1.5"><Users className="w-4 h-4" /> {mockGroup.members} Members</span>
                                <span className="flex items-center gap-1.5"><MessageSquare className="w-4 h-4" /> {mockGroup.posts} Posts</span>
                                <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> Est. {mockGroup.created}</span>
                            </div>
                        </div>

                        <div className="pb-4 w-full sm:w-auto">
                            <button 
                                onClick={() => setIsJoined(!isJoined)}
                                className={`w-full sm:w-auto px-8 py-3 rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl ${
                                    isJoined
                                    ? 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                                    : 'bg-primary-500 text-white hover:bg-primary-600 shadow-primary-500/20 hover:-translate-y-1'
                                }`}
                            >
                                {isJoined ? 'Member' : 'Join Group'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Tabs */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
                
                <div className="space-y-8">
                    {/* Tabs Nav */}
                    <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-px overflow-x-auto no-scrollbar">
                        {[
                            { id: 'posts', label: 'Recent Posts', icon: MessageSquare },
                            { id: 'members', label: 'Members', icon: Users },
                            { id: 'about', label: 'About Info', icon: Info },
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-4 text-xs font-black uppercase tracking-widest transition-all relative ${
                                    activeTab === tab.id 
                                    ? 'text-primary-500' 
                                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                                }`}
                            >
                                <tab.icon className="w-4 h-4" />
                                <span>{tab.label}</span>
                                {activeTab === tab.id && (
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-t-full shadow-glow" />
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Tab Content */}
                    <div className="pt-2">
                        {activeTab === 'posts' && (
                            <div className="space-y-6">
                                <div className="p-6 bg-primary-500/5 dark:bg-primary-500/1 border border-dashed border-primary-500/30 rounded-3xl flex items-center justify-between gap-4 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-primary-500 text-white rounded-2xl flex items-center justify-center shadow-glow shadow-primary-500/20">
                                            <Plus className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-black dark:text-white uppercase tracking-tight">Post into {mockGroup.initials}</h4>
                                            <p className="text-xs text-slate-500 font-medium tracking-tight">Share an update, question, or resource with members.</p>
                                        </div>
                                    </div>
                                    <button className="px-6 py-2.5 bg-white dark:bg-surface-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black text-slate-600 dark:text-slate-400 hover:text-primary-500 transition-colors uppercase tracking-widest shadow-sm">
                                        New Post
                                    </button>
                                </div>
                                
                                <div className="space-y-6">
                                    {mockPosts.map(post => <PostCard key={post.id} post={post} />)}
                                </div>
                            </div>
                        )}

                        {activeTab === 'members' && (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className="card p-4 text-center border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] hover:border-primary-500/30 transition-all cursor-pointer">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 mx-auto mb-3 flex items-center justify-center text-slate-400 font-bold">
                                            U{i+1}
                                        </div>
                                        <p className="text-xs font-bold dark:text-white truncate">Member Name</p>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest mt-0.5">Contributor</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="card p-8 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
                                <h3 className="text-lg font-black dark:text-white tracking-tight mb-4">About the Community</h3>
                                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-semibold mb-8">
                                    {mockGroup.description}
                                </p>
                                
                                <div className="space-y-6 pt-6 border-t border-slate-50 dark:border-white/5">
                                    <div>
                                        <h4 className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                                            Hub Guidelines
                                        </h4>
                                        <ul className="space-y-3">
                                            {[
                                                'Maintain professionalism and respect.',
                                                'No self-promotion without admin approval.',
                                                'Collaborate and share knowledge openly.',
                                                'Report any inappropriate content.'
                                            ].map((rule, i) => (
                                                <li key={i} className="flex items-start gap-3 text-xs font-bold text-slate-600 dark:text-slate-400">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                                                    <span>{rule}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <aside className="space-y-8">
                    <div className="card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
                        <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-6 px-2">Group Admins</h3>
                        <div className="space-y-4">
                            {[1, 2].map(admin => (
                                <div key={admin} className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 font-black text-xs">
                                        A{admin}
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold dark:text-white">Lead Developer</p>
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest leading-none mt-0.5">Admin</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
                        <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase mb-6 px-2">Upcoming Events</h3>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-slate-800">
                                <div className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em] mb-1">Jan 24, 2025</div>
                                <h4 className="text-xs font-black dark:text-white tracking-tight uppercase leading-none mb-2">React 19 Deep Dive</h4>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] text-slate-500 font-bold">12 Attending</span>
                                    <Link to="#" className="text-[10px] font-black text-primary-500 uppercase tracking-widest hover:underline">Details</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
}
