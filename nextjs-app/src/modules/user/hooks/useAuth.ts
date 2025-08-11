import { useState, useEffect } from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';
import supabase from '../../../lib/supabase';
import { getAuthService, getUserService } from '../services';
import { User, CreateUserRequest } from '../types';

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
                    const userService = getUserService();
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
                        const userService = getUserService();
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
            const userService = getUserService();
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
            const authService = getAuthService();
            const result = await authService.signIn({ email, password });
            if (result.error) {
                const errorMessage = typeof result.error === 'string' ? result.error : result.error.message;
                setError(errorMessage);
                return { success: false, error: errorMessage };
            }
            
            // Update user state on successful login
            if (result.user) {
                // Convert AuthUser to our User type
                const userService = getUserService();
                try {
                    const userData = await userService.getUserByEmail(email);
                    if (userData) {
                        setUser(userData);
                    }
                } catch (userError) {
                    console.log('Could not fetch user data after login, but login was successful');
                    // Create a basic user object from auth result
                    const basicUser: User = {
                        id: result.user.id,
                        email: result.user.email,
                        name: result.user.user_metadata?.name || 'User',
                        role: result.user.user_metadata?.role || 'PLAYER',
                        level: 'INTERMEDIATE',
                        isActive: true,
                        createdAt: new Date(result.user.created_at || Date.now()),
                        updatedAt: new Date(result.user.updated_at || Date.now())
                    };
                    setUser(basicUser);
                }
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
            const authService = getAuthService();
            await authService.signOut();
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
            const userService = getUserService();
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
            const userService = getUserService();
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