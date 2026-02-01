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
            return { success: false, message: error.response?.data?.msg || 'Login failed' };
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
            return { success: false, message: error.response?.data?.msg || 'Signup failed' };
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
