import React, { useEffect } from "react";
import { Check, X, AlertCircle, Info, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion"; // Ensure framer-motion is installed

const Toast = ({ message, type, onClose }) => {
    useEffect(() => {
        const timer = setTimeout(() => {
            onClose();
        }, 3000);

        return () => {
            clearTimeout(timer);
        };
    }, [onClose]);

    const icons = {
        success: <Check className="w-5 h-5 text-green-500" />,
        error: <AlertCircle className="w-5 h-5 text-red-500" />,
        info: <Info className="w-5 h-5 text-blue-500" />,
        delete: <Trash2 className="w-5 h-5 text-red-500" />,
    };

    const bgColors = {
        success: "bg-green-50",
        error: "bg-red-50",
        info: "bg-blue-50",
        delete: "bg-red-50",
    };

    const borderColors = {
        success: "border-green-200",
        error: "border-red-200",
        info: "border-blue-200",
        delete: "border-red-200",
    };


    return (
        <div className="fixed top-4 right-4 z-50">
            <div
                className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg ${bgColors[type]} ${borderColors[type]} min-w-[300px]`}
            >
                <div className="flex-shrink-0 bg-white rounded-full p-1">
                    {icons[type]}
                </div>
                <p className="text-slate-800 text-sm font-medium flex-1">
                    {message}
                </p>
                <button
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};

export default Toast;
