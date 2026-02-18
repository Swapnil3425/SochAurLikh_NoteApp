import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import axiosInstance from '../utils/axiosInstance';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
    const navigate = useNavigate();
    const { login } = useAuth();

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState(null);

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!name) {
            setError("Please enter your name.");
            return;
        }

        if (!email) {
            setError("Please enter your email.");
            return;
        }

        if (!password) {
            setError("Please enter a password.");
            return;
        }

        setError("");
        setIsLoading(true);

        try {
            const response = await axiosInstance.post("/create-account", {
                fullName: name,
                email: email,
                password: password,
            });

            if (response.data && response.data.error) {
                setError(response.data.message);
                return;
            }

            if (response.data && response.data.accessToken) {
                login(response.data.user, response.data.accessToken);
                navigate('/dashboard');
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            } else {
                setError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-900 relative overflow-hidden">
            {/* Animated Gradient Background */}
            <div className="absolute inset-0 w-full h-full bg-slate-50 dark:bg-slate-950 z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-400/30 rounded-full blur-[100px] animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-400/30 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-[40%] left-[40%] w-[30%] h-[30%] bg-teal-300/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '4s' }}></div>
            </div>

            {/* Back to Home Link */}
            <Link to="/" className="absolute top-8 left-8 z-20 flex items-center gap-2 text-slate-500 hover:text-primary-600 dark:text-slate-400 dark:hover:text-primary-400 transition-colors">
                <ArrowRight className="w-4 h-4 rotate-180" /> Back to Home
            </Link>

            <div className="relative z-10 w-full max-w-[400px] px-4">
                <Card className="p-8 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/50 dark:border-slate-800">
                    <div className="text-center mb-8">
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Join Soch aur Likh</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">Bas socho, aur likh do.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="Aravind Sharma"
                            icon={User}
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="you@example.com"
                            icon={Mail}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <div className="relative">
                            <Input
                                label="Password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Create a strong password"
                                icon={Lock}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-[34px] text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>

                        {error && <p className="text-red-500 text-xs pb-1">{error}</p>}

                        <Button type="submit" className="w-full shadow-lg shadow-primary-500/30" isLoading={isLoading}>
                            Create Account <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </form>

                    <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 text-center">
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-semibold transition-colors">
                                Sign in
                            </Link>
                        </p>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Signup;
