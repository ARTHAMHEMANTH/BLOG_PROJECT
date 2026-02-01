import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check local storage for user on load
        try {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                const parsedUser = JSON.parse(storedUser);
                const normalized = {
                    ...parsedUser,
                    userId: parsedUser.userId || parsedUser._id,
                    _id: parsedUser._id || parsedUser.userId,
                    following: parsedUser.following || [],
                    followers: parsedUser.followers || []
                };
                setUser(normalized);
            }
        } catch (error) {
            console.error("Failed to parse user from local storage", error);
            localStorage.removeItem('user');
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const res = await api.post('/auth/login', { email, password });
            const userData = {
                ...res.data,
                userId: res.data.userId || res.data._id,
                _id: res.data._id || res.data.userId
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true };
        } catch (error) {
            console.error("Login component error details:", error);
            const serverMsg = error.response?.data?.msg;
            const detail = error.response?.data?.error;
            const status = error.response?.status;

            let finalMessage = 'Login failed';
            if (detail) finalMessage = `${serverMsg}: ${detail}`;
            else if (serverMsg) finalMessage = serverMsg;
            else if (status) finalMessage = `Error ${status}: ${error.response?.statusText || 'Server Error'}`;
            else if (error.message) finalMessage = `Network Error: ${error.message}`;

            return { success: false, message: finalMessage };
        }
    };

    const signup = async (username, email, password) => {
        try {
            const res = await api.post('/auth/signup', { username, email, password });
            const userData = {
                ...res.data,
                userId: res.data.userId || res.data._id,
                _id: res.data._id || res.data.userId
            };
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            return { success: true };
        } catch (error) {
            console.error("Signup component error details:", error);
            const serverMsg = error.response?.data?.msg;
            const detail = error.response?.data?.error;
            const status = error.response?.status;

            let finalMessage = 'Signup failed';
            if (detail) finalMessage = `${serverMsg}: ${detail}`;
            else if (serverMsg) finalMessage = serverMsg;
            else if (status) finalMessage = `Error ${status}: ${error.response?.statusText || 'Server Error'}`;
            else if (error.message) finalMessage = `Network Error: ${error.message}`;

            return { success: false, message: finalMessage };
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem('user');
    };

    const updateUser = (newData) => {
        setUser(prev => {
            const updated = { ...(prev || {}), ...newData };
            localStorage.setItem('user', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <AuthContext.Provider value={{ user, login, signup, logout, updateUser, loading }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
