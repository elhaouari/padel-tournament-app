import { useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { UserService } from '../services/userService';

const userService = new UserService();

export const useUser = (userId: string | null) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchUser = useCallback(async (id: string) => {
        setLoading(true);
        setError(null);
        try {
            const userData = await userService.getUserById(id);
            setUser(userData);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch user';
            setError(errorMessage);
            console.error('Error fetching user:', err);
        } finally {
            setLoading(false);
        }
    }, []);

    const refresh = useCallback(() => {
        if (userId) {
            fetchUser(userId);
        }
    }, [userId, fetchUser]);

    const clearError = () => {
        setError(null);
    };

    useEffect(() => {
        if (userId) {
            fetchUser(userId);
        } else {
            setUser(null);
            setLoading(false);
        }
    }, [userId, fetchUser]);

    return {
        user,
        loading,
        error,
        refresh,
        clearError
    };
};