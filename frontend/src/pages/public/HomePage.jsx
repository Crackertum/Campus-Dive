import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, Users, Code, Rocket, Zap, Search, MessageSquare, Shield, Star, Award, TrendingUp } from 'lucide-react';

export default function HomePage() {
    const vision = [
        { icon: Users, title: 'CONNECT', desc: 'Unite TUM student developers across all faculties.', color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { icon: Code, title: 'COLLABORATE', desc: 'Build real-world projects together — code & deploy.', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { icon: Award, title: 'GROW', desc: 'Earn portfolio-ready skills & real experience.', color: 'text-amber-500', bg: 'bg-amber-500/10' },
    ];

    const roadmap = [
        { wk: '1-2', label: 'REQUIREMENTS & PLANNING', desc: 'Scope, Team roles, Tools & specs.', active: true },
        { wk: '3-4', label: 'UI / UX DESIGN', desc: 'Wireframes, Mockups, Theme approval.', active: true },
        { wk: '5-7', label: 'FRONTEND DEVELOPMENT', desc: 'HTML/CSS/JS pages, Responsive layout.', active: true },
        { wk: '8-10', label: 'BACKEND INTEGRATION', desc: 'PHP, Node.js, MySQL, Auth system.', active: true },
        { wk: '11-12', label: 'TESTING & QA', desc: 'Bug fixes, Sec review, User testing.', active: false },
        { wk: '13', label: 'DEPLOYMENT & LAUNCH', desc: 'Live hosting, Domain, Launch.', active: false },
    ];

    const features = [
        { icon: Shield, title: 'User Auth', desc: 'Secure register, login and profile management.' },
        { icon: MessageSquare, title: 'Posts & Ideas', desc: 'Discuss projects, ask questions, share insights.' },
        { icon: Users, title: 'Groups', desc: 'Join communities, clubs and specialized channels.' },
        { icon: Star, title: 'Showcase', desc: 'Exhibit your projects and build your portfolio.' },
        { icon: Zap, title: 'Admin Panel', desc: 'Comprehensive moderation and analytics dashboard.' },
        { icon: Shield, title: 'Security', desc: 'Modern hashing, RBAC and sanitized inputs.' },
    ];

    return (
        <div className="space-y-24 pb-20 overflow-hidden">
            {/* Hero Section */}
            <section className="relative px-4 pt-20 pb-20 md:pt-32 md:pb-32 flex flex-col items-center text-center">
                {/* Decorative Blobs */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full -z-10">
                    <div className="absolute top-10 left-10 w-72 h-72 bg-primary-500/10 rounded-full blur-[100px] animate-pulse-soft" />
                    <div className="absolute bottom-10 right-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-[100px]" />
                </div>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-900/20 border border-primary-100 dark:border-primary-800 text-primary-600 dark:text-primary-400 text-sm font-bold mb-8 animate-fade-in shadow-sm">
                    <Star className="w-4 h-4 fill-primary-600" />
                    <span>TUM Tech Group • Student Developers Project</span>
                </div>

                <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 tracking-tighter leading-tight animate-fade-in delay-100">
                    THE CAMPUS <span className="text-primary-600">DIVE</span>
                </h1>

                <p className="text-xl md:text-2xl text-surface-600 dark:text-surface-400 max-w-2xl font-medium animate-fade-in delay-200">
                    "Develop the campus. Connect the minds. <br className="hidden md:block" /> Build the future."
                </p>

                <div className="flex flex-col sm:flex-row gap-4 mt-12 animate-fade-in delay-300">
                    <Link to="/register" className="btn-primary py-4 px-8 text-lg font-bold shadow-glow">
                        Register as Student
                    </Link>
                    <Link to="/about" className="btn-secondary py-4 px-8 text-lg font-bold">
                        Learn Our Goal
                    </Link>
                </div>
            </section>

            {/* Vision Section */}
            <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
                {vision.map((v, i) => (
                    <div key={v.title} className={`card p-8 group hover:scale-[1.02] transition-transform delay-${i * 100}`}>
                        <div className={`w-14 h-14 rounded-2xl ${v.bg} ${v.color} flex items-center justify-center mb-6`}>
                            <v.icon className="w-7 h-7" />
                        </div>
                        <h3 className="text-2xl font-black mb-3 tracking-tight">{v.title}</h3>
                        <p className="text-surface-600 dark:text-surface-400 font-medium leading-relaxed">
                            {v.desc}
                        </p>
                    </div>
                ))}
            </section>

            {/* Development Roadmap */}
            <section className="max-w-7xl mx-auto px-4 py-20 bg-surface-100/50 dark:bg-white/5 rounded-[3rem] border border-white/10 glass">
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-extrabold mb-4">Project Roadmap</h2>
                    <p className="text-surface-500 font-medium uppercase tracking-widest text-sm">13 Weeks Direction</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-y-12 gap-x-8 px-8">
                    {roadmap.map((r, i) => (
                        <div key={r.label} className="relative flex gap-6">
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 ${r.active ? 'bg-primary-500 border-primary-500 text-white' : 'border-surface-300 dark:border-surface-700 text-surface-400'}`}>
                                    {i + 1}
                                </div>
                                {i < roadmap.length - 1 && (
                                    <div className={`w-0.5 flex-1 mt-2 ${r.active ? 'bg-primary-500/30' : 'bg-surface-200 dark:bg-surface-800'}`} />
                                )}
                            </div>
                            <div>
                                <h4 className="font-black text-lg mb-1 tracking-tight">{r.label}</h4>
                                <p className="text-primary-600 dark:text-primary-400 text-xs font-bold mb-2">Weeks {r.wk}</p>
                                <p className="text-surface-500 text-sm font-medium leading-normal">{r.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Core Features */}
            <section className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, i) => (
                        <div key={f.title} className="p-6 rounded-3xl border border-surface-200 dark:border-surface-800 hover:border-primary-500 transition-all flex items-start gap-4">
                            <div className="w-10 h-10 shrink-0 rounded-xl bg-surface-100 dark:bg-surface-800 flex items-center justify-center">
                                <f.icon className="w-5 h-5 text-primary-500" />
                            </div>
                            <div>
                                <h4 className="font-bold mb-1">{f.title}</h4>
                                <p className="text-sm text-surface-500 leading-relaxed font-medium">{f.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Stats / Expected Outcomes */}
            <section className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                    { val: '18', label: 'Slides Prepared' },
                    { val: '7', label: 'Team Roles' },
                    { val: '10+', label: 'Web Pages' },
                    { val: '13 Wks', label: 'Timeline' },
                    { val: '3-8K', label: 'Budget (KES)' },
                    { val: '1 Live', label: 'Platform' },
                ].map(stat => (
                    <div key={stat.label} className="card p-6 text-center">
                        <p className="text-3xl font-black text-primary-500 mb-1">{stat.val}</p>
                        <p className="text-[10px] font-bold text-surface-400 uppercase tracking-widest leading-tight">{stat.label}</p>
                    </div>
                ))}
            </section>

            {/* Call to Action */}
            <section className="max-w-4xl mx-auto px-4 text-center">
                <div className="card p-12 bg-gradient-to-br from-primary-600 to-indigo-700 text-white overflow-hidden relative">
                    <div className="absolute inset-0 bg-mesh-primary opacity-20" />
                    <h2 className="text-4xl font-black mb-4 relative z-10 tracking-tight">Ready to Dive in?</h2>
                    <p className="text-primary-100 text-lg mb-8 relative z-10 max-w-md mx-auto font-medium">
                        Join the Technical University of Mombasa's most ambitious student project yet.
                    </p>
                    <Link to="/register" className="btn-primary-white py-4 px-10 text-lg font-bold relative z-10">
                        Join TUM Tech Group
                    </Link>
                </div>
            </section>
        </div>
    );
}
