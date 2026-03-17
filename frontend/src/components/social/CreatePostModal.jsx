import { X, Image as ImageIcon, Globe, Users, Lock, ChevronDown } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../ui/StatusBadge';

export default function CreatePostModal({ isOpen, onClose }) {
    const { user } = useAuth();

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
            <div 
                className="bg-white dark:bg-[#0B1120] rounded-[2rem] w-full max-w-lg shadow-2xl border border-white/20 dark:border-slate-800 overflow-hidden animate-in slide-in-from-bottom-8 duration-500"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-8 py-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-black tracking-tight dark:text-white">Create a Post</h2>
                        <p className="text-xs text-slate-500 font-medium">Share something with the community</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors text-slate-400"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-8">
                    <div className="flex items-center gap-4 mb-6">
                        <UserAvatar user={user} size="md" />
                        <div>
                            <p className="font-bold dark:text-white">{user?.firstname} {user?.lastname}</p>
                            <button className="flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-widest mt-0.5 hover:border-primary-500/50 transition-colors">
                                <Globe className="w-3 h-3" />
                                <span>General Community</span>
                                <ChevronDown className="w-3 h-3" />
                            </button>
                        </div>
                    </div>

                    <textarea 
                        className="w-full bg-transparent border-none p-0 focus:ring-0 text-lg dark:text-white placeholder:text-slate-400 resize-none min-h-[160px]"
                        placeholder="What's on your mind?"
                    />

                    <div className="flex items-center gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
                        <button className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors text-sm font-bold">
                            <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl">
                                <ImageIcon className="w-5 h-5 text-primary-500" />
                            </div>
                            <span>Add Photo</span>
                        </button>
                        <button className="flex items-center gap-2 text-slate-500 hover:text-primary-500 transition-colors text-sm font-bold">
                            <div className="p-2 bg-slate-100 dark:bg-white/5 rounded-xl">
                                <Users className="w-5 h-5 text-emerald-500" />
                            </div>
                            <span>Tag Group</span>
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-8 py-6 bg-slate-50/50 dark:bg-white/2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button className="px-8 py-2.5 bg-primary-500 hover:bg-primary-600 text-white text-sm font-black rounded-xl shadow-glow shadow-primary-500/20 hover:-translate-y-0.5 transition-all uppercase tracking-widest">
                        Post Now
                    </button>
                </div>
            </div>
        </div>
    );
}
