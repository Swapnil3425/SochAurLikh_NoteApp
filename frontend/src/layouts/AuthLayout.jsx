import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { NotebookPen } from 'lucide-react';

const AuthLayout = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
            {/* Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/30 rounded-full blur-3xl opacity-50 animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/30 rounded-full blur-3xl opacity-50 animate-pulse-slow" style={{ animationDelay: '2s' }}></div>

            <div className="w-full max-w-md relative z-10">
                <div className="flex justify-center mb-8">
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="p-2 bg-gradient-to-tr from-primary-600 to-secondary-600 rounded-lg shadow-lg group-hover:scale-110 transition-transform">
                            <NotebookPen className="w-6 h-6 text-white" />
                        </div>
                        <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                            LuminaNotes
                        </span>
                    </Link>
                </div>
                <Outlet />
            </div>
        </div>
    );
};

export default AuthLayout;
