import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ArrowLeft, Save, Tag, Clock, MoreVertical, Plus, Star, Archive, ArchiveRestore, Lock, Unlock, Pin, PinOff, Trash2, RotateCcw, Mic, MicOff, Maximize2, Minimize2, ChevronDown } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../components/Button';
import Modal from '../components/Modal'; // Import Modal
import axiosInstance from '../utils/axiosInstance';
import { useToast } from '../context/ToastContext';
import moment from 'moment';
import { cn } from '../utils/cn';

const NoteEditor = () => {
    const navigate = useNavigate();
    const { noteId } = useParams();
    const { showToast } = useToast();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState([]);

    const [error, setError] = useState(null);
    const [lastEdited, setLastEdited] = useState(null);
    const [isPinned, setIsPinned] = useState(false);
    const [isFavorite, setIsFavorite] = useState(false);
    const [isArchived, setIsArchived] = useState(false);
    const [isPrivate, setIsPrivate] = useState(false);
    const [isTrash, setIsTrash] = useState(false); // Added isTrash state

    const [showTagInput, setShowTagInput] = useState(false);
    const [tagInput, setTagInput] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [allTags, setAllTags] = useState([]);
    const [suggestedTags, setSuggestedTags] = useState([]);

    // Focus Mode State
    const [isFocusMode, setIsFocusMode] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal state
    const [isListening, setIsListening] = useState(false); // Voice to text state
    const [interimResult, setInterimResult] = useState(''); // Interim result
    const [voiceLang, setVoiceLang] = useState('en-IN'); // Default to Indian English
    const recognitionRef = React.useRef(null);

    // Voice to Text Logic
    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = voiceLang; // Use state for language

        recognition.onstart = () => {
            setIsListening(true);
            showToast("Listening... Speak now", "info");
        };

        recognition.onresult = (event) => {
            let interimTranscript = '';
            let finalTranscript = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }

            setInterimResult(interimTranscript); // Update interim state

            if (finalTranscript) {
                setContent(prev => {
                    const newContent = prev + (prev ? ' ' : '') + finalTranscript;
                    return newContent;
                });
                setInterimResult(''); // Clear interim when finalized
            }
        };

        recognition.onerror = (event) => {
            console.error("Speech recognition error", event.error);
            if (event.error === 'not-allowed') {
                setIsListening(false);
                showToast("Microphone access denied. Check browser settings.", "error");
            } else if (event.error === 'no-speech') {
                setIsListening(false);
                showToast("No speech detected. Please try again.", "warning");
            } else if (event.error === 'network') {
                setIsListening(false);
                showToast("Network error. Voice recognition needs internet.", "error");
            } else if (event.error !== 'aborted') {
                setIsListening(false);
                showToast("Voice error: " + event.error, "error");
            }
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, [voiceLang]);

    const toggleListening = () => {
        if (!recognitionRef.current) {
            showToast("Voice recognition not supported", "error");
            return;
        }

        if (isListening) {
            recognitionRef.current.stop();
        } else {
            try {
                recognitionRef.current.start();
            } catch (error) {
                console.error("Error starting speech recognition:", error);
            }
        }
    };

    // Toggle Focus Mode with Fullscreen API
    const toggleFocusMode = () => {
        if (!isFocusMode) {
            setIsFocusMode(true);
            try {
                const elem = document.documentElement;
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                }
            } catch (err) {
                console.error("Error attempting to enable fullscreen:", err);
            }
        } else {
            setIsFocusMode(false);
            try {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
            } catch (err) {
                console.error("Error attempting to exit fullscreen:", err);
            }
        }
    };

    // Handle Esc to exit Focus Mode
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'Escape' && isFocusMode) {
                setIsFocusMode(false);
                if (document.exitFullscreen) {
                    document.exitFullscreen().catch(err => console.log(err));
                }
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isFocusMode]);

    // Force Focus Mode style on body to prevent scrolling
    useEffect(() => {
        if (isFocusMode) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        };
    }, [isFocusMode]);

    // --- RESTORED HANDLERS AND LOGIC ---

    // Fetch Tags and Note
    const fetchAllTags = async () => {
        try {
            const response = await axiosInstance.get("/get-all-notes");
            if (response.data && response.data.notes) {
                const uniqueTags = [...new Set(response.data.notes.flatMap(note => note.tags))];
                setAllTags(uniqueTags);
            }
        } catch (error) {
            console.error("Error fetching tags:", error);
        }
    };

    const fetchNote = async () => {
        try {
            const response = await axiosInstance.get("/get-note/" + noteId);
            if (response.data && response.data.note) {
                const note = response.data.note;
                setTitle(note.title);
                setContent(note.content);
                setTags(note.tags);
                setIsPinned(note.isPinned);
                setIsFavorite(note.isFavorite);
                setIsArchived(note.isArchived);
                setIsPrivate(note.isPrivate || false);
                setIsTrash(note.isTrash || false);
                setLastEdited(note.updatedOn);
            }
        } catch (error) {
            console.error("Fetch error:", error);
            setError("Failed to load note.");
        }
    };

    useEffect(() => {
        if (noteId) fetchNote();
        fetchAllTags();
    }, [noteId]);

    // Save Note
    const saveNote = async (manual = false) => {
        if (!title && !content && tags.length === 0) return;

        try {
            const noteData = { title, content, tags, isPinned, isFavorite, isArchived, isPrivate, isTrash };
            // Assuming we are always editing an existing note here since noteId is in params
            const response = await axiosInstance.put("/edit-note/" + noteId, noteData);

            if (response.data && response.data.note) {
                setLastEdited(new Date());
                if (manual) showToast("Note saved successfully", "success");
            }
        } catch (error) {
            console.error("Save error:", error);
            if (manual) showToast("Error saving note", "error");
        }
    };

    // Autosave
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (noteId && !isTrash) {
                saveNote();
            }
        }, 1500);
        return () => clearTimeout(timeoutId);
    }, [title, content, tags, isPinned, isFavorite, isArchived, isPrivate, isTrash, noteId]);

    // Handlers
    const handleManualSave = () => saveNote(true);

    const handleAddTag = (tagToAdd = null) => {
        const tag = tagToAdd || tagInput.trim();
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
            setTagInput("");
            setShowTagInput(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') handleAddTag();
    };

    // Note Actions
    const handlePinNote = () => setIsPinned(!isPinned);
    const handleFavoriteNote = () => setIsFavorite(!isFavorite);
    const handleLockNote = () => setIsPrivate(!isPrivate);

    // Trash / Delete
    const handleDeleteNote = () => setIsDeleteModalOpen(true);

    const confirmDeleteNote = async () => {
        try {
            await axiosInstance.delete("/delete-note/" + noteId);
            showToast("Note moved to Trash", "success");
            navigate('/dashboard/notes');
        } catch (error) {
            showToast("Error deleting note", "error");
        }
    };

    const handleRestoreNote = () => {
        setIsTrash(false);
        showToast("Note restored", "success");
    };

    // Tag Suggestions
    useEffect(() => {
        if (tagInput.trim()) {
            setSuggestedTags(allTags.filter(t => t.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(t)));
        } else {
            setSuggestedTags([]);
        }
    }, [tagInput, allTags, tags]);


    // Render content
    const editorContent = (
        <div className={cn(
            "h-full flex flex-col transition-all duration-500 ease-in-out font-sans",
            isFocusMode ? "fixed inset-0 z-[9999] bg-slate-50 dark:bg-slate-950 p-4 sm:p-6" : "mx-auto max-w-4xl"
        )}>
            {/* Editor Toolbar / Header */}
            <div className={cn("flex items-center justify-between py-4 mb-6", isFocusMode && "max-w-5xl mx-auto w-full")}>
                {!isFocusMode && (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigate(-1)}
                            className="p-2 -ml-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100/50 dark:hover:bg-slate-800/50 rounded-full transition-colors cursor-pointer"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <span className="text-sm text-slate-400 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {lastEdited ? moment(lastEdited).fromNow() : 'New Note'}
                        </span>
                    </div>
                )}

                {/* Formatting Spacer for Focus Mode - ensures button stays right */}
                {isFocusMode && <div className="flex-1" />}

                <div className="flex items-center gap-2">
                    {/* Action Buttons - Hide most in Focus Mode */}

                    {!isFocusMode && (
                        <>
                            {/* Voice to Text - Only in normal mode as per request "only show exit focus mode button" 
                                WAIT: User said "only show exit focus mode button". 
                                The prompt was strictly "dont show sidebar/navbar , only show exit focus mode button"
                                I will hide everything else. 
                            */}

                            {/* Voice Language Selector with Tooltip */}
                            <div className="relative group flex items-center mr-2">
                                <select
                                    value={voiceLang}
                                    onChange={(e) => setVoiceLang(e.target.value)}
                                    className="bg-transparent text-xs text-slate-400 border-none outline-none cursor-pointer hover:text-primary-500 appearance-none font-medium text-right pr-5"
                                    aria-label="Select Voice Language"
                                >
                                    <option value="en-US">EN (US)</option>
                                    <option value="en-IN">EN (India)</option>
                                    <option value="hi-IN">Hindi</option>
                                </select>
                                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-0 pointer-events-none" />

                                {/* Custom Tooltip */}
                                <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 w-56 p-2 bg-slate-800 dark:bg-slate-700 text-white text-[10px] leading-tight rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50 text-center border border-slate-600">
                                    Select your speaking language for better accuracy. <br />
                                    <span className="text-primary-300">Tip: Use 'EN (India)' for Indian accents.</span>
                                    <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800 dark:border-t-slate-700"></div>
                                </div>
                            </div>

                            {/* Voice to Text Button */}
                            <button
                                onClick={toggleListening}
                                className={cn(
                                    "p-2 rounded-lg transition-colors border",
                                    isListening
                                        ? "text-red-500 bg-red-50 dark:bg-red-500/10 border-red-200 animate-pulse"
                                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent"
                                )}
                                title={isListening ? "Stop Recording" : "Start Voice Typing"}
                            >
                                {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                            </button>
                        </>
                    )}

                    {/* Focus Mode Button - ALWAYS VISIBLE */}
                    <button
                        onClick={toggleFocusMode}
                        className={cn(
                            "p-2 rounded-lg transition-colors border flex items-center gap-2",
                            isFocusMode
                                ? "text-primary-500 bg-primary-50 dark:bg-primary-500/10 border-primary-200 px-4"
                                : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border-transparent sm:block hidden"
                        )}
                        title={isFocusMode ? "Exit Focus Mode" : "Enter Focus Mode"}
                    >
                        {isFocusMode ? (
                            <>
                                <Minimize2 className="w-5 h-5" />
                                <span className="text-sm font-medium">Exit Focus Mode</span>
                            </>
                        ) : (
                            <Maximize2 className="w-5 h-5" />
                        )}
                    </button>

                    {!isFocusMode && (
                        <>
                            <button
                                onClick={handlePinNote}
                                className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    isPinned
                                        ? "text-sky-500 bg-sky-50 dark:bg-sky-500/10 hover:bg-sky-100 dark:hover:bg-sky-500/20"
                                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                                title={isPinned ? "Unpin Note" : "Pin Note"}
                            >
                                {isPinned ? <PinOff className="w-5 h-5" /> : <Pin className="w-5 h-5" />}
                            </button>

                            <button
                                onClick={handleFavoriteNote}
                                className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    isFavorite
                                        ? "text-red-500 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20"
                                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                                title={isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                            >
                                <Star className={cn("w-5 h-5", isFavorite && "fill-current")} />
                            </button>

                            {!isTrash && (
                                <button
                                    onClick={handleDeleteNote}
                                    className="p-2 rounded-lg transition-colors text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                                    title="Delete Note"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            )}

                            <button
                                onClick={handleLockNote}
                                className={cn(
                                    "p-2 rounded-lg transition-colors",
                                    isPrivate
                                        ? "text-amber-500 bg-amber-50 dark:bg-amber-500/10"
                                        : "text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                                )}
                                title={isPrivate ? "Unlock" : "Lock (Private)"}
                            >
                                {isPrivate ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                            </button>

                            <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
                        </>
                    )}

                    {!isFocusMode && (
                        <div className="relative">
                            <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => setShowTagInput(!showTagInput)}>
                                <Tag className="w-4 h-4 mr-2" /> Tags ({tags.length})
                            </Button>
                            {/* ... tag popup content ... */}
                            {showTagInput && (
                                <div className="absolute top-full right-0 mt-2 bg-white dark:bg-slate-800 p-2 shadow-lg rounded-lg border border-slate-200 dark:border-slate-700 z-10 flex flex-col gap-2 min-w-[200px]">
                                    <div className="flex gap-2">
                                        <input
                                            className="flex-1 border dark:border-slate-600 rounded px-2 py-1 text-sm outline-none bg-transparent text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                                            placeholder="Add tag..."
                                            value={tagInput}
                                            onChange={(e) => setTagInput(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            autoFocus
                                        />
                                        <button onClick={() => handleAddTag()} className="text-primary-600 dark:text-primary-400 text-sm font-bold">Add</button>
                                    </div>

                                    {suggestedTags.length > 0 && (
                                        <div className="flex flex-col gap-1 max-h-60 overflow-y-auto custom-scrollbar border-t border-slate-100 dark:border-slate-700 pt-2 mt-1">
                                            {/* Label for the list */}
                                            <div className="text-xs text-slate-400 font-semibold px-2 uppercase tracking-wider mb-1">
                                                Available Tags
                                            </div>
                                            {suggestedTags.map((tag, index) => (
                                                <button
                                                    key={tag}
                                                    onClick={() => handleAddTag(tag)}
                                                    className={cn(
                                                        "text-left text-sm px-2 py-1.5 rounded transition-colors flex items-center justify-between group w-full",
                                                        index === selectedIndex
                                                            ? "bg-slate-200 dark:bg-slate-600 text-slate-900 dark:text-slate-100"
                                                            : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    )}
                                                >
                                                    <span>{tag}</span>
                                                    <span className="opacity-0 group-hover:opacity-100 text-slate-400 text-xs">+</span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}

                    {!isFocusMode && (
                        <>
                            <Button size="sm" className="shadow-lg shadow-primary-500/20" onClick={handleManualSave}>
                                <Save className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Save Note</span>
                            </Button>
                            <button className="p-2 text-slate-400 hover:text-slate-700 rounded-lg lg:hidden">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {isTrash && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 mx-6 mb-4 p-3 rounded-lg flex items-center justify-between">
                    <span className="text-red-700 dark:text-red-400 text-sm font-medium">
                        This note is in Trash. Restore it to make edits.
                    </span>
                    <Button size="sm" onClick={handleRestoreNote} className="bg-red-600 hover:bg-red-700 text-white border-none">
                        <RotateCcw className="w-4 h-4 mr-2" /> Restore
                    </Button>
                </div>
            )}

            {error && <p className="text-red-500 mb-4 px-4">{error}</p>}

            {/* Editor Surface */}
            <div className={cn(
                "bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-300 dark:border-slate-700 flex-1 flex flex-col overflow-hidden relative transition-all duration-500",
                isFocusMode && "max-w-5xl mx-auto w-full shadow-2xl border-slate-200 dark:border-slate-800 h-[calc(100vh-80px)]"
            )}>

                {/* Note Header Section - Sticky */}
                <div className="sticky top-0 z-10 px-6 py-6 border-b border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30 backdrop-blur-md">
                    <div className="flex items-center gap-2 overflow-x-auto mb-4 custom-scrollbar-hide">
                        {tags.map((tag, i) => (
                            <span key={i} className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs px-2 py-1 rounded-full flex items-center border border-slate-200 dark:border-slate-700">
                                #{tag}
                                <button className="ml-1 hover:text-red-500" onClick={() => setTags(tags.filter(t => t !== tag))}>×</button>
                            </span>
                        ))}

                        {/* Inline Tag Input */}
                        {showTagInput ? (
                            <div className="flex items-center gap-1 bg-white dark:bg-slate-800 rounded-full px-3 py-1 border border-primary-500 ring-2 ring-primary-500/20 transition-all shadow-sm">
                                <span className="text-primary-500 font-medium text-xs">#</span>
                                <input
                                    className="bg-transparent border-none outline-none text-xs text-slate-700 dark:text-slate-300 min-w-[60px] p-0 placeholder:text-slate-400"
                                    placeholder="tag name"
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    autoFocus
                                    onBlur={() => {
                                        setTimeout(() => {
                                            if (!tagInput.trim()) setShowTagInput(false);
                                        }, 200);
                                    }}
                                />
                            </div>
                        ) : (
                            <button
                                onClick={() => setShowTagInput(true)}
                                className="flex items-center gap-1.5 px-3 py-1 rounded-full text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20 border border-dashed border-slate-300 dark:border-slate-600 hover:border-primary-200 dark:hover:border-primary-800 transition-all text-xs font-medium group"
                            >
                                <Plus className="w-3.5 h-3.5 transition-transform group-hover:rotate-90" />
                                <span>Add Tag</span>
                            </button>
                        )}
                    </div>

                    <input
                        type="text"
                        placeholder="Note Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full text-4xl font-bold text-slate-800 dark:text-slate-100 placeholder:text-slate-300 dark:placeholder:text-slate-600 border-none focus:ring-0 bg-transparent p-0 disabled:opacity-50"
                        readOnly={isTrash}
                    />
                </div>


                {/* Note Content Section - Scrollable */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar relative">
                    <textarea
                        placeholder="Start writing..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full resize-none text-lg text-slate-600 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 border-none focus:ring-0 bg-transparent p-0 leading-relaxed font-mono disabled:opacity-50"
                        style={{ minHeight: '60vh' }}
                        readOnly={isTrash}
                    />

                    {/* Floating Interim Result Overlay */}
                    {isListening && interimResult && (
                        <div className="absolute bottom-4 left-6 right-6 bg-slate-800/80 text-white px-4 py-2 rounded-lg backdrop-blur-sm text-sm animate-pulse">
                            <span className="opacity-70 mr-2">Listening:</span>
                            {interimResult}
                        </div>
                    )}
                </div>
            </div>
            {/* Delete Confirmation Modal */}
            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Note"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-slate-600 dark:text-slate-300">
                        Are you sure you want to delete this note? It will be moved to the Trash.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                            onClick={confirmDeleteNote}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div >
    );

    if (isFocusMode) {
        return createPortal(editorContent, document.body);
    }

    return editorContent;
};

export default NoteEditor;
