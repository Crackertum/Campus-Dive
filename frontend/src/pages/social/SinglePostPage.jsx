import { useParams, useNavigate } from 'react-router-dom';
import { 
    ChevronLeft, Heart, MessageSquare, Share2, 
    MoreHorizontal, Send, Smile, Paperclip 
} from 'lucide-react';
import PostCard from '../../components/social/PostCard';

const mockPost = {
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
};

const mockComments = [
    { 
        id: 1, 
        author: 'Kevin O.', 
        initials: 'KO', 
        time: '1h ago', 
        text: 'The UI looks incredibly clean! Love the glassmorphism effects.', 
        likes: 5 
    },
    { 
        id: 2, 
        author: 'Sara R.', 
        initials: 'SR', 
        time: '45m ago', 
        text: 'Great work Lena! The performance is also noticeably better.', 
        likes: 2 
    }
];

export default function SinglePostPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 pt-4">
            {/* Back Nav */}
            <button 
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary-500 transition-colors px-2 mb-4"
            >
                <ChevronLeft className="w-5 h-5" />
                <span>Back to Hub</span>
            </button>

            {/* Post View */}
            <PostCard post={mockPost} />

            {/* Comments Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase">Comments ({mockPost.comments})</h3>
                    <button className="text-[10px] font-black tracking-[0.2em] text-slate-400 uppercase hover:text-primary-500 transition-colors">Sort by Top</button>
                </div>

                {/* Comment Input */}
                <div className="card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-400 shrink-0 border border-slate-200 dark:border-slate-800">
                            LM
                        </div>
                        <div className="flex-1 relative">
                            <textarea 
                                className="w-full bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-slate-800 rounded-2xl p-4 pr-12 text-sm dark:text-white placeholder:text-slate-500 resize-none focus:ring-1 focus:ring-primary-500/50 transition-all min-h-[56px]"
                                placeholder="Write a comment..."
                            />
                            <div className="absolute right-3 bottom-3 flex items-center gap-2 text-slate-400">
                                <Smile className="w-5 h-5 hover:text-primary-500 cursor-pointer" />
                                <Send className="w-5 h-5 hover:text-primary-500 cursor-pointer" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Comments List */}
                <div className="space-y-4">
                    {mockComments.map(comment => (
                        <div key={comment.id} className="card p-6 border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120] hover:border-slate-300 dark:hover:border-slate-700 transition-all">
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-full bg-primary-500/10 flex items-center justify-center text-primary-500 font-bold text-xs shrink-0 shadow-sm">
                                    {comment.initials}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center justify-between mb-2">
                                        <div>
                                            <span className="text-sm font-black dark:text-white leading-none">{comment.author}</span>
                                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-3">{comment.time}</span>
                                        </div>
                                        <button className="p-1 hover:bg-slate-100 dark:hover:bg-white/5 rounded-lg text-slate-400">
                                            <MoreHorizontal className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <p className="text-sm dark:text-slate-300 leading-relaxed mb-4">
                                        {comment.text}
                                    </p>
                                    <div className="flex items-center gap-6">
                                        <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-500 transition-colors">
                                            <Heart className="w-3.5 h-3.5" />
                                            <span>{comment.likes} Likes</span>
                                        </button>
                                        <button className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-500 transition-colors">
                                            <MessageSquare className="w-3.5 h-3.5" />
                                            <span>Reply</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center pt-4">
                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-primary-500 transition-colors">View more comments</button>
                </div>
            </section>
        </div>
    );
}
