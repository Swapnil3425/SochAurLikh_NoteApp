import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Sparkles, NotebookPen, Sun, Moon } from 'lucide-react';
import Button from '../components/Button';
import { useTheme } from '../context/ThemeContext';

const Landing = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="relative min-h-screen overflow-hidden bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
            {/* Decorative Background Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-3xl opacity-60 animate-pulse-slow"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-3xl opacity-60 animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-[20%] right-[10%] w-[20%] h-[20%] bg-teal-200/30 rounded-full blur-2xl opacity-50 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
            </div>

            {/* Navbar */}
            <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-gradient-to-tr from-primary-600 to-secondary-600 rounded-lg shadow-lg">
                        <NotebookPen className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-300">
                        Soch aur Likh
                    </span>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={toggleTheme}
                        className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                    >
                        {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                    </button>
                    <Link to="/login">
                        <Button variant="ghost" className="hidden sm:inline-flex">Log in</Button>
                    </Link>
                    <Link to="/signup">
                        <Button>Get Started</Button>
                    </Link>
                </div>
            </nav>

            {/* Hero Section */}
            <main className="relative z-10 flex flex-col items-center justify-center px-4 pt-20 pb-32 text-center max-w-5xl mx-auto mt-10">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 mb-6 text-sm font-medium text-primary-700 bg-primary-50 border border-primary-100 dark:bg-primary-900/30 dark:border-primary-800 dark:text-primary-300 rounded-full">
                        <Sparkles className="w-4 h-4" />
                        <span>The future of note-taking is here</span>
                    </div>
                </motion.div>

                <motion.h1
                    className="text-5xl sm:text-7xl font-bold tracking-tight text-slate-900 dark:text-slate-100 mb-8 max-w-4xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.1 }}
                >
                    Soch aur Likh <br />
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 via-secondary-500 to-primary-600 animate-gradient-x">
                        Bas Socho, Aur Likh Do.
                    </span>
                </motion.h1>

                <motion.p
                    className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 mb-10 max-w-2xl leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    Zyaada mat socho, bas likh do. A simple, clutter-free space for your thoughts, ideas, and everything in between.
                </motion.p>

                <motion.div
                    className="flex flex-col sm:flex-row items-center gap-4"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                >
                    <Link to="/signup">
                        <Button size="lg" className="px-8 shadow-xl shadow-primary-500/20">
                            Start for free <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                    </Link>
                </motion.div>

                {/* Feature Grid / Mockup Placeholder */}
                <motion.div
                    className="mt-20 w-full max-w-5xl relative"
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.4 }}
                >
                    <div className="absolute inset-x-0 -top-20 -bottom-20 bg-gradient-to-r from-primary-500/10 to-secondary-500/10 blur-3xl -z-10 rounded-[3rem]"></div>
                    <div className="bg-white/40 backdrop-blur-xl border border-white/40 rounded-2xl shadow-2xl p-4 sm:p-6 ring-1 ring-slate-900/5 dark:bg-slate-900/40 dark:border-slate-800/50">
                        <div className="bg-slate-50 dark:bg-slate-950 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 aspect-[16/9] flex items-center justify-center relative">
                            {/* Abstract UI Representation */}
                            <div className="absolute inset-0 bg-grid-slate-100 dark:bg-grid-slate-900/50 [mask-image:linear-gradient(0deg,white,transparent)]" />
                            <div className="grid grid-cols-12 gap-4 w-full h-full p-8 opacity-60">
                                <div className="col-span-3 bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 hidden sm:block"></div>
                                <div className="col-span-12 sm:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[1, 2, 3, 4, 5, 6].map((i) => (
                                        <div key={i} className="bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-slate-100 dark:border-slate-800 h-32 animate-pulse" style={{ animationDelay: `${i * 0.1}s` }}></div>
                                    ))}
                                </div>
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-slate-400 dark:text-slate-500 font-medium bg-white/80 dark:bg-slate-900/80 px-4 py-2 rounded-full backdrop-blur-sm border border-slate-200 dark:border-slate-800 shadow-sm">
                                    Interactive Dashboard Preview
                                </span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Features List */}
                {/* Why Choose Soch aur Likh Section - Simplified */}
                <div className="mt-24 w-full max-w-4xl text-left">
                    <h2 className="text-3xl font-bold text-center mb-4 text-slate-800 dark:text-slate-100">Why choose <span className="text-primary-600">Soch aur Likh?</span></h2>
                    <p className="text-center text-slate-600 dark:text-slate-400 mb-12 max-w-2xl mx-auto">
                        Simple, fast, and secure. Everything you need to capture your thoughts without the clutter.
                    </p>
                </div>

                {/* Updated Features List - Balanced Hinglish */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full max-w-5xl">
                    {[
                        {
                            title: 'Dark Mode',
                            description: 'Easy on your eyes. Work late into the night comfortably with our beautiful dark mode.',
                            icon: Moon
                        },
                        {
                            title: 'Instant Search',
                            description: 'Find anything instantly. Search through all your notes in milliseconds.',
                            icon: Sparkles
                        },
                        {
                            title: 'Secure Notes',
                            description: 'Keep your secrets safe. Protect your private notes with a secure password.',
                            icon: CheckCircle2
                        },
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            className="p-6 bg-white/50 backdrop-blur-sm border border-white/60 dark:bg-slate-900/40 dark:border-slate-800/50 rounded-xl shadow-sm hover:shadow-md transition-shadow hover:-translate-y-1 duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                        >
                            <div className="w-12 h-12 bg-gradient-to-br from-primary-100 to-secondary-100 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-xl flex items-center justify-center mb-4 text-primary-600 dark:text-primary-400 shadow-inner">
                                <feature.icon className="w-6 h-6" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">{feature.title}</h3>
                            <p className="text-slate-600 dark:text-slate-400 leading-relaxed text-sm">{feature.description}</p>
                        </motion.div>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default Landing;
