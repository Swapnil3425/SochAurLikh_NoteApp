import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Tag, Clock, MoreVertical, Plus, Star, Archive, ArchiveRestore, Lock, Unlock, Pin, PinOff, Trash2, RotateCcw } from 'lucide-react';
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

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // Modal state

    const fetchAllTags = async () => {
        try {
            const response = await axiosInstance.get("/get-all-tags");
            const pinnedTags = ['Personal', 'Work', 'Study'];
            const otherDefaults = ['Ideas', 'Travel'];
            let fetchedTags = [];

            if (response.data && response.data.tags) {
                fetchedTags = response.data.tags;
            }

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
            setAllTags(uniqueTags);
        } catch (error) {
            console.log("Error fetching tags:", error);
            setAllTags(['Personal', 'Work', 'Study', 'Ideas', 'Travel']);
        }
    };

    useEffect(() => {
        fetchAllTags();
    }, []);

    useEffect(() => {
        // If input is empty, show all available tags that aren't already selected
        if (!tagInput.trim()) {
            setSuggestedTags(allTags.filter(tag => !tags.includes(tag)));
        } else {
            // Filter based on input
            const filtered = allTags.filter(tag =>
                tag.toLowerCase().includes(tagInput.toLowerCase()) &&
                !tags.includes(tag)
            );
            setSuggestedTags(filtered);
        }
        setSelectedIndex(-1);
    }, [tagInput, allTags, tags]);

    useEffect(() => {
        if (noteId) {
            const getNote = async () => {
                try {
                    const response = await axiosInstance.get("/get-note/" + noteId);
                    if (response.data && response.data.note) {
                        const note = response.data.note;
                        setTitle(note.title);
                        setContent(note.content);
                        setTags(note.tags);
                        setTags(note.tags);
                        setIsPinned(note.isPinned || false);
                        setIsFavorite(note.isFavorite || false);
                        setIsArchived(note.isArchived || false);
                        setIsPrivate(note.isPrivate || false);
                        setIsTrash(note.isTrash || false); // Set isTrash
                        setLastEdited(note.createdOn);
                    }
                } catch (error) {
                    console.log(error);
                }
            }
            getNote();
        }
    }, [noteId]);

    // Auto-save logic
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (title && content) {
                saveNote({ manual: false });
            }
        }, 2000);
        return () => clearTimeout(timeoutId);
    }, [title, content, tags, isPinned, isFavorite, isArchived, isPrivate]);

    const saveNote = async ({ manual }) => {
        if (!title || !content) {
            if (manual) setError("Title and Content are required");
            return;
        }

        setError("");

        try {
            let savedNote;
            if (noteId) {
                // Edit
                const response = await axiosInstance.put("/edit-note/" + noteId, {
                    title,
                    content,
                    tags,
                    isPinned,
                    isFavorite, // Added
                    isArchived,
                    isPrivate,
                });
                savedNote = response.data.note;
            } else {
                // Create
                const response = await axiosInstance.post("/add-note", {
                    title,
                    content,
                    tags,
                    isPinned,
                    isFavorite, // Added
                    isArchived,
                    isPrivate,
                });
                savedNote = response.data.note;

                // If created via auto-save, update URL to edit mode so subsequent saves correspond to this note
                if (!manual && savedNote) {
                    navigate(`/dashboard/note/${savedNote._id}`, { replace: true });
                }
            }

            if (savedNote) {
                setLastEdited(savedNote.createdOn);
            }

            if (manual) {
                showToast("Note saved successfully", "success");
                if (isPrivate) {
                    navigate('/dashboard/private-notes');
                } else {
                    navigate('/dashboard');
                }
            }
        } catch (error) {
            console.error("NoteEditor: Error saving note:", error);
            if (manual && error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
            }
        }
    };

    const handleManualSave = () => saveNote({ manual: true });

    const handlePinNote = async () => {
        if (noteId) {
            try {
                const response = await axiosInstance.put("/update-note-pinned/" + noteId, {
                    isPinned: !isPinned
                });
                setIsPinned(!isPinned);
                showToast(isPinned ? "Note unpinned" : "Note pinned", "success");
            } catch (error) {
                console.log(error);
            }
        } else {
            setIsPinned(!isPinned);
        }
    };

    const handleFavoriteNote = async () => {
        if (noteId) {
            try {
                const response = await axiosInstance.put("/update-note-favorite/" + noteId, {
                    isFavorite: !isFavorite
                });
                setIsFavorite(!isFavorite);
                showToast(isFavorite ? "Removed from Favorites" : "Added to Favorites", "success");
            } catch (error) {
                console.log(error);
            }
        } else {
            setIsFavorite(!isFavorite);
        }
    };

    const handleDeleteNote = () => {
        if (noteId) {
            setIsDeleteModalOpen(true);
        }
    };

    const confirmDeleteNote = async () => {
        if (noteId) {
            try {
                await axiosInstance.delete("/delete-note/" + noteId);
                showToast("Note moved to trash", "delete");
                navigate('/dashboard');
            } catch (error) {
                console.log(error);
                showToast("Failed to delete note", "error");
            } finally {
                setIsDeleteModalOpen(false);
            }
        }
    };

    const handleRestoreNote = async () => {
        if (noteId) {
            try {
                await axiosInstance.put("/restore-note/" + noteId);
                setIsTrash(false);
                showToast("Note restored", "success");
            } catch (error) {
                console.log(error);
            }
        }
    };

    const handleLockNote = async () => {
        if (noteId) {
            try {
                const response = await axiosInstance.put("/update-note-private/" + noteId, {
                    isPrivate: !isPrivate
                });
                setIsPrivate(!isPrivate); // Toggle local state
                // If locking (making private), unpin and unarchive locally to match backend logic
                if (!isPrivate) {
                    setIsPinned(false);
                    setIsArchived(false);
                }
                showToast(isPrivate ? "Note unlocked" : "Note locked (Private)", "success");
                if (!isPrivate) {
                    // If locking, move to private dashboard (or just dashboard for now)
                    navigate('/dashboard');
                }
            } catch (error) {
                console.log(error);
            }
        } else {
            setIsPrivate(!isPrivate);
            if (!isPrivate) {
                setIsPinned(false);
                setIsArchived(false);
            }
        }
    };

    const handleAddTag = (tagToAdd = null) => {
        const tag = tagToAdd || tagInput.trim();
        if (tag) {
            if (!tags.includes(tag)) {
                setTags([...tags, tag]);
            }
            setTagInput("");
            setShowTagInput(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => prev < suggestedTags.length - 1 ? prev + 1 : prev);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (selectedIndex >= 0 && suggestedTags[selectedIndex]) {
                handleAddTag(suggestedTags[selectedIndex]);
            } else {
                handleAddTag();
            }
        } else if (e.key === 'Escape') {
            setShowTagInput(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto h-full flex flex-col">
            {/* Editor Toolbar / Header */}
            <div className="flex items-center justify-between py-4 mb-6">
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
                <div className="flex items-center gap-2">
                    {/* Action Buttons */}
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

                    <div className="relative">
                        <Button variant="ghost" size="sm" className="hidden sm:flex" onClick={() => setShowTagInput(!showTagInput)}>
                            <Tag className="w-4 h-4 mr-2" /> Tags ({tags.length})
                        </Button>
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

                    <Button size="sm" className="shadow-lg shadow-primary-500/20" onClick={handleManualSave}>
                        <Save className="w-4 h-4 sm:mr-2" /> <span className="hidden sm:inline">Save Note</span>
                    </Button>
                    <button className="p-2 text-slate-400 hover:text-slate-700 rounded-lg lg:hidden">
                        <MoreVertical className="w-5 h-5" />
                    </button>
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
            <div className="bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm rounded-3xl shadow-sm border border-slate-300 dark:border-slate-700 flex-1 flex flex-col overflow-hidden relative">

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
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 custom-scrollbar">
                    <textarea
                        placeholder="Start writing..."
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        className="w-full h-full resize-none text-lg text-slate-600 dark:text-slate-300 placeholder:text-slate-300 dark:placeholder:text-slate-600 border-none focus:ring-0 bg-transparent p-0 leading-relaxed font-mono disabled:opacity-50"
                        style={{ minHeight: '60vh' }}
                        readOnly={isTrash}
                    />
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
        </div>
    );
};

export default NoteEditor;
