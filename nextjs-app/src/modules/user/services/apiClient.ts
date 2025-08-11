import { ApiClient } from '../../shared/services/apiClient';

// API endpoints
export const API_ENDPOINTS = {
    // User endpoints
    USERS: '/api/users',
    USER_BY_ID: (id: string) => `/api/users/${id}`,
    USER_SEARCH: '/api/users/search',
    USER_STATS: '/api/users/stats',

    // Authentication endpoints
    AUTH_REGISTER: '/api/auth/register',
    AUTH_LOGIN: '/api/auth/login',
    AUTH_LOGOUT: '/api/auth/logout',
    AUTH_REFRESH: '/api/auth/refresh',
    AUTH_RESET_PASSWORD: '/api/auth/reset-password',

    // Profile endpoints
    PROFILE: (id: string) => `/api/users/${id}/profile`,
    PROFILE_AVATAR: (id: string) => `/api/users/${id}/avatar`,

    // Upload endpoints
    UPLOAD_AVATAR: '/api/upload/avatar'
} as const;

// Create configured API client instance
const createApiClient = () => {
    const client = new ApiClient({
        baseUrl: process.env.NEXT_PUBLIC_API_URL || '',
        timeout: 30000,
        defaultHeaders: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        retryConfig: {
            maxAttempts: 3,
            initialDelay: 1000,
            maxDelay: 5000,
            backoffFactor: 2
        }
    });

    // Add request interceptor for authentication
    client.addRequestInterceptor((url, options) => {
        // Add auth token if available
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('supabase.auth.token');
            if (token) {
                try {
                    const parsed = JSON.parse(token);
                    if (parsed.access_token) {
                        options.headers = {
                            ...options.headers,
                            Authorization: `Bearer ${parsed.access_token}`
                        };
                    }
                } catch (error) {
                    console.warn('Failed to parse auth token:', error);
                }
            }
        }

        return { url, options };
    });

    // Add response interceptor for error handling
    client.addResponseInterceptor((response) => {
        // Handle common HTTP errors
        if (response.status === 401) {
            // Unauthorized - redirect to login
            if (typeof window !== 'undefined') {
                window.location.href = '/auth/login';
            }
        } else if (response.status === 403) {
            // Forbidden - show error message
            console.error('Access forbidden');
        } else if (response.status >= 500) {
            // Server error - show generic message
            console.error('Server error occurred');
        }

        return response;
    });

    return client;
};

// Export configured client instance
export const apiClient = createApiClient();

// Specialized API service classes
export class UserApiService {
    constructor(private client: ApiClient = apiClient) {}

    // User CRUD operations
    async getUsers(params: {
        page?: number;
        limit?: number;
        role?: string;
        level?: string;
        location?: string;
        search?: string;
    } = {}) {
        return this.client.get(API_ENDPOINTS.USERS, params, { cache: true, cacheTtl: 2 * 60 * 1000 });
    }

    async getUserById(id: string) {
        return this.client.get(API_ENDPOINTS.USER_BY_ID(id), undefined, { cache: true, cacheTtl: 5 * 60 * 1000 });
    }

    async createUser(userData: any) {
        return this.client.post(API_ENDPOINTS.USERS, userData);
    }

    async updateUser(id: string, userData: any) {
        // Clear cache for this user
        this.clearUserCache(id);
        return this.client.put(API_ENDPOINTS.USER_BY_ID(id), userData);
    }

    async deleteUser(id: string) {
        this.clearUserCache(id);
        return this.client.delete(API_ENDPOINTS.USER_BY_ID(id));
    }

    async searchUsers(query: string, currentUserId?: string) {
        return this.client.get(API_ENDPOINTS.USER_SEARCH, {
            q: query,
            exclude: currentUserId
        });
    }

    async getUserStats() {
        return this.client.get(API_ENDPOINTS.USER_STATS, undefined, {
            cache: true,
            cacheTtl: 10 * 60 * 1000 // Cache for 10 minutes
        });
    }

    // Profile operations
    async updateProfile(id: string, profileData: any) {
        this.clearUserCache(id);
        return this.client.put(API_ENDPOINTS.PROFILE(id), profileData);
    }

    async uploadAvatar(id: string, file: File) {
        this.clearUserCache(id);
        return this.client.upload(API_ENDPOINTS.PROFILE_AVATAR(id), file);
    }

    // Cache management
    private clearUserCache(userId: string) {
        if (this.client.clearCache) {
            this.client.clearCache(`/api/users/${userId}`);
            this.client.clearCache('/api/users'); // Clear user list cache too
        }
    }
}

export class AuthApiService {
    constructor(private client: ApiClient = apiClient) {}

    async register(userData: {
        email: string;
        password: string;
        name: string;
        role: string;
        [key: string]: any;
    }) {
        return this.client.post(API_ENDPOINTS.AUTH_REGISTER, userData);
    }

    async login(credentials: { email: string; password: string }) {
        return this.client.post(API_ENDPOINTS.AUTH_LOGIN, credentials);
    }

    async logout() {
        return this.client.post(API_ENDPOINTS.AUTH_LOGOUT);
    }

    async refreshToken() {
        return this.client.post(API_ENDPOINTS.AUTH_REFRESH);
    }

    async resetPassword(email: string) {
        return this.client.post(API_ENDPOINTS.AUTH_RESET_PASSWORD, { email });
    }

    async updatePassword(currentPassword: string, newPassword: string) {
        return this.client.put(API_ENDPOINTS.AUTH_RESET_PASSWORD, {
            currentPassword,
            newPassword
        });
    }
}

export class UploadApiService {
    constructor(private client: ApiClient = apiClient) {}

    async uploadAvatar(file: File, userId: string) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('userId', userId);
        formData.append('type', 'avatar');

        return this.client.upload(API_ENDPOINTS.UPLOAD_AVATAR, file, {
            userId,
            type: 'avatar'
        });
    }

    async uploadDocument(file: File, userId: string, documentType: string) {
        return this.client.upload('/api/upload/document', file, {
            userId,
            type: documentType
        });
    }
}

// Export service instances
export const userApiService = new UserApiService();
export const authApiService = new AuthApiService();
export const uploadApiService = new UploadApiService();

// Higher-level API functions for common operations
export const api = {
    // User operations
    users: {
        list: (params?: any) => userApiService.getUsers(params),
        get: (id: string) => userApiService.getUserById(id),
        create: (data: any) => userApiService.createUser(data),
        update: (id: string, data: any) => userApiService.updateUser(id, data),
        delete: (id: string) => userApiService.deleteUser(id),
        search: (query: string, exclude?: string) => userApiService.searchUsers(query, exclude),
        stats: () => userApiService.getUserStats()
    },

    // Authentication operations
    auth: {
        register: (data: any) => authApiService.register(data),
        login: (credentials: any) => authApiService.login(credentials),
        logout: () => authApiService.logout(),
        refresh: () => authApiService.refreshToken(),
        resetPassword: (email: string) => authApiService.resetPassword(email),
        updatePassword: (current: string, new_: string) => authApiService.updatePassword(current, new_)
    },

    // Profile operations
    profile: {
        update: (id: string, data: any) => userApiService.updateProfile(id, data),
        uploadAvatar: (id: string, file: File) => userApiService.uploadAvatar(id, file)
    },

    // Upload operations
    upload: {
        avatar: (file: File, userId: string) => uploadApiService.uploadAvatar(file, userId),
        document: (file: File, userId: string, type: string) => uploadApiService.uploadDocument(file, userId, type)
    }
};

// Request/Response interceptors for common patterns
export const setupApiInterceptors = () => {
    // Request interceptor for loading states
    apiClient.addRequestInterceptor((url, options) => {
        // You can dispatch loading actions here if using Redux/Zustand
        return { url, options };
    });

    // Response interceptor for error handling
    apiClient.addResponseInterceptor((response) => {
        // You can handle global errors here
        if (!response.ok) {
            // Log error or show notification
            console.error(`API Error: ${response.status} ${response.statusText}`);
        }
        return response;
    });
};

// Error handling utilities
export const handleApiError = (error: any): string => {
    if (error.status) {
        switch (error.status) {
            case 400:
                return error.message || 'Invalid request. Please check your input.';
            case 401:
                return 'Authentication required. Please log in.';
            case 403:
                return 'Access denied. You don\'t have permission for this action.';
            case 404:
                return 'Resource not found.';
            case 409:
                return error.message || 'Conflict. Resource already exists.';
            case 422:
                return error.message || 'Validation failed. Please check your input.';
            case 429:
                return 'Too many requests. Please try again later.';
            case 500:
                return 'Server error. Please try again later.';
            case 503:
                return 'Service temporarily unavailable. Please try again later.';
            default:
                return error.message || 'An unexpected error occurred.';
        }
    }

    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return 'Network error. Please check your connection.';
    }

    if (error.name === 'AbortError') {
        return 'Request timeout. Please try again.';
    }

    return error.message || 'An unexpected error occurred.';
};

// Type-safe API response helpers
export const isApiSuccess = <T>(response: any): response is { success: true; data: T } => {
    return response && response.success === true;
};

export const isApiError = (response: any): response is { success: false; error: string } => {
    return response && response.success === false;
};

// Batch operations helper
export const batchApiRequests = async <T>(
    requests: (() => Promise<T>)[],
    options: {
        concurrent?: boolean;
        maxConcurrency?: number;
        failFast?: boolean;
    } = {}
): Promise<Array<{ success: boolean; data?: T; error?: any }>> => {
    const { concurrent = true, maxConcurrency = 5, failFast = false } = options;

    if (!concurrent) {
        // Sequential execution
        const results: Array<{ success: boolean; data?: T; error?: any }> = [];

        for (const request of requests) {
            try {
                const data = await request();
                results.push({ success: true, data });
            } catch (error) {
                if (failFast) throw error;
                results.push({ success: false, error: handleApiError(error) });
            }
        }

        return results;
    }

    // Concurrent execution with limited concurrency
    const executeWithLimit = async (request: () => Promise<T>) => {
        try {
            const data = await request();
            return { success: true, data };
        } catch (error) {
            if (failFast) throw error;
            return { success: false, error: handleApiError(error) };
        }
    };

    const results: Array<{ success: boolean; data?: T; error?: any }> = [];
    const executing: Promise<void>[] = [];

    for (const request of requests) {
        const promise = executeWithLimit(request).then(result => {
            results.push(result);
        });

        executing.push(promise);

        if (executing.length >= maxConcurrency) {
            await Promise.race(executing);
            executing.splice(executing.findIndex(p => p === promise), 1);
        }
    }

    await Promise.all(executing);
    return results;
};

// Cache management utilities
export const clearAllCache = () => {
    if (apiClient.clearCache) {
        apiClient.clearCache();
    }
};

export const clearUserCache = (userId?: string) => {
    if (apiClient.clearCache) {
        if (userId) {
            apiClient.clearCache(`/api/users/${userId}`);
        }
        apiClient.clearCache('/api/users');
    }
};

// Health check utility
export const checkApiHealth = async (): Promise<boolean> => {
    try {
        const response = await apiClient.get('/api/health');
        return response.status === 'healthy';
    } catch (error) {
        console.error('API health check failed:', error);
        return false;
    }
};