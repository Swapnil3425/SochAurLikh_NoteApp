import { useNavigate, useSearchParams, Link } from 'react-router-dom'; // Added useNavigate, Link
import { Search, Bell, Menu, Sun, Moon, LogOut, Check, X, Edit2 } from 'lucide-react'; // Added icons
import { useState, useRef, useEffect } from 'react'; // Added useState, useRef, useEffect
import { useAuth } from '../context/AuthContext'; // Added AuthContext
import { useTheme } from '../context/ThemeContext'; // Added ThemeContext
import { cn } from '../utils/cn';

const Topbar = ({ onMenuClick, className }) => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user, logout, updateUserProfile } = useAuth(); // Auth hook
    const { theme, toggleTheme } = useTheme(); // Theme hook
    const navigate = useNavigate();

    // Refs
    const searchInputRef = useRef(null);
    const editInputRef = useRef(null);

    // Profile Editing State
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState("");

    // Handle Ctrl+K to focus search
    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                searchInputRef.current?.focus();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isEditing && editInputRef.current) {
            editInputRef.current.focus();
        }
    }, [isEditing]);

    const handleStartEdit = () => {
        setEditName(user?.fullName || "");
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
        setEditName("");
    };

    const handleSaveEdit = async () => {
        if (!editName.trim()) return;

        const result = await updateUserProfile({ fullName: editName });
        if (result && result.success) {
            setIsEditing(false);
        } else {
            // Handle error (optional: show toast)
            console.error(result?.message || "Failed to update profile");
            setIsEditing(false);
        }
    };

    const handleEditKeyDown = (e) => {
        if (e.key === 'Enter') handleSaveEdit();
        if (e.key === 'Escape') handleCancelEdit();
    };

    const handleSearch = (e) => {
        const query = e.target.value;
        if (query) {
            setSearchParams({ query });
        } else {
            setSearchParams({});
        }
    };

    const onLogout = () => {
        logout();
        navigate("/login");
    };

    const today = new Date().toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <header className={cn("flex items-center justify-between px-6 py-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-xl sticky top-0 z-30 border-b border-white/20 dark:border-slate-800/50", className)}>
            <div className="flex items-center gap-4">
                <button
                    onClick={onMenuClick}
                    className="p-2 -ml-2 text-slate-500 hover:text-slate-700 hover:bg-slate-200/50 rounded-lg lg:hidden transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
                <div className="hidden sm:block">
                    <h1 className="text-xl font-bold text-slate-800 dark:text-white">Dashboard</h1>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium tracking-wide">{today}</p>
                </div>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-end max-w-2xl">
                {/* Search Bar */}
                <div className="relative w-full max-w-md hidden md:block group">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors">
                        <Search className="w-4 h-4" />
                    </div>
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder="Search notes, tags..."
                        value={searchParams.get("query") || ""}
                        onChange={handleSearch}
                        className="w-full bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm rounded-xl focus:ring-2 focus:ring-primary-100 dark:focus:ring-primary-900/30 focus:border-primary-500 block pl-10 p-2.5 transition-all shadow-sm group-focus-within:shadow-md"
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1 group/kbd cursor-default">
                        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-white/50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded transition-colors group-hover/kbd:border-primary-300 dark:group-hover/kbd:border-primary-700 group-hover/kbd:text-primary-500">
                            <span className="text-xs">⌘</span>K
                        </kbd>
                        <div className="absolute top-full right-0 mt-1.5 px-2 py-1 bg-slate-800 text-slate-100 text-[10px] font-medium rounded shadow-lg opacity-0 translate-y-1 group-hover/kbd:opacity-100 group-hover/kbd:translate-y-0 transition-all pointer-events-none whitespace-nowrap z-50">
                            Press Ctrl+K to search
                        </div>
                    </div>
                </div>

                {/* Theme Toggle */}
                <button
                    type="button"
                    onClick={toggleTheme}
                    className="p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
                    title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                >
                    {theme === 'dark' ? (
                        <Sun className="w-5 h-5 text-amber-400" />
                    ) : (
                        <Moon className="w-5 h-5" />
                    )}
                </button>

                {/* User Profile & Logout */}
                <div className="flex items-center gap-3 pl-3 border-l border-slate-200 dark:border-slate-700">
                    <div className="hidden md:block text-right group relative">
                        {isEditing ? (
                            <div className="flex items-center gap-1">
                                <input
                                    ref={editInputRef}
                                    type="text"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    onKeyDown={handleEditKeyDown}
                                    onBlur={handleCancelEdit} // Optional: save or cancel on blur
                                    className="w-32 px-1 py-0.5 text-xs font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-primary-500"
                                />
                                <button onMouseDown={(e) => { e.preventDefault(); handleSaveEdit(); }} className="p-0.5 text-green-500 hover:text-green-600"><Check className="w-3 h-3" /></button>
                                <button onMouseDown={(e) => { e.preventDefault(); handleCancelEdit(); }} className="p-0.5 text-red-500 hover:text-red-600"><X className="w-3 h-3" /></button>
                            </div>
                        ) : (
                            <div className="flex items-center justify-end gap-2 cursor-pointer group hover:bg-slate-100 dark:hover:bg-slate-800 px-2 py-1 rounded-lg transition-colors" onClick={handleStartEdit}>
                                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[100px]">{user?.fullName || "Guest"}</p>
                                <Edit2 className="w-3 h-3 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )}
                    </div>
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900 dark:to-primary-800 border border-primary-200 dark:border-primary-700 flex items-center justify-center text-primary-700 dark:text-primary-300 font-medium text-xs">
                        {user?.fullName ? user.fullName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2) : "AS"}
                    </div>
                    <button
                        onClick={onLogout}
                        className="p-2 text-slate-400 hover:text-red-500 dark:hover:text-red-400 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 ml-1"
                        title="Sign Out"
                    >
                        <LogOut className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Topbar;
