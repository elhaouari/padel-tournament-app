// API utility functions for consistent HTTP operations and error handling

import { ApiResponse, ApiError, PaginationMeta } from '../types';

// Base API configuration
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// HTTP status codes
export const HTTP_STATUS = {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    UNPROCESSABLE_ENTITY: 422,
    TOO_MANY_REQUESTS: 429,
    INTERNAL_SERVER_ERROR: 500,
    BAD_GATEWAY: 502,
    SERVICE_UNAVAILABLE: 503
} as const;

// Request timeout
export const DEFAULT_TIMEOUT = 30000; // 30 seconds

// Create standardized API response
export const createApiResponse = <T>(
    data: T,
    success = true,
    message?: string
): ApiResponse<T> => ({
    success,
    data,
    message,
    timestamp: new Date()
});

// Create API error response
export const createApiError = (
    message: string,
    status?: number,
    code?: string,
    details?: any
): ApiError => ({
    message,
    status,
    code,
    details,
    timestamp: new Date()
});

// Build URL with query parameters
export const buildUrl = (
    baseUrl: string,
    path: string,
    params?: Record<string, any>
): string => {
    const url = new URL(path, baseUrl);

    if (params) {
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        });
    }

    return url.toString();
};

// Build pagination query params
export const buildPaginationParams = (
    page = 1,
    limit = 12,
    additionalParams?: Record<string, any>
): Record<string, any> => ({
    page,
    limit,
    ...additionalParams
});

// Parse pagination metadata from response headers
export const parsePaginationMeta = (
    headers: Headers,
    page: number,
    limit: number
): PaginationMeta => {
    const total = parseInt(headers.get('X-Total-Count') || '0', 10);
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
    };
};

// Create request headers
export const createHeaders = (
    contentType = 'application/json',
    additionalHeaders?: Record<string, string>
): Record<string, string> => {
    const headers: Record<string, string> = {
        'Content-Type': contentType,
        'Accept': 'application/json'
    };

    if (additionalHeaders) {
        Object.assign(headers, additionalHeaders);
    }

    return headers;
};

// Add authentication header
export const addAuthHeader = (
    headers: Record<string, string>,
    token: string
): Record<string, string> => ({
    ...headers,
    'Authorization': `Bearer ${token}`
});

// Retry configuration
export interface RetryConfig {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
    backoffFactor: number;
    retryCondition?: (error: any) => boolean;
}

export const DEFAULT_RETRY_CONFIG: RetryConfig = {
    maxAttempts: 3,
    initialDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2,
    retryCondition: (error) => {
        // Retry on network errors or 5xx server errors
        return !error.response || error.response.status >= 500;
    }
};

// Sleep utility for retries
export const sleep = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

// Retry mechanism with exponential backoff
export const withRetry = async <T>(
    operation: () => Promise<T>,
    config: Partial<RetryConfig> = {}
): Promise<T> => {
    const { maxAttempts, initialDelay, maxDelay, backoffFactor, retryCondition } = {
        ...DEFAULT_RETRY_CONFIG,
        ...config
    };

    let lastError: any;
    let delay = initialDelay;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error;

            // Don't retry if it's the last attempt or condition not met
            if (attempt === maxAttempts || !retryCondition?.(error)) {
                break;
            }

            await sleep(delay);
            delay = Math.min(delay * backoffFactor, maxDelay);
        }
    }

    throw lastError;
};

// Enhanced fetch with timeout
export const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeout = DEFAULT_TIMEOUT
): Promise<Response> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal
        });

        return response;
    } finally {
        clearTimeout(id);
    }
};

// Parse error from response
export const parseErrorFromResponse = async (response: Response): Promise<ApiError> => {
    let message = `HTTP ${response.status}: ${response.statusText}`;
    let details: any = undefined;

    try {
        const errorData = await response.json();

        if (errorData.message) {
            message = errorData.message;
        }

        if (errorData.errors || errorData.details) {
            details = errorData.errors || errorData.details;
        }
    } catch {
        // Response is not JSON, use status text
    }

    return createApiError(message, response.status, undefined, details);
};

// Generic API request function
export const apiRequest = async <T>(
    url: string,
    options: RequestInit = {},
    config: {
        timeout?: number;
        retry?: Partial<RetryConfig>;
        parseResponse?: boolean;
    } = {}
): Promise<T> => {
    const { timeout = DEFAULT_TIMEOUT, retry, parseResponse = true } = config;

    const makeRequest = async (): Promise<T> => {
        const response = await fetchWithTimeout(url, options, timeout);

        if (!response.ok) {
            throw await parseErrorFromResponse(response);
        }

        if (!parseResponse) {
            return response as unknown as T;
        }

        const contentType = response.headers.get('content-type');

        if (contentType?.includes('application/json')) {
            return await response.json();
        }

        return (await response.text()) as unknown as T;
    };

    if (retry) {
        return await withRetry(makeRequest, retry);
    }

    return await makeRequest();
};

