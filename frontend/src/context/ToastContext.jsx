import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/Toast";

const ToastContext = createContext();

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error("useToast must be used within a ToastProvider");
    }
    return context;
};

export const ToastProvider = ({ children }) => {
    const [toast, setToast] = useState(null);
    const [timeoutId, setTimeoutId] = useState(null);

    const showToast = useCallback((message, type = "info") => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }

        setToast({ message, type });

        const id = setTimeout(() => {
            setToast(null);
        }, 3000); // Auto close after 3 seconds

        setTimeoutId(id);
    }, [timeoutId]);

    const hideToast = useCallback(() => {
        if (timeoutId) {
            clearTimeout(timeoutId);
        }
        setToast(null);
    }, [timeoutId]);

    return (
        <ToastContext.Provider value={{ showToast, hideToast }}>
            {children}
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={hideToast}
                />
            )}
        </ToastContext.Provider>
    );
};
