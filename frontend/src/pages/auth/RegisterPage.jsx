import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useTheme } from '../../context/ThemeContext';
import { User, Mail, Lock, Eye, EyeOff, Phone, CreditCard, ArrowRight, Moon, Sun, CheckCircle } from 'lucide-react';

export default function RegisterPage() {
    const [form, setForm] = useState({
        firstname: '', lastname: '', email: '', phone: '', student_id: '',
        password: '', confirm_password: '',
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState({});
    const [success, setSuccess] = useState(false);
    const { register } = useAuth();
    const toast = useToast();
    const { dark, toggle } = useTheme();

    const update = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

    // Password strength
    const getStrength = (pw) => {
        let s = 0;
        if (pw.length >= 6) s++;
        if (pw.length >= 8) s++;
        if (/[A-Z]/.test(pw)) s++;
        if (/[0-9]/.test(pw)) s++;
        if (/[^A-Za-z0-9]/.test(pw)) s++;
        return s;
    };

    const strength = getStrength(form.password);
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
    const strengthColors = ['', 'bg-red-500', 'bg-orange-500', 'bg-amber-500', 'bg-emerald-500', 'bg-emerald-600'];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});
        setLoading(true);

        try {
            await register(form);
            setSuccess(true);
            toast.success('Registration successful! Check your email.');
        } catch (err) {
            if (err.errors) setErrors(err.errors);
            else setErrors({ general: err.message });
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6">
                <div className="max-w-md w-full text-center">
                    <div className="w-20 h-20 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-10 h-10 text-emerald-500" />
                    </div>
                    <h2 className="text-2xl font-bold mb-3">Check your email</h2>
                    <p className="text-surface-500 dark:text-surface-400 mb-8">
                        We've sent a verification link to <strong className="text-surface-700 dark:text-surface-300">{form.email}</strong>.
                        Please click the link to activate your account.
                    </p>
                    <Link to="/login" className="btn-primary">
                        Back to Login
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Panel */}
            <div className="hidden lg:flex lg:w-5/12 relative overflow-hidden bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900">
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-40 left-10 w-80 h-80 bg-white rounded-full blur-3xl" />
                    <div className="absolute bottom-10 right-10 w-64 h-64 bg-primary-300 rounded-full blur-3xl" />
                </div>
                <div className="relative flex flex-col justify-center px-16 z-10">
                    <img src="/logo.png" alt="Campus Dive" className="w-14 h-14 object-contain rounded-xl bg-white/20 backdrop-blur mb-8" />
                    <h1 className="text-4xl font-bold text-white mb-6 leading-tight">
                        Start Your<br />Journey Today
                    </h1>
                    <p className="text-lg text-primary-200 max-w-md leading-relaxed">
                        Join hundreds of tech students connecting with top campus recruitment opportunities.
                    </p>
                    <div className="mt-10 space-y-4">
                        {['Track your application in real-time', 'Upload documents securely', 'Direct messaging with recruiters'].map((text, i) => (
                            <div key={i} className="flex items-center gap-3 text-primary-100">
                                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                                <span className="text-sm">{text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 overflow-y-auto">
                <div className="w-full max-w-lg">
                    <div className="flex justify-end mb-6">
                        <button onClick={toggle} className="btn-icon">
                            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>
                    </div>

                    <div className="lg:hidden flex items-center gap-3 mb-8">
                        <img src="/logo.png" alt="Campus Dive" className="w-11 h-11 object-contain rounded-xl shadow-glow" />
                        <span className="font-bold text-xl">Campus Dive</span>
                    </div>

                    <h2 className="text-3xl font-bold mb-2">Create an account</h2>
                    <p className="text-surface-500 dark:text-surface-400 mb-8">Join our recruitment platform</p>

                    {errors.general && (
                        <div className="mb-6 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-sm text-red-700 dark:text-red-400">
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">First Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                    <input type="text" value={form.firstname} onChange={update('firstname')} className={`input-field pl-11 ${errors.firstname ? 'border-red-500' : ''}`} placeholder="John" required />
                                </div>
                                {errors.firstname && <p className="mt-1 text-xs text-red-500">{errors.firstname}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Last Name</label>
                                <div className="relative">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                    <input type="text" value={form.lastname} onChange={update('lastname')} className={`input-field pl-11 ${errors.lastname ? 'border-red-500' : ''}`} placeholder="Doe" required />
                                </div>
                                {errors.lastname && <p className="mt-1 text-xs text-red-500">{errors.lastname}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                <input type="email" value={form.email} onChange={update('email')} className={`input-field pl-11 ${errors.email ? 'border-red-500' : ''}`} placeholder="john@university.edu" required />
                            </div>
                            {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Phone</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                    <input type="tel" value={form.phone} onChange={update('phone')} className={`input-field pl-11 ${errors.phone ? 'border-red-500' : ''}`} placeholder="+254..." required />
                                </div>
                                {errors.phone && <p className="mt-1 text-xs text-red-500">{errors.phone}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1.5">Student ID</label>
                                <div className="relative">
                                    <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                    <input type="text" value={form.student_id} onChange={update('student_id')} className={`input-field pl-11 ${errors.student_id ? 'border-red-500' : ''}`} placeholder="STU-001" required />
                                </div>
                                {errors.student_id && <p className="mt-1 text-xs text-red-500">{errors.student_id}</p>}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                <input type={showPassword ? 'text' : 'password'} value={form.password} onChange={update('password')} className={`input-field pl-11 pr-11 ${errors.password ? 'border-red-500' : ''}`} placeholder="Min. 6 characters" required minLength={6} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600">
                                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {form.password && (
                                <div className="mt-2">
                                    <div className="flex gap-1 mb-1">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= strength ? strengthColors[strength] : 'bg-surface-200 dark:bg-surface-700'}`} />
                                        ))}
                                    </div>
                                    <p className="text-xs text-surface-500">{strengthLabels[strength]}</p>
                                </div>
                            )}
                            {errors.password && <p className="mt-1 text-xs text-red-500">{errors.password}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                                <input type="password" value={form.confirm_password} onChange={update('confirm_password')} className={`input-field pl-11 ${errors.confirm_password ? 'border-red-500' : ''}`} placeholder="••••••••" required />
                            </div>
                            {errors.confirm_password && <p className="mt-1 text-xs text-red-500">{errors.confirm_password}</p>}
                        </div>

                        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>Create Account <ArrowRight className="w-4 h-4" /></>
                            )}
                        </button>
                    </form>

                    <p className="mt-6 text-center text-sm text-surface-500 dark:text-surface-400">
                        Already have an account?{' '}
                        <Link to="/login" className="font-semibold text-primary-600 hover:text-primary-700">Sign In</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
