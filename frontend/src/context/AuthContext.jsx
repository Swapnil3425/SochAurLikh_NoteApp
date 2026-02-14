import React, { createContext, useState, useContext, useEffect } from 'react';
import axiosInstance from '../utils/axiosInstance';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [privateNotesUnlocked, setPrivateNotesUnlocked] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token');
            if (token) {
                try {
                    const response = await axiosInstance.get('/get-user');
                    if (response.data && response.data.user) {
                        setUser(response.data.user);
                    } else {
                        localStorage.removeItem('token');
                        setUser(null);
                    }
                } catch (error) {
                    console.error("Auth check failed:", error);
                    localStorage.removeItem('token');
                    setUser(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = (userData, token) => {
        localStorage.setItem('token', token);
        setUser(userData);
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        setPrivateNotesUnlocked(false);
    };

    const updateUserProfile = async (data) => {
        try {
            const response = await axiosInstance.put("/update-user", data);
            if (response.data && response.data.user) {
                setUser(response.data.user);
                return { success: true, message: response.data.message };
            }
            return { success: false, message: response.data.message };
        } catch (error) {
            return { success: false, message: error.response?.data?.message || "Something went wrong" };
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, updateUserProfile, loading, privateNotesUnlocked, setPrivateNotesUnlocked }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
