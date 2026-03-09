import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Moon, Sun, CheckCircle } from 'lucide-react';
import api from '../../api/client';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const { login } = useAuth();
    const toast = useToast();
    const { dark, toggle } = useTheme();
    const navigate = useNavigate();
    const [params] = useSearchParams();

    const verified = params.get('verified') === 'true';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            const res = await login(email, password);
            toast.success('Welcome back!');
            const role = res.data.user.role || res.data.user.role_name;
            navigate(role === 'admin' || role === 'Admin' ? '/admin' : '/dashboard');
        } catch (err) {
            if (err.errors) {
                setErrors(err.errors);
            } else {
                setErrors({ general: err.message });
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex bg-surface-50 dark:bg-surface-950 transition-colors duration-500">
            {/* Left Panel - Visual (World-Class Aesthetic) */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0 bg-mesh-primary opacity-50" />
                <div className="absolute inset-0 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900" />

                {/* Decorative Blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary-400/20 rounded-full blur-[120px] animate-pulse-soft" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/20 rounded-full blur-[120px]" />

                <div className="relative flex flex-col justify-center px-20 z-10 animate-premium">
                    <img src="/logo.png" alt="Campus Dive" className="w-16 h-16 object-contain rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 mb-12 shadow-glow" />
                    <h1 className="text-6xl font-extrabold text-white mb-8 tracking-tighter leading-tight">
                        Campus<span className="text-primary-300">Dive</span>.
                    </h1>
                    <p className="text-xl text-primary-100/80 max-w-md leading-relaxed font-light">
                        Accelerate your career with the next generation of campus recruitment. Modern, fast, and remarkably intuitive.
                    </p>

                    <div className="mt-16 pt-12 border-t border-white/10 flex items-center gap-8">
                        <div className="flex -space-x-4">
                            {['AU', 'BK', 'CR', 'DM'].map((initials, i) => (
                                <div key={i} className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white text-sm font-semibold shadow-lg">
                                    {initials}
                                </div>
                            ))}
                        </div>
                        <div>
                            <p className="text-white font-semibold">Join 500+ Students</p>
                            <p className="text-primary-300/80 text-sm">Already landed their dream roles</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-8 sm:p-16 relative">
                {/* Background Decorations for Right Panel */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -z-10" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -z-10" />

                <div className="w-full max-w-md animate-premium delay-150">
                    {/* Theme Toggle */}
                    <div className="flex justify-end mb-12">
                        <button onClick={toggle} className="btn-icon bg-surface-100/50 dark:bg-surface-800/50 glass">
                            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Mobile Logo */}
                    <div className="lg:hidden flex items-center gap-4 mb-12">
                        <img src="/logo.png" alt="Campus Dive" className="w-14 h-14 object-contain rounded-xl shadow-glow" />
                        <span className="font-bold text-2xl tracking-tight">Campus Dive</span>
                    </div>

                    <h2 className="text-4xl font-extrabold mb-3 tracking-tight">Welcome back</h2>
                    <p className="text-surface-500 dark:text-surface-400 mb-10 text-lg font-medium">Continue your journey.</p>

                    {errors.general && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium mb-2">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    className={`input-field pl-12 ${errors.email ? 'border-red-500 focus:ring-red-500/50' : ''}`}
                                    placeholder="user@gmail.com"
                                    required
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    className={`input-field pl-12 pr-12 ${errors.password ? 'border-red-500 focus:ring-red-500/50' : ''}`}
                                    placeholder="••••••••"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
                        </div>

                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" className="rounded border-surface-300 text-primary-600 focus:ring-primary-500" />
                                <span className="text-sm text-surface-600 dark:text-surface-400">Remember me</span>
                            </label>
                            <Link to="/forgot-password" className="text-sm font-medium text-primary-600 hover:text-primary-700">
                                Forgot password?
                            </Link>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-primary w-full py-3 text-base"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Sign In <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>

                        <div className="relative py-4 flex items-center gap-4">
                            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-800" />
                            <span className="text-xs font-bold text-surface-400 uppercase tracking-widest">Or continue with</span>
                            <div className="flex-1 h-px bg-surface-200 dark:bg-surface-800" />
                        </div>

                        <button
                            type="button"
                            onClick={async () => {
                                try {
                                    const res = await api.get('/auth/google-url');
                                    if (res.data?.url) {
                                        window.location.href = res.data.url;
                                    }
                                } catch (err) {
                                    toast.error(err.message || 'Failed to initialize Google Login');
                                }
                            }}
                            className="w-full py-3 px-4 rounded-2xl bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 hover:border-primary-500 dark:hover:border-primary-500 transition-all flex items-center justify-center gap-3 font-semibold shadow-sm"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                            <span>Sign in with Google</span>
                        </button>
                    </form>

                    <p className="mt-8 text-center text-sm text-surface-500 dark:text-surface-400">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-semibold text-primary-600 hover:text-primary-700">
                            Register as Student
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
