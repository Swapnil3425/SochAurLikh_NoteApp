import React, { forwardRef } from 'react';
import { cn } from '../utils/cn';

const Input = forwardRef(({ className, icon: Icon, label, error, ...props }, ref) => {
    return (
        <div className="w-full space-y-1">
            {label && <label className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider ml-1 block mb-1.5">{label}</label>}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors duration-200">
                        <Icon className="w-5 h-5" />
                    </div>
                )}
                <input
                    ref={ref}
                    className={cn(
                        'w-full bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 text-sm rounded-xl focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/20 focus:border-primary-500 dark:focus:border-primary-500 block p-3 transition-all duration-200 placeholder:text-slate-400 dark:placeholder:text-slate-500',
                        Icon && 'pl-10',
                        error && 'border-red-500 focus:border-red-500 focus:ring-red-100',
                        className
                    )}
                    {...props}
                />
            </div>
            {error && <p className="text-xs text-red-500 ml-1 mt-1">{error}</p>}
        </div>
    );
});

Input.displayName = 'Input';

export default Input;
