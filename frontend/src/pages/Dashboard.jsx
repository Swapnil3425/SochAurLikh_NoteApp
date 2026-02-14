import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import NoteCard from '../components/NoteCard';
import Button from '../components/Button';
import Modal from '../components/Modal';
import axiosInstance from '../utils/axiosInstance';
import { useToast } from '../context/ToastContext';
import moment from 'moment';

import { useLocation } from 'react-router-dom';

const Dashboard = ({ type }) => {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const query = searchParams.get("query");
    const { showToast } = useToast();

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [noteToDelete, setNoteToDelete] = useState(null);

    const location = useLocation();

    // Reset notes when type changes
    useEffect(() => {
        setNotes([]);
        getAllNotes();
    }, [type, location.search]);

    const getAllNotes = async () => {
        try {
            setLoading(true);
            const params = { type };
            if (query) params.query = query;

            // Check for tag in URL
            const tag = searchParams.get("tag");
            if (tag) params.tag = tag;

            let endpoint = "/get-all-notes";
            if (query) {
                endpoint = "/search-notes";
            }

            const response = await axiosInstance.get(endpoint, { params });

            if (response.data && response.data.notes) {
                setNotes(response.data.notes);
            }
        } catch (error) {
            console.log("An error occurred while fetching notes:", error);
            setError("Failed to fetch notes. Please check your backend connection.");
        } finally {
            setLoading(false);
        }
    };


    const searchNotes = async (q) => {
        try {
            setLoading(true);
            const response = await axiosInstance.get("/search-notes", {
                params: { query: q }
            });
            if (response.data && response.data.notes) {
                setNotes(response.data.notes);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }

    const handleDelete = (note) => {
        setNoteToDelete(note);
        setIsDeleteModalOpen(true);
    }

    const handleRestore = async (note) => {
        try {
            await axiosInstance.put("/restore-note/" + note._id);
            showToast("Note restored successfully", "success");
            setNotes(notes.filter(n => n._id !== note._id));
        } catch (error) {
            console.log("An error occurred while restoring note:", error);
            showToast("Failed to restore note", "error");
        }
    }

    const handleArchive = async (note) => {
        try {
            await axiosInstance.put("/update-note-archive/" + note._id, {
                isArchived: !note.isArchived
            });
            showToast(note.isArchived ? "Note unarchived" : "Note archived", "success");
            getAllNotes(); // Refresh to remove from current view if needed
        } catch (error) {
            console.log("An error occurred while archiving note:", error);
        }
    }

    const confirmDelete = async () => {
        if (!noteToDelete) return;

        try {
            if (type === 'trash') {
                // Permanent Delete
                await axiosInstance.delete("/delete-note-permanent/" + noteToDelete._id);
                showToast("Note deleted permanently", "delete");
            } else {
                // Soft Delete (Move to Trash)
                await axiosInstance.delete("/delete-note/" + noteToDelete._id);
                showToast("Note moved to trash", "delete");
            }

            setNotes(notes.filter(note => note._id !== noteToDelete._id));
            setIsDeleteModalOpen(false);
            setNoteToDelete(null);
        } catch (error) {
            console.log("An error occurred while deleting note:", error);
            showToast("Failed to delete note", "error");
        }
    }

    const handlePin = async (note) => {
        try {
            const response = await axiosInstance.put("/update-note-pinned/" + note._id, {
                isPinned: !note.isPinned
            });
            if (response.data && response.data.note) {
                if (query) {
                    searchNotes(query);
                } else {
                    getAllNotes();
                }
            }
        } catch (error) {
            console.log("An error occurred while pinning note:", error);
        }
    }

    useEffect(() => {
        if (query) {
            searchNotes(query);
        } else {
            getAllNotes();
        }
    }, [query, type, searchParams]);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4 }
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[50vh]">
                <div className="text-slate-400 animate-pulse">Loading notes...</div>
            </div>
        );
    }

    return (
        <div className="space-y-8 pb-10">
            {/* Header / Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white">
                        {type === 'trash' ? 'Trash' : type === 'archive' ? 'Archive' : type === 'favorites' ? 'Favorites' : searchParams.get('tag') ? `Tag: #${searchParams.get('tag')}` : 'All Notes'}
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        {type === 'trash' ? 'Notes in trash will be deleted permanently.' : 'Here\'s what you wrote down recently.'}
                    </p>
                </div>
                <Link to="/dashboard/new">
                    <Button size="lg" className="shadow-xl shadow-primary-500/20">
                        <Plus className="w-5 h-5 mr-2" />
                        Create New Note
                    </Button>
                </Link>
            </div>

            {type === 'trash' && (
                <div className="mb-6 -mt-2">
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                        Notes in trash will be deleted permanently after 30 days.
                    </p>
                </div>
            )}

            {error && (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-medium">
                    {error}
                </div>
            )}

            {/* Notes Grid */}
            <div
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
                {/* Create New Note Card Placeholder - Hide in Trash/Archive */}
                {type !== 'trash' && type !== 'archive' && (
                    <Link to="/dashboard/new">
                        <div
                            className="group flex flex-col items-center justify-center min-h-[200px] border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-primary-50/50 dark:hover:bg-primary-900/20 transition-all cursor-pointer h-full"
                        >
                            <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:scale-110 transition-all shadow-sm">
                                <Plus className="w-6 h-6 text-slate-400 dark:text-slate-500 group-hover:text-primary-500" />
                            </div>
                            <span className="mt-4 font-semibold text-slate-500 dark:text-slate-400 group-hover:text-primary-600 dark:group-hover:text-primary-400">Create new note</span>
                        </div>
                    </Link>
                )}

                {notes.map((note) => (
                    <div key={note._id} className="h-full">
                        {/* If trash, disable link or show differently? For now keep link but maybe add restore button in card */}
                        {/* Actually, NoteCard usually has actions. Let's pass handlers. */}
                        {/* If trash, onclick should probably not open editor or editor should be read only? */}
                        {/* Check type. If 'trash', maybe don't wrap in Link or Link to a 'view only' mode? */}
                        {/* For simplicity, allow opening. Editor can check isTrash. */}
                        <div className="relative h-full group">
                            <Link to={`/dashboard/note/${note._id}`} className={type === 'trash' ? 'pointer-events-none' : ''}>
                                <NoteCard
                                    title={note.title}
                                    content={note.content}
                                    date={moment(note.createdOn).format('Do MMM YYYY')}
                                    tags={note.tags}
                                    isPinned={note.isPinned}
                                    isFavorite={note.isFavorite} // Added
                                    onPin={type !== 'trash' && type !== 'archive' ? () => handlePin(note) : null}
                                    onFavorite={type !== 'trash' && type !== 'archive' ? () => handleFavorite(note) : null} // Added
                                    onDelete={type !== 'trash' ? () => handleDelete(note) : null}
                                    // Add custom actions if possible, or modify NoteCard to accept 'type'
                                    // For now, let's assume NoteCard has basic actions. 
                                    // We'll adding Restore button overlay if in trash.
                                    className="h-full"
                                />
                            </Link>
                            {type === 'trash' && (
                                <div className="absolute top-2 right-2 flex gap-2 z-10">
                                    <Button size="sm" variant="outline" onClick={(e) => { e.preventDefault(); handleRestore(note); }}>
                                        Restore
                                    </Button>
                                    <Button size="sm" className="bg-red-500 text-white" onClick={(e) => { e.preventDefault(); handleDelete(note); }}>
                                        Delete
                                    </Button>
                                </div>
                            )}
                            {type === 'archive' && (
                                <div className="absolute top-2 right-12 z-10 group-hover:opacity-100 opacity-0 transition-opacity">
                                    <Button size="sm" variant="ghost" onClick={(e) => { e.preventDefault(); handleArchive(note); }} title="Unarchive">
                                        Unarchive
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <Modal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                title="Delete Note"
            >
                <div className="flex flex-col gap-4">
                    <p className="text-slate-600 dark:text-slate-300">
                        Are you sure you want to delete this note? This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-500 hover:bg-red-600 text-white shadow-red-500/20"
                            onClick={confirmDelete}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;
