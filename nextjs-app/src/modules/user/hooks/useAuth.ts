import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthService } from '../services/authService';
import { UserService } from '../services/userService';
import { User, CreateUserRequest } from '../types';

const authService = new AuthService();
const userService = new UserService();

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Get initial session
        const getInitialSession = async () => {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                if (session?.user) {
                    setSupabaseUser(session.user);
                    // Fetch full user data from our database
                    const userData = await userService.getUserById(session.user.id);
                    setUser(userData);
                }
            } catch (err) {
                console.error('Error getting initial session:', err);
                setError('Failed to load user session');
            } finally {
                setLoading(false);
            }
        };

        getInitialSession();

        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                try {
                    if (session?.user) {
                        setSupabaseUser(session.user);
                        const userData = await userService.getUserById(session.user.id);
                        setUser(userData);
                    } else {
                        setSupabaseUser(null);
                        setUser(null);
                    }
                } catch (err) {
                    console.error('Error handling auth state change:', err);
                    setError('Authentication state error');
                } finally {
                    setLoading(false);
                }
            }
        );

        return () => subscription.unsubscribe();
    }, []);

    const register = async (userData: CreateUserRequest) => {
        setLoading(true);
        setError(null);
        try {
            const result = await userService.registerUser(userData);
            if (result.error) {
                setError(result.error);
                return { success: false, error: result.error };
            }
            return { success: true, user: result.user };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Registration failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const result = await authService.login(email, password);
            if (result.error) {
                setError(result.error);
                return { success: false, error: result.error };
            }
            return { success: true };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Login failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const logout = async () => {
        setLoading(true);
        try {
            await authService.logout();
            setUser(null);
            setSupabaseUser(null);
            setError(null);
        } catch (err) {
            console.error('Logout error:', err);
            setError('Logout failed');
        } finally {
            setLoading(false);
        }
    };

    const updateProfile = async (userData: Partial<User>) => {
        if (!user) return { success: false, error: 'No user logged in' };

        setLoading(true);
        setError(null);
        try {
            const updatedUser = await userService.updateUser(user.id, userData);
            setUser(updatedUser);
            return { success: true, user: updatedUser };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Profile update failed';
            setError(message);
            return { success: false, error: message };
        } finally {
            setLoading(false);
        }
    };

    const refreshUser = async () => {
        if (!user?.id) return;

        try {
            const refreshedUser = await userService.getUserById(user.id);
            if (refreshedUser) {
                setUser(refreshedUser);
            }
        } catch (err) {
            console.error('Error refreshing user:', err);
        }
    };

    const clearError = () => {
        setError(null);
    };

    return {
        user,
        supabaseUser,
        loading,
        error,
        isAuthenticated: !!user,
        register,
        login,
        logout,
        updateProfile,
        refreshUser,
        clearError
    };
};