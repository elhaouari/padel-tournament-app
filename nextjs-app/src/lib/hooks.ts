// Simplified hooks
import { useState, useEffect, useCallback } from 'react';
import { authManager, User, AuthState } from './auth';
import { userService, UserFilters, UsersResponse } from './users';

// Auth Hook
export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
  });

  useEffect(() => {
    const storedUser = authManager.getStoredAuth();
    setAuthState({
      user: storedUser,
      isAuthenticated: !!storedUser,
      loading: false,
    });
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    const result = await authManager.login(email, password);
    
    setAuthState({
      user: result.user || null,
      isAuthenticated: result.success,
      loading: false,
    });

    return result;
  }, []);

  const register = useCallback(async (userData: { name: string; email: string; password: string; role: string }) => {
    setAuthState(prev => ({ ...prev, loading: true }));
    const result = await authManager.register(userData);
    
    setAuthState({
      user: result.user || null,
      isAuthenticated: result.success,
      loading: false,
    });

    return result;
  }, []);

  const logout = useCallback(() => {
    authManager.logout();
    setAuthState({
      user: null,
      isAuthenticated: false,
      loading: false,
    });
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
  };
}

// Users Hook
export function useUsers(filters: UserFilters = {}) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await userService.getUsers(page, 12, filters);
      setUsers(result.users);
      setTotal(result.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    loading,
    error,
    total,
    refetch: fetchUsers,
  };
}

// User Hook
export function useUser(id: string) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchUser = async () => {
      setLoading(true);
      try {
        const userData = await userService.getUserById(id);
        setUser(userData);
        setError(userData ? null : 'User not found');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch user');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id]);

  return { user, loading, error };
}