import React, { useState, useEffect } from 'react';
import { Lock, Unlock, ArrowLeft, Eye, EyeOff } from 'lucide-react';
import axiosInstance from '../utils/axiosInstance';
import NoteCard from '../components/NoteCard';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import moment from 'moment';

const PrivateNotes = () => {
    const [isPasswordSet, setIsPasswordSet] = useState(false);
    const { privateNotesUnlocked: isUnlocked, setPrivateNotesUnlocked: setIsUnlocked } = useAuth();
    const [passwordInput, setPasswordInput] = useState("");
    const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [showResetUI, setShowResetUI] = useState(false);
    const [showChangePasswordUI, setShowChangePasswordUI] = useState(false);
    const [notes, setNotes] = useState([]);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const navigate = useNavigate();
    const { showToast } = useToast();

    // Check if password is set on mount
    useEffect(() => {
        const checkPasswordStatus = async () => {
            try {
                const response = await axiosInstance.get("/check-private-password-set");
                if (response.data && !response.data.error) {
                    setIsPasswordSet(response.data.isPasswordSet);
                }
            } catch (error) {
                console.error("Error checking password status:", error);
            } finally {
                setIsLoading(false);
            }
        };
        checkPasswordStatus();
    }, []);

    // Fetch private notes when unlocked
    useEffect(() => {
        if (isUnlocked) {
            getPrivateNotes();
        }
    }, [isUnlocked]);

    const getPrivateNotes = async () => {
        try {
            const response = await axiosInstance.get("/get-private-notes");
            if (response.data && response.data.notes) {
                setNotes(response.data.notes);
            }
        } catch (error) {
            console.log("Error fetching private notes:", error);
        }
    };

    const handleSetPassword = async (e) => {
        e.preventDefault();
        setError("");

        if (!passwordInput || !confirmPasswordInput) {
            setError("Please fill in all fields");
            return;
        }

        if (passwordInput !== confirmPasswordInput) {
            setError("Passwords do not match");
            return;
        }

        if (passwordInput.length < 6) {
            setError("Password must be at least 6 characters long");
            return;
        }

        try {
            const response = await axiosInstance.post("/set-private-password", {
                password: passwordInput,
            });

            if (response.data && !response.data.error) {
                setIsPasswordSet(true);
                setIsUnlocked(true); // Auto unlock after setting
                showToast("Private password set successfully", "success");
                setPasswordInput("");
                setConfirmPasswordInput("");
            }
        } catch (error) {
            setError(error.response?.data?.message || "An error occurred");
        }
    };

    const handleUnlock = async (e) => {
        e.preventDefault();
        setError("");

        if (!passwordInput) {
            setError("Please enter your password");
            return;
        }

        try {
            const response = await axiosInstance.post("/verify-private-password", {
                password: passwordInput,
            });

            if (response.data && !response.data.error) {
                setIsUnlocked(true);
                setPasswordInput("");
            } else {
                setError("Incorrect password");
            }
        } catch (error) {
            setError(error.response?.data?.message || "An error occurred");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");

        if (!passwordInput) {
            setError("Please enter your account password");
            return;
        }

        try {
            const response = await axiosInstance.post("/reset-private-password", {
                password: passwordInput,
            });

            if (response.data && !response.data.error) {
                setIsPasswordSet(false);
                setIsUnlocked(false);
                setShowResetUI(false);
                setPasswordInput("");
                // showToast("Private notes password reset successfully. You can now set a new one.", "success");
            }
        } catch (error) {
            setError(error.response?.data?.message || "An error occurred");
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setError("");

        if (!passwordInput || !confirmPasswordInput) {
            setError("Please fill in all fields");
            return;
        }

        try {
            const response = await axiosInstance.post("/change-private-password", {
                currentPassword: passwordInput,
                newPassword: confirmPasswordInput,
            });

            if (response.data && !response.data.error) {
                setShowChangePasswordUI(false);
                setPasswordInput("");
                setConfirmPasswordInput("");
                showToast("Private password changed successfully", "success");
            }
        } catch (error) {
            setError(error.response?.data?.message || "An error occurred");
        }
    };

    // Note actions (simplified versions for now)
    const onPinNote = async (note) => {
        try {
            const response = await axiosInstance.put("/update-note-pinned/" + note._id, {
                isPinned: !note.isPinned,
            });
            if (response.data && !response.data.error) {
                showToast(note.isPinned ? "Note unpinned" : "Note pinned", "success");
                getPrivateNotes(); // Refresh
            }
        } catch (error) {
            console.log(error);
        }
    };

    const onEdit = (note) => {
        navigate(`/dashboard/note/${note._id}`);
    };

    return (
        <div className="flex bg-slate-50 dark:bg-slate-900 min-h-screen">
            <Sidebar />

            <div className="flex-1 p-8 h-screen flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-2 flex-shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-2xl">
                            {isUnlocked ? <Unlock className="w-6 h-6 text-primary-500" /> : <Lock className="w-6 h-6 text-slate-400" />}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Private Notes</h1>
                            <p className="text-slate-500 dark:text-slate-400 mt-1">Secure, password-protected notes</p>
                        </div>
                    </div>

                    {isUnlocked && (
                        <button
                            onClick={() => {
                                setIsUnlocked(false);
                                setNotes([]);
                                showToast("Private notes locked", "success");
                            }}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-colors font-medium border border-transparent hover:border-slate-300 dark:hover:border-slate-600"
                        >
                            <Lock className="w-4 h-4" />
                            Lock
                        </button>
                    )}
                </div>

                {/* Content Container */}
                <div className={`flex-1 ${!isUnlocked || !isPasswordSet ? "flex justify-center pt-4" : "overflow-y-auto custom-scrollbar"}`}>

                    <div className={`${!isUnlocked || !isPasswordSet ? "w-full max-w-md" : "w-full"}`}>
                        {isLoading ? (
                            <div className="text-center text-slate-400">Loading...</div>
                        ) : !isPasswordSet ? (

                            // Setup Password UI
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 w-full">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-primary-50 dark:bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Lock className="w-8 h-8 text-primary-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Set Private Password</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Create a password to secure your private notes. This is separate from your account password.</p>
                                </div>

                                <form onSubmit={handleSetPassword} className="space-y-4 max-w-md mx-auto">
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Create Password"
                                            className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-800 dark:text-slate-100"
                                            value={passwordInput}
                                            onChange={(e) => setPasswordInput(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Confirm Password"
                                            className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-800 dark:text-slate-100"
                                            value={confirmPasswordInput}
                                            onChange={(e) => setConfirmPasswordInput(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-900/10 p-2 rounded-lg">{error}</p>}

                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5"
                                    >
                                        Set Password
                                    </button>
                                </form>
                            </div>
                        ) : showResetUI ? (
                            // Reset Password UI
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 w-full">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-red-50 dark:bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Lock className="w-8 h-8 text-red-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Reset Private Password</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Enter your <strong>Account Password</strong> to verify your identity and reset your private notes password.</p>
                                </div>

                                <form onSubmit={handleResetPassword} className="space-y-4 max-w-md mx-auto">
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter Account Password"
                                            className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-800 dark:text-slate-100"
                                            value={passwordInput}
                                            onChange={(e) => setPasswordInput(e.target.value)}
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-900/10 p-2 rounded-lg">{error}</p>}

                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-red-500/30 hover:shadow-red-500/50 hover:-translate-y-0.5"
                                    >
                                        Reset Password
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowResetUI(false);
                                            setPasswordInput("");
                                            setError("");
                                        }}
                                        className="w-full py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </form>
                            </div>

                        ) : showChangePasswordUI ? (
                            // Change Password UI
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 w-full">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-blue-50 dark:bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Lock className="w-8 h-8 text-blue-500" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Change Private Password</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Enter your current private password and a new one.</p>
                                </div>

                                <form onSubmit={handleChangePassword} className="space-y-4 max-w-md mx-auto">
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Current Private Password"
                                            className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-800 dark:text-slate-100"
                                            value={passwordInput}
                                            onChange={(e) => setPasswordInput(e.target.value)}
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="New Private Password"
                                            className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-800 dark:text-slate-100"
                                            value={confirmPasswordInput}
                                            onChange={(e) => setConfirmPasswordInput(e.target.value)}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-900/10 p-2 rounded-lg">{error}</p>}

                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:-translate-y-0.5"
                                    >
                                        Change Password
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowChangePasswordUI(false);
                                            setPasswordInput("");
                                            setConfirmPasswordInput("");
                                            setError("");
                                        }}
                                        className="w-full py-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 text-sm font-medium transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </form>
                            </div>
                        ) : !isUnlocked ? (
                            // Unlock UI
                            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 w-full">
                                <div className="text-center mb-6">
                                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Lock className="w-8 h-8 text-slate-500 dark:text-slate-400" />
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Locked Notes</h2>
                                    <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Enter your private password to access.</p>
                                </div>

                                <form onSubmit={handleUnlock} className="space-y-4 max-w-md mx-auto">
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Enter Password"
                                            className="w-full px-4 py-3 pr-10 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all text-slate-800 dark:text-slate-100"
                                            value={passwordInput}
                                            onChange={(e) => setPasswordInput(e.target.value)}
                                            autoFocus
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary-500 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>

                                    {error && <p className="text-red-500 text-sm text-center font-medium bg-red-50 dark:bg-red-900/10 p-2 rounded-lg">{error}</p>}

                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-primary-500/30 hover:shadow-primary-500/50 hover:-translate-y-0.5"
                                    >
                                        Unlock Notes
                                    </button>

                                    <div className="flex items-center justify-between mt-4">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowResetUI(true);
                                                setPasswordInput("");
                                                setError("");
                                            }}
                                            className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium hover:underline"
                                        >
                                            Forgot Password?
                                        </button>

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowChangePasswordUI(true);
                                                setPasswordInput("");
                                                setConfirmPasswordInput("");
                                                setError("");
                                            }}
                                            className="text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 text-sm font-medium hover:underline"
                                        >
                                            Change Password
                                        </button>
                                    </div>
                                </form>
                            </div>
                        ) : (
                            // Notes Grid
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {notes.length > 0 ? (
                                    notes.map((note) => (
                                        <NoteCard
                                            key={note._id}
                                            title={note.title}
                                            content={note.content}
                                            date={moment(note.createdOn).format('Do MMM YYYY')}
                                            tags={note.tags}
                                            isPinned={note.isPinned}
                                            onClick={() => onEdit(note)}
                                            onPin={() => onPinNote(note)}
                                        // onDelete={() => onDelete(note)} 
                                        />
                                    ))
                                ) : (
                                    <div className="col-span-full flex flex-col items-center justify-center text-center py-20 text-slate-400">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                                            <Lock className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                        </div>
                                        <p className="text-lg font-medium">No private notes yet</p>
                                        <p className="text-sm">Lock a note from the editor to see it here.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

            </div >
        </div >
    );
};

export default PrivateNotes;
