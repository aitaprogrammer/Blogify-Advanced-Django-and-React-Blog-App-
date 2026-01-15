import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../services/api';
import toast from 'react-hot-toast';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Check localStorage for persisted user data on mount
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            const response = await api.post('/api/login/', { username, password });
            const userData = response.data.user || response.data; // Adjust based on actual API response
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
            toast.success('Logged in successfully!');
            return true;
        } catch (error) {
            console.error('Login error:', error);
            toast.error(error.response?.data?.detail || 'Login failed');
            return false;
        }
    };

    const register = async (userData) => {
        try {
            await api.post('/api/register/', userData);
            toast.success('Registration successful! Please login.');
            return true;
        } catch (error) {
            console.error('Registration error:', error);
            console.error('Error response:', error.response?.data);

            // Handle various error formats
            const errorData = error.response?.data;
            if (errorData) {
                // Check for field-specific errors
                if (errorData.username) {
                    toast.error(`Username: ${errorData.username[0]}`);
                } else if (errorData.email) {
                    toast.error(`Email: ${errorData.email[0]}`);
                } else if (errorData.password) {
                    toast.error(`Password: ${errorData.password[0]}`);
                } else if (errorData.password_confirm) {
                    toast.error(`Password confirm: ${errorData.password_confirm[0]}`);
                } else if (errorData.detail) {
                    toast.error(errorData.detail);
                } else {
                    toast.error('Registration failed. Please check your input.');
                }
            } else {
                toast.error('Registration failed. Please try again.');
            }
            return false;
        }
    };

    const logout = async () => {
        try {
            await api.post('/api/logout/');
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            setUser(null);
            localStorage.removeItem('user');
            toast.success('Logged out');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
