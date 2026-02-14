import React from 'react';
import { Outlet } from 'react-router-dom';

const RootLayout = () => {
    return (
        <div className="min-h-screen bg-slate-50 dark:bg-transparent font-sans text-slate-900 dark:text-slate-100">
            <Outlet />
        </div>
    );
};

export default RootLayout;
