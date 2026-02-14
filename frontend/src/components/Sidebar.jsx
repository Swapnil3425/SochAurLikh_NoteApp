import React, { useState, useEffect } from 'react';
import { NavLink, Link, useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutGrid,
    FileText,
    Star,
    Archive,
    Trash2,
    Settings,
    LogOut,
    NotebookPen,
    Plus,
    Sun,
    Moon,
    Lock
} from 'lucide-react';
import { cn } from '../utils/cn';
import Button from './Button';

const Sidebar = ({ className }) => {
    const { user, logout, setPrivateNotesUnlocked } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [tags, setTags] = useState([]);

    const fetchTags = async () => {
        try {
            const response = await axiosInstance.get("/get-all-tags");
            if (response.data && response.data.tags) {
                const pinnedTags = ['Personal', 'Work', 'Study'];
                const otherDefaults = ['Ideas', 'Travel'];
                const fetchedTags = response.data.tags;

                // Create a Set of lowercase pinned tags for cleanup
                const pinnedTagsLower = new Set(pinnedTags.map(tag => tag.toLowerCase()));

                // 1. Get functional tags (fetchedTags excluding pinned ones) - preserves recency order
                const recencyTags = fetchedTags.filter(tag => !pinnedTagsLower.has(tag.toLowerCase()));

                // 2. Identify used tags (fetchedTags set) to filter unused defaults
                const fetchedTagsLower = new Set(fetchedTags.map(tag => tag.toLowerCase()));

                // 3. Get unused default tags
                const unusedDefaults = otherDefaults.filter(tag => !fetchedTagsLower.has(tag.toLowerCase()));

                // Merge: Pinned -> Recency -> Unused Defaults
                const uniqueTags = [...pinnedTags, ...recencyTags, ...unusedDefaults];
                setTags(uniqueTags);
            }
        } catch (error) {
            console.log("Error fetching tags:", error);
        }
    };

    useEffect(() => {
        fetchTags();

        // Auto-lock when navigating away from private sections
        const isPrivatePage = location.pathname === '/dashboard/private-notes';
        const isNotePage = location.pathname.startsWith('/dashboard/note/');

        if (!isPrivatePage && !isNotePage) {
            setPrivateNotesUnlocked(false);
        }
    }, [location.pathname]);

    // Get current tag from URL
    const searchParams = new URLSearchParams(location.search);
    const currentTag = searchParams.get('tag');

    const onLogout = () => {
        logout();
        navigate("/login");
    };
    const navItems = [
        { icon: LayoutGrid, label: 'All Notes', path: '/dashboard' },
        { icon: Star, label: 'Favorites', path: '/dashboard/favorites' },
        { icon: Lock, label: 'Private Notes', path: '/dashboard/private-notes' },
        { icon: Trash2, label: 'Trash', path: '/dashboard/trash' },
    ];

    return (
        <aside className={cn("flex flex-col h-screen w-64 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl border-r border-white/20 dark:border-slate-800/50 fixed left-0 top-0 z-40 transition-transform duration-300 ease-in-out", className)}>
            {/* Logo Area */}
            <div className="p-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-gradient-to-tr from-primary-600 to-secondary-600 rounded-lg shadow-lg shadow-primary-500/20">
                        <NotebookPen className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600 dark:from-slate-100 dark:to-slate-400">
                        Soch aur Likh
                    </span>
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 ml-1">Bas socho, aur likh do.</p>
            </div>

            {/* Create Button */}
            <div className="px-4 mb-6">
                <Link to="/dashboard/new">
                    <Button className="w-full justify-start shadow-lg shadow-primary-500/20" size="lg">
                        <Plus className="w-5 h-5 mr-2" /> New Note
                    </Button>
                </Link>
            </div>

            {/* Navigation */}
            {/* Navigation - Fixed Menu */}
            <div className="px-4 space-y-1">
                <div className="mb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Menu
                </div>
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => {
                            if (item.label !== 'Private Notes') {
                                setPrivateNotesUnlocked(false);
                            }
                        }}
                        end={item.path === '/dashboard'}
                        className={({ isActive }) => cn(
                            "flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group relative overflow-hidden",
                            isActive && !currentTag // Only active if no tag is selected for 'All Notes' (assuming 'All Notes' is the default view)
                                ? "text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border border-primary-100/50 dark:border-primary-800/30"
                                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm hover:border-slate-100 dark:hover:border-slate-700 border border-transparent"
                        )}
                    >
                        {({ isActive }) => (
                            <>
                                <item.icon className={cn(
                                    "w-5 h-5 transition-colors",
                                    isActive && !currentTag ? "text-primary-600 dark:text-primary-400" : "text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                                )} />
                                {item.label}
                                {isActive && !currentTag && (
                                    <motion.div
                                        layoutId="activeNavIndicator"
                                        className="absolute left-0 top-0 bottom-0 w-1 bg-primary-600 rounded-r-full"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                    />
                                )}
                            </>
                        )}
                    </NavLink>
                ))}
            </div>

            {/* Separator - Fixed */}
            <div className="h-px bg-slate-400 dark:bg-slate-600 mx-6 my-4 flex-shrink-0" />

            {/* Tags - Scrollable Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar px-4">
                <div className="mb-2 px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Tags
                </div>
                {tags.length > 0 ? tags.map((tag, i) => {
                    const isActiveTag = currentTag === tag;
                    // Generate a color based on tag index or name hash for consistency
                    const colors = ["bg-red-400", "bg-blue-400", "bg-amber-400", "bg-emerald-400", "bg-purple-400", "bg-pink-400", "bg-indigo-400", "bg-cyan-400"];
                    const colorClass = colors[i % colors.length];

                    return (
                        <Link key={tag} to={`/dashboard?tag=${tag}`} onClick={() => setPrivateNotesUnlocked(false)}>
                            <button className={cn(
                                "flex items-center gap-3 px-4 py-2 w-full text-left rounded-xl text-sm font-medium transition-all border mb-1",
                                isActiveTag
                                    ? "text-primary-700 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border-primary-100/50 dark:border-primary-800/30 shadow-sm"
                                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 hover:shadow-sm border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                            )}>
                                <span className={cn(
                                    "w-2 h-2 rounded-full",
                                    colorClass
                                )} />
                                <span className="truncate">{tag}</span>
                            </button>
                        </Link>
                    );
                }) : (
                    <div className="px-4 text-sm text-slate-400 dark:text-slate-500 italic">No tags yet</div>
                )}
            </div>

            {/* Theme Toggle & User Profile */}
            {/* Footer / Copyright or spacers could go here if needed, but removing Theme/User section as requested */}

        </aside>
    );
};

export default Sidebar;