// HTTP method helpers
export const get = <T>(url: string, params?: Record<string, any>): Promise<T> => {
    const finalUrl = params ? buildUrl('', url, params) : url;
    return apiRequest<T>(finalUrl, { method: 'GET' });
};

export const post = <T>(
    url: string,
    data?: any,
    headers?: Record<string, string>
): Promise<T> => {
    return apiRequest<T>(url, {
        method: 'POST',
        headers: createHeaders('application/json', headers),
        body: data ? JSON.stringify(data) : undefined
    });
};

export const put = <T>(
    url: string,
    data?: any,
    headers?: Record<string, string>
): Promise<T> => {
    return apiRequest<T>(url, {
        method: 'PUT',
        headers: createHeaders('application/json', headers),
        body: data ? JSON.stringify(data) : undefined
    });
};

export const patch = <T>(
    url: string,
    data?: any,
    headers?: Record<string, string>
): Promise<T> => {
    return apiRequest<T>(url, {
        method: 'PATCH',
        headers: createHeaders('application/json', headers),
        body: data ? JSON.stringify(data) : undefined
    });
};

export const del = <T>(
    url: string,
    headers?: Record<string, string>
): Promise<T> => {
    return apiRequest<T>(url, {
        method: 'DELETE',
        headers: createHeaders('application/json', headers)
    });
};

// File upload helper
export const uploadFile = async <T>(
    url: string,
    file: File,
    additionalData?: Record<string, string>
): Promise<T> => {
    const formData = new FormData();
    formData.append('file', file);

    if (additionalData) {
        Object.entries(additionalData).forEach(([key, value]) => {
            formData.append(key, value);
        });
    }

    return apiRequest<T>(url, {
        method: 'POST',
        body: formData
        // Don't set Content-Type header, let browser set it with boundary
    });
};

// Error type guards
export const isApiError = (error: any): error is ApiError => {
    return error && typeof error.message === 'string' && 'timestamp' in error;
};

export const isNetworkError = (error: any): boolean => {
    return error.name === 'TypeError' && error.message.includes('fetch');
};

export const isTimeoutError = (error: any): boolean => {
    return error.name === 'AbortError' || error.message.includes('timeout');
};

// Response type guards
export const isSuccessResponse = <T>(
    response: ApiResponse<T>
): response is ApiResponse<T> & { success: true; data: T } => {
    return response.success === true && response.data !== undefined;
};

// Cache utilities
const responseCache = new Map<string, { data: any; timestamp: number; ttl: number }>();

export const getCacheKey = (url: string, params?: Record<string, any>): string => {
    const paramStr = params ? JSON.stringify(params) : '';
    return `${url}${paramStr}`;
};

export const getCachedResponse = <T>(
    cacheKey: string
): T | null => {
    const cached = responseCache.get(cacheKey);

    if (!cached) return null;

    const now = Date.now();
    if (now - cached.timestamp > cached.ttl) {
        responseCache.delete(cacheKey);
        return null;
    }

    return cached.data;
};

export const setCachedResponse = <T>(
    cacheKey: string,
    data: T,
    ttlMs = 5 * 60 * 1000 // 5 minutes default
): void => {
    responseCache.set(cacheKey, {
        data,
        timestamp: Date.now(),
        ttl: ttlMs
    });
};

export const clearCache = (pattern?: string): void => {
    if (!pattern) {
        responseCache.clear();
        return;
    }

    const regex = new RegExp(pattern);
    for (const key of responseCache.keys()) {
        if (regex.test(key)) {
            responseCache.delete(key);
        }
    }
};

// Request interceptor type
export type RequestInterceptor = (
    url: string,
    options: RequestInit
) => Promise<{ url: string; options: RequestInit }> | { url: string; options: RequestInit };

// Response interceptor type
export type ResponseInterceptor = (response: Response) => Promise<Response> | Response;

// Global interceptors
const requestInterceptors: RequestInterceptor[] = [];
const responseInterceptors: ResponseInterceptor[] = [];

export const addRequestInterceptor = (interceptor: RequestInterceptor): void => {
    requestInterceptors.push(interceptor);
};

export const addResponseInterceptor = (interceptor: ResponseInterceptor): void => {
    responseInterceptors.push(interceptor);
};

// Apply interceptors
const applyRequestInterceptors = async (
    url: string,
    options: RequestInit
): Promise<{ url: string; options: RequestInit }> => {
    let currentUrl = url;
    let currentOptions = options;

    for (const interceptor of requestInterceptors) {
        const result = await interceptor(currentUrl, currentOptions);
        currentUrl = result.url;
        currentOptions = result.options;
    }

    return { url: currentUrl, options: currentOptions };
};

