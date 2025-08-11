import { useState, useEffect, useCallback } from 'react';
import { User, UserFilters } from '../types';
import { getUserService } from '../services';

export const useUsers = (initialFilters: UserFilters = {}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<UserFilters>(initialFilters);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 12,
        total: 0
    });

    const fetchUsers = useCallback(async (page = pagination.page, newFilters = filters) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getUserService().getUsers(page, pagination.limit, newFilters);
            setUsers(response.users);
            setPagination({
                page: response.page,
                limit: response.limit,
                total: response.total
            });
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch users';
            setError(errorMessage);
            console.error('Error fetching users:', err);
        } finally {
            setLoading(false);
        }
    }, [pagination.limit, filters]);

    const searchUsers = useCallback(async (query: string, currentUserId?: string) => {
        if (!query.trim()) return [];
        try {
            return await getUserService().searchUsers(query, currentUserId);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Search failed';
            setError(errorMessage);
            console.error('Error searching users:', err);
            return [];
        }
    }, []);

    const updateFilters = useCallback((newFilters: UserFilters) => {
        setFilters(newFilters);
        setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
        fetchUsers(1, newFilters);
    }, [fetchUsers]);

    const nextPage = useCallback(() => {
        const nextPageNum = pagination.page + 1;
        const maxPage = Math.ceil(pagination.total / pagination.limit);
        if (nextPageNum <= maxPage) {
            fetchUsers(nextPageNum);
        }
    }, [fetchUsers, pagination]);

    const prevPage = useCallback(() => {
        if (pagination.page > 1) {
            fetchUsers(pagination.page - 1);
        }
    }, [fetchUsers, pagination.page]);

    const goToPage = useCallback((page: number) => {
        const maxPage = Math.ceil(pagination.total / pagination.limit);
        if (page >= 1 && page <= maxPage) {
            fetchUsers(page);
        }
    }, [fetchUsers, pagination]);

    const refresh = useCallback(() => {
        fetchUsers(pagination.page, filters);
    }, [fetchUsers, pagination.page, filters]);

    const clearError = () => {
        setError(null);
    };

    // Initial fetch
    useEffect(() => {
        fetchUsers();
    }, []);

    return {
        users,
        loading,
        error,
        filters,
        pagination,
        fetchUsers,
        searchUsers,
        updateFilters,
        nextPage,
        prevPage,
        goToPage,
        refresh,
        clearError,
        hasNextPage: pagination.page < Math.ceil(pagination.total / pagination.limit),
        hasPrevPage: pagination.page > 1,
        totalPages: Math.ceil(pagination.total / pagination.limit)
    };
};