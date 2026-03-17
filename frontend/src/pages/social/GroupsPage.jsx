import { Search, Plus, Filter, Users as UsersIcon, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';

const myGroups = [
    { id: 1, name: 'Web Devs TUM', initials: 'WD', color: 'from-blue-500 to-indigo-600', members: 1240, posts: 42 },
    { id: 2, name: 'Design Guild', initials: 'DG', color: 'from-rose-500 to-pink-600', members: 850, posts: 18 },
];

const discoverGroups = [
    { id: 3, name: 'AI/ML Research', initials: 'AI', color: 'from-emerald-500 to-teal-600', members: 2100, posts: 89 },
    { id: 4, name: 'Cyber Security', initials: 'CS', color: 'from-amber-500 to-orange-600', members: 1560, posts: 34 },
    { id: 5, name: 'Open Source Hub', initials: 'OS', color: 'from-indigo-500 to-blue-600', members: 920, posts: 12 },
    { id: 6, name: 'Game Dev Society', initials: 'GD', color: 'from-purple-500 to-violet-600', members: 780, posts: 56 },
];

export default function GroupsPage() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black tracking-tight dark:text-white">Social Groups</h1>
                    <p className="text-sm text-slate-500 font-medium">Connect with fellow developers in your interest areas</p>
                </div>
                <button className="btn-primary rounded-full px-6 h-12 text-xs font-black uppercase tracking-widest shadow-glow shadow-primary-500/20">
                    <Plus className="w-5 h-5" />
                    <span>Create Group</span>
                </button>
            </div>

            {/* My Groups */}
            <section>
                <h3 className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase mb-6 px-2">My Groups</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {myGroups.map(group => (
                        <GroupCard key={group.id} group={group} isJoined={true} />
                    ))}
                </div>
            </section>

            {/* Discover Groups */}
            <section>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <h3 className="text-[10px] font-black tracking-[0.3em] text-slate-400 uppercase px-2">Discover Communities</h3>
                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Search groups..." 
                                className="pl-9 pr-4 py-2 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-full text-xs font-medium dark:text-white focus:ring-1 focus:ring-primary-500 w-full sm:w-64 transition-all"
                            />
                        </div>
                        <button className="p-2 bg-white dark:bg-[#0B1120] border border-slate-200 dark:border-slate-800 rounded-full text-slate-400 hover:text-primary-500 transition-colors">
                            <Filter className="w-4 h-4" />
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {discoverGroups.map(group => (
                        <GroupCard key={group.id} group={group} isJoined={false} />
                    ))}
                </div>
            </section>
        </div>
    );
}

function GroupCard({ group, isJoined }) {
    return (
        <div className="card-premium group overflow-hidden border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B1120]">
            <div className={`h-24 bg-gradient-to-br ${group.color} relative overflow-hidden`}>
                <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700" />
            </div>
            
            <div className="p-6 pt-0 -mt-8 relative z-10 text-center">
                <div className={`w-16 h-16 rounded-[1.25rem] bg-gradient-to-br ${group.color} border-4 border-white dark:border-[#0B1120] flex items-center justify-center text-white text-xl font-black mx-auto mb-4 shadow-xl`}>
                    {group.initials}
                </div>
                
                <h4 className="text-lg font-black dark:text-white leading-tight mb-1 group-hover:text-primary-500 transition-colors">
                    {group.name}
                </h4>
                
                <div className="flex items-center justify-center gap-4 py-4 mb-6 border-b border-slate-50 dark:border-white/5">
                    <div className="text-center">
                        <p className="text-sm font-black dark:text-white">{(group.members/1000).toFixed(1)}k</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Members</p>
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-black dark:text-white">{group.posts}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Posts/mo</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link 
                        to={`/social/groups/${group.id}`}
                        className="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-all text-center"
                    >
                        View Group
                    </Link>
                    {!isJoined && (
                        <button className="flex-1 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-glow shadow-primary-500/10 hover:-translate-y-0.5 transition-all">
                            Join Hub
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