const applyResponseInterceptors = async (response: Response): Promise<Response> => {
    let currentResponse = response;

    for (const interceptor of responseInterceptors) {
        currentResponse = await interceptor(currentResponse);
    }

    return currentResponse;
};

// Enhanced API client with interceptors and caching
export class ApiClient {
    private baseUrl: string;
    private defaultHeaders: Record<string, string>;
    private timeout: number;
    private retryConfig: Partial<RetryConfig>;

    constructor(config: {
        baseUrl?: string;
        defaultHeaders?: Record<string, string>;
        timeout?: number;
        retryConfig?: Partial<RetryConfig>;
    } = {}) {
        this.baseUrl = config.baseUrl || API_BASE_URL;
        this.defaultHeaders = config.defaultHeaders || {};
        this.timeout = config.timeout || DEFAULT_TIMEOUT;
        this.retryConfig = config.retryConfig || {};
    }

    private async makeRequest<T>(
        path: string,
        options: RequestInit = {},
        config: {
            cache?: boolean;
            cacheTtl?: number;
        } = {}
    ): Promise<T> {
        const url = buildUrl(this.baseUrl, path);
        const finalOptions: RequestInit = {
            ...options,
            headers: {
                ...this.defaultHeaders,
                ...(options.headers || {})
            }
        };

        // Check cache first
        if (config.cache && options.method === 'GET') {
            const cacheKey = getCacheKey(url);
            const cached = getCachedResponse<T>(cacheKey);
            if (cached) return cached;
        }

        // Apply request interceptors
        const { url: interceptedUrl, options: interceptedOptions } =
            await applyRequestInterceptors(url, finalOptions);

        const makeRequestWithRetry = async (): Promise<T> => {
            const response = await fetchWithTimeout(
                interceptedUrl,
                interceptedOptions,
                this.timeout
            );

            // Apply response interceptors
            const interceptedResponse = await applyResponseInterceptors(response);

            if (!interceptedResponse.ok) {
                throw await parseErrorFromResponse(interceptedResponse);
            }

            const data = await interceptedResponse.json();

            // Cache successful responses
            if (config.cache && interceptedOptions.method === 'GET') {
                const cacheKey = getCacheKey(url);
                setCachedResponse(cacheKey, data, config.cacheTtl);
            }

            return data;
        };

        if (Object.keys(this.retryConfig).length > 0) {
            return await withRetry(makeRequestWithRetry, this.retryConfig);
        }

        return await makeRequestWithRetry();
    }

    async get<T>(path: string, params?: Record<string, any>, config?: { cache?: boolean; cacheTtl?: number }): Promise<T> {
        const url = params ? buildUrl('', path, params) : path;
        return this.makeRequest<T>(url, { method: 'GET' }, config);
    }

    async post<T>(path: string, data?: any): Promise<T> {
        return this.makeRequest<T>(path, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined
        });
    }

    async put<T>(path: string, data?: any): Promise<T> {
        return this.makeRequest<T>(path, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined
        });
    }

    async patch<T>(path: string, data?: any): Promise<T> {
        return this.makeRequest<T>(path, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined
        });
    }

    async delete<T>(path: string): Promise<T> {
        return this.makeRequest<T>(path, { method: 'DELETE' });
    }

    async upload<T>(path: string, file: File, additionalData?: Record<string, string>): Promise<T> {
        const formData = new FormData();
        formData.append('file', file);

        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                formData.append(key, value);
            });
        }

        return this.makeRequest<T>(path, {
            method: 'POST',
            body: formData
        });
    }

    setAuthToken(token: string): void {
        this.defaultHeaders.Authorization = `Bearer ${token}`;
    }

    clearAuthToken(): void {
        delete this.defaultHeaders.Authorization;
    }
}

// Default API client instance
export const apiClient = new ApiClient();

// Utility to handle API errors in components
export const handleApiError = (error: any): string => {
    if (isApiError(error)) {
        return error.message;
    }

    if (isNetworkError(error)) {
        return 'Network error. Please check your connection.';
    }

    if (isTimeoutError(error)) {
        return 'Request timed out. Please try again.';
    }

    return 'An unexpected error occurred. Please try again.';
};

// Batch request utility
export const batchRequests = async <T>(
    requests: Array<() => Promise<T>>,
    options: {
        concurrent?: boolean;
        maxConcurrency?: number;
        failFast?: boolean;
    } = {}
): Promise<Array<{ success: boolean; data?: T; error?: any }>> => {
    const { concurrent = false, maxConcurrency = 5, failFast = false } = options;

    if (!concurrent) {
        // Sequential execution
        const results: Array<{ success: boolean; data?: T; error?: any }> = [];

        for (const request of requests) {
            try {
                const data = await request();
                results.push({ success: true, data });
            } catch (error) {
                if (failFast) throw error;
                results.push({ success: false, error });
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
            return { success: false, error };
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