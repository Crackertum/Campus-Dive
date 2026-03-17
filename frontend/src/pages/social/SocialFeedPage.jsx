import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../ui/StatusBadge';
import { Image as ImageIcon, Video, FileText, Smile } from 'lucide-react';
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
    },
    {
      id: 2,
      initials: 'KO',
      gradient: 'from-emerald-500 to-teal-600',
      author: 'Kevin Omondi',
      group: 'AI/ML Research',
      time: '5h ago',
      content: 'Trained a lightweight sentence-transformer model on our campus course catalog. Now you can search semantically — "find me electives related to entrepreneurship" — and it actually works 🧠',
      hasImage: false,
      likes: 41,
      comments: 13,
    },
    {
      id: 3,
      initials: 'SR',
      gradient: 'from-rose-500 to-pink-600',
      author: 'Sara Rizvi',
      group: 'Design Guild',
      time: '1d ago',
      content: 'New design system drop for Campus Dive 🎨 Consistent tokens, accessible color ratios, and a brand-new icon library. Feedback welcome!',
      hasImage: true,
      likes: 67,
      comments: 22,
    },
];

export default function SocialFeedPage() {
    const { user } = useAuth();
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Create Post Box */}
            <div className="card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] shadow-glow shadow-primary-500/5">
                <div className="flex gap-4">
                    <UserAvatar user={user} size="md" />
                    <div className="flex-1">
                        {!isExpanded ? (
                            <div 
                                onClick={() => setIsExpanded(true)}
                                className="w-full px-6 py-3 bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800 rounded-2xl text-slate-500 cursor-text text-sm font-medium hover:border-primary-500/30 transition-all flex items-center"
                            >
                                Start a post...
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in duration-300">
                                <textarea 
                                    autoFocus
                                    className="w-full bg-transparent border-none p-0 focus:ring-0 text-sm dark:text-white placeholder:text-slate-500 resize-none min-h-[100px]"
                                    placeholder="What's on your mind?"
                                />
                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 text-primary-500 hover:bg-primary-500/10 rounded-xl transition-colors">
                                            <ImageIcon className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-emerald-500 hover:bg-emerald-500/10 rounded-xl transition-colors">
                                            <Video className="w-5 h-5" />
                                        </button>
                                        <button className="p-2 text-amber-500 hover:bg-amber-500/10 rounded-xl transition-colors">
                                            <FileText className="w-5 h-5" />
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button 
                                            onClick={() => setIsExpanded(false)}
                                            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button className="btn-primary px-6 py-2 rounded-xl text-xs font-black uppercase tracking-widest shadow-glow shadow-primary-500/20">
                                            Post
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {!isExpanded && (
                    <div className="flex items-center gap-6 mt-6 pt-6 border-t border-slate-50 dark:border-white/5">
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-primary-500 transition-colors">
                            <ImageIcon className="w-4 h-4 text-primary-500" />
                            <span>Photo</span>
                        </button>
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-emerald-500 transition-colors">
                            <Video className="w-4 h-4 text-emerald-500" />
                            <span>Video</span>
                        </button>
                        <button className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-amber-500 transition-colors">
                            <FileText className="w-4 h-4 text-amber-500" />
                            <span>Event</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Feed Filter */}
            <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-4">
                    <button className="text-[10px] font-black uppercase tracking-widest text-primary-500 border-b-2 border-primary-500 pb-1">Latest</button>
                    <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 pb-1 transition-colors">Popular</button>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400">
                    <span>Sort by:</span>
                    <button className="flex items-center gap-1 text-slate-600 dark:text-slate-200">
                        Top Rated <ImageIcon className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Posts Grid */}
            <div className="grid grid-cols-1 gap-6">
                {mockPosts.map(post => (
                    <PostCard key={post.id} post={post} />
                ))}
            </div>

            {/* Load More */}
            <div className="py-8 text-center">
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-full text-xs font-black uppercase tracking-widest text-slate-500 hover:text-primary-500 hover:border-primary-500 transition-all cursor-pointer shadow-sm">
                    <Plus className="w-4 h-4" />
                    <span>Load More Posts</span>
                </div>
            </div>
        </div>
    );
}

function Plus({ className }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
        </svg>
    );
}
