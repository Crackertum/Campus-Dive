import { Award, Target, Eye, Shield, Users, Globe, BookOpen, Lightbulb } from 'lucide-react';

export default function AboutPage() {
    return (
        <div className="space-y-24 pb-20">
            {/* Header */}
            <section className="max-w-7xl mx-auto px-4 pt-20 text-center">
                <h1 className="text-5xl md:text-6xl font-black mb-6 tracking-tighter leading-tight">
                    Beyond the <span className="text-primary-600 uppercase">Code</span>
                </h1>
                <p className="text-xl text-surface-600 dark:text-surface-400 max-w-3xl mx-auto font-medium leading-relaxed">
                    Campus Dive is more than a recruitment portal — it's the heartbeat of the TUM student developer community, aiming to bridge the gap between academia and industry.
                </p>
            </section>

            {/* TUM Alignment Section */}
            <section className="max-w-7xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                <div className="space-y-8">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest">
                        Technical University of Mombasa
                    </div>
                    <h2 className="text-4xl font-extrabold tracking-tight">Aligned with Excellence</h2>
                    <p className="text-lg text-surface-600 dark:text-surface-400 font-medium leading-relaxed">
                        The Technical University of Mombasa envisions itself as a university of global excellence in advancing knowledge, science, and technology. Campus Dive is proud to be a student-led initiative that puts this vision into practice.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="card p-6 border-l-4 border-primary-500">
                            <Target className="w-8 h-8 text-primary-500 mb-4" />
                            <h4 className="font-bold mb-2">Our Mission</h4>
                            <p className="text-sm text-surface-500 font-medium leading-relaxed">
                                To advance practical knowledge and innovation through student collaboration, serving the industry and the community.
                            </p>
                        </div>
                        <div className="card p-6 border-l-4 border-emerald-500">
                            <Eye className="w-8 h-8 text-emerald-500 mb-4" />
                            <h4 className="font-bold mb-2">Our Vision</h4>
                            <p className="text-sm text-surface-500 font-medium leading-relaxed">
                                To become the premier incubator for student talent and real-world technology solutions at TUM.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative">
                    <div className="aspect-square rounded-[3rem] bg-gradient-to-br from-primary-50 to-indigo-50 dark:from-primary-900/10 dark:to-indigo-900/10 border border-white/20 flex flex-col justify-center p-12 text-center overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl" />
                        <div className="relative z-10 flex flex-col items-center">
                            <Users className="w-16 h-16 text-primary-500 mb-6" />
                            <p className="text-5xl font-black mb-2 tracking-tighter">TUM TECH</p>
                            <p className="text-xl font-bold text-surface-400 tracking-[0.3em] uppercase mb-8">GROUP</p>
                            <p className="text-sm text-surface-500 max-w-xs font-medium italic">
                                "The engine behind next-gen student innovation at the coast."
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Key Goals */}
            <section className="bg-surface-100/50 dark:bg-white/5 border-y border-white/10 py-24">
                <div className="max-w-7xl mx-auto px-4">
                    <h2 className="text-4xl font-black text-center mb-16 tracking-tight">Our Strategic Goals</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { icon: Globe, title: 'Industry Connect', desc: 'Establishing collaborative research linkages and partnerships.' },
                            { icon: Lightbulb, title: 'Innovation', desc: 'Fostering creativity and practical application of knowledge.' },
                            { icon: BookOpen, title: 'Research', desc: 'Promoting independent research cultures within the University.' },
                            { icon: Award, title: 'Scholarship', desc: 'Nurturing academic excellence in a dynamic learning environment.' }
                        ].map(goal => (
                            <div key={goal.title} className="text-center group">
                                <div className="w-16 h-16 rounded-full bg-white dark:bg-surface-800 shadow-soft mx-auto flex items-center justify-center mb-6 border border-surface-200 dark:border-surface-700 group-hover:bg-primary-500 group-hover:text-white transition-all">
                                    <goal.icon className="w-7 h-7" />
                                </div>
                                <h4 className="font-bold text-lg mb-2">{goal.title}</h4>
                                <p className="text-sm text-surface-500 font-medium leading-relaxed">{goal.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Core Values */}
            <section className="max-w-7xl mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                    <div className="grid grid-cols-2 gap-4">
                        {['Integrity', 'Professionalism', 'Teamwork', 'Creativity'].map(val => (
                            <div key={val} className="p-8 rounded-3xl bg-surface-50 dark:bg-surface-900 border border-white/5 text-center shadow-soft">
                                <span className="font-black text-primary-500 tracking-tighter text-3xl">{val[0]}</span>
                                <p className="font-bold text-sm tracking-widest uppercase mt-2">{val}</p>
                            </div>
                        ))}
                    </div>
                    <div>
                        <h2 className="text-4xl font-extrabold mb-6 tracking-tight">Grounding in Values</h2>
                        <p className="text-lg text-surface-600 dark:text-surface-400 font-medium leading-relaxed mb-8">
                            Like our mother institution, we uphold values that ensure our community thrives in a sustainable and professional environment. We are focused on technology transfer for development.
                        </p>
                        <ul className="space-y-4 font-bold text-surface-700 dark:text-white">
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary-500" />
                                <span>Centering student developers in the sosial pillar</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary-500" />
                                <span>Practical application of science and technology</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-primary-500" />
                                <span>Fostering Mutually beneficial partnerships</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </section>
        </div>
    );
}
