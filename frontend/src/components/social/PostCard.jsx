import { useState } from 'react';
import { Heart, MessageSquare, Share2, MoreHorizontal, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PostCard({ post }) {
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(post.likes);

    const handleLike = () => {
        setIsLiked(!isLiked);
        setLikesCount(prev => isLiked ? prev - 1 : prev + 1);
    };

    return (
        <article className="post-card card overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
            {/* Header */}
            <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link to={`/social/profile/${post.id}`} className={`w-10 h-10 rounded-full bg-gradient-to-br ${post.gradient} flex items-center justify-center text-white text-xs font-black shadow-sm shrink-0`}>
                        {post.initials}
                    </Link>
                    <div className="min-w-0">
                        <Link to={`/social/profile/${post.id}`} className="text-sm font-black dark:text-white hover:text-primary-500 transition-colors block leading-tight truncate">
                            {post.author}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest">{post.group}</span>
                            <span className="text-[10px] text-slate-400 font-bold">•</span>
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{post.time}</span>
                        </div>
                    </div>
                </div>
                <button className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors">
                    <MoreHorizontal className="w-5 h-5" />
                </button>
            </div>

            {/* Content */}
            <div className="px-4 pb-4">
                <p className="text-sm dark:text-slate-200 leading-relaxed mb-4">
                    {post.content}
                </p>

                {post.hasImage && (
                    <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 aspect-video relative group cursor-pointer">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <img 
                            src={`/api/placeholder/1200/675`} 
                            alt="Post visual" 
                            className="w-full h-full object-cover"
                        />
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="px-2 py-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1">
                <button 
                    onClick={handleLike}
                    className={`action-btn flex-1 group ${isLiked ? 'liked text-primary-500 bg-primary-500/5' : ''}`}
                >
                    <div className="like-btn transition-transform">
                        <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{likesCount} Likes</span>
                </button>

                <button className="action-btn flex-1">
                    <MessageSquare className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{post.comments} Comments</span>
                </button>

                <button className="action-btn flex-1">
                    <Share2 className="w-5 h-5" />
                    <span className="text-[10px] font-black uppercase tracking-widest">Share</span>
                </button>
            </div>
        </article>
    );
}
