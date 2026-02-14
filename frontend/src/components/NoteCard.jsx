import React from 'react';
import { Pin, Calendar, Tag, Trash2, Star } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { cn } from '../utils/cn';

const NoteCard = ({ title, content, date, tags, isPinned, onPin, isFavorite, onFavorite, onDelete, className, ...props }) => {
    return (
        <div
            className={cn(
                "group relative bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/50 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer overflow-hidden",
                className
            )}
            {...props}
        >
            {/* Hover Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-slate-50 dark:to-slate-900/50 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />

            <div className="relative z-10">
                <div className="flex items-start justify-between mb-3">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 line-clamp-1">{title}</h3>
                    <div className="flex items-center gap-2">
                        {onPin && (
                            <button onClick={(e) => { e.preventDefault(); onPin?.(); }} className="text-slate-400 hover:text-primary-500 transition-colors">
                                <Pin className={cn("w-4 h-4", isPinned && "text-primary-500 fill-primary-500")} />
                            </button>
                        )}
                    </div>
                </div>

                <div className="text-slate-600 dark:text-slate-400 text-sm mb-4 line-clamp-3 leading-relaxed prose dark:prose-invert prose-sm max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {content}
                    </ReactMarkdown>
                </div>

                <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-2">
                        {tags?.map((tag, i) => (
                            <span key={i} className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                                <Tag className="w-3 h-3 mr-1 opacity-50" />
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                    <span className="flex items-center gap-1 group-hover:text-primary-600 transition-colors">
                        <Calendar className="w-3 h-3" />
                        {date}
                    </span>
                    {onDelete && (
                        <button onClick={(e) => { e.preventDefault(); onDelete?.(); }} className="text-slate-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NoteCard;
