import { useState, useCallback, useEffect } from 'react';
import { User } from '../types';
import { UserService } from '../services/userService';
import { useDebounce } from './useDebounce';

const userService = new UserService();

export const useSearch = (currentUserId?: string) => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<User[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    // Debounce search query to avoid too many API calls
    const debouncedQuery = useDebounce(query, 300);

    const performSearch = useCallback(async (searchQuery: string) => {
        if (!searchQuery.trim()) {
            setResults([]);
            setHasSearched(false);
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const searchResults = await userService.searchUsers(searchQuery, currentUserId);
            setResults(searchResults);
            setHasSearched(true);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Search failed';
            setError(errorMessage);
            console.error('Search error:', err);
        } finally {
            setLoading(false);
        }
    }, [currentUserId]);

    const clearSearch = useCallback(() => {
        setQuery('');
        setResults([]);
        setError(null);
        setHasSearched(false);
    }, []);

    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Effect to perform search when debounced query changes
    useEffect(() => {
        performSearch(debouncedQuery);
    }, [debouncedQuery, performSearch]);

    return {
        query,
        setQuery,
        results,
        loading,
        error,
        hasSearched,
        clearSearch,
        clearError,
        isEmpty: hasSearched && results.length === 0,
        hasResults: results.length > 0
    };
};