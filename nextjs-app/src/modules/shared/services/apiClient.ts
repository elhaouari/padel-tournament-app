// src/modules/shared/services/apiClient.ts - Updated to match user module expectations

export interface ApiClientConfig {
    baseUrl?: string;
    timeout?: number;
    defaultHeaders?: Record<string, string>;
    retryConfig?: {
        maxAttempts: number;
        initialDelay: number;
        maxDelay: number;
        backoffFactor: number;
    };
}

export interface RequestInterceptor {
    (url: string, options: RequestInit): { url: string; options: RequestInit };
}

export interface ResponseInterceptor {
    (response: Response): Response;
}

export class ApiClient {
    private baseUrl: string;
    private timeout: number;
    private defaultHeaders: Record<string, string>;
    private retryConfig: {
        maxAttempts: number;
        initialDelay: number;
        maxDelay: number;
        backoffFactor: number;
    };
    private cache: Map<string, { data: any; timestamp: number }> = new Map();
    private requestInterceptors: RequestInterceptor[] = [];
    private responseInterceptors: ResponseInterceptor[] = [];

    constructor(config: ApiClientConfig = {}) {
        this.baseUrl = config.baseUrl || '';
        this.timeout = config.timeout || 30000;
        this.defaultHeaders = config.defaultHeaders || {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        this.retryConfig = config.retryConfig || {
            maxAttempts: 3,
            initialDelay: 1000,
            maxDelay: 5000,
            backoffFactor: 2
        };
    }

    // Interceptor methods
    addRequestInterceptor(interceptor: RequestInterceptor): void {
        this.requestInterceptors.push(interceptor);
    }

    addResponseInterceptor(interceptor: ResponseInterceptor): void {
        this.responseInterceptors.push(interceptor);
    }

    // Apply request interceptors
    private applyRequestInterceptors(url: string, options: RequestInit): { url: string; options: RequestInit } {
        let result = { url, options };

        for (const interceptor of this.requestInterceptors) {
            result = interceptor(result.url, result.options);
        }

        return result;
    }

    // Apply response interceptors
    private applyResponseInterceptors(response: Response): Response {
        let result = response;

        for (const interceptor of this.responseInterceptors) {
            result = interceptor(result);
        }

        return result;
    }

    // Cache management
    clearCache(url?: string): void {
        if (url) {
            this.cache.delete(`${this.baseUrl}${url}`);
        } else {
            this.cache.clear();
        }
    }

    private getCacheKey(url: string, params?: any): string {
        const fullUrl = `${this.baseUrl}${url}`;
        if (params) {
            const searchParams = new URLSearchParams(params);
            return `${fullUrl}?${searchParams.toString()}`;
        }
        return fullUrl;
    }

    private getFromCache(cacheKey: string, cacheTtl?: number): any | null {
        const cached = this.cache.get(cacheKey);
        if (cached && cacheTtl) {
            const isExpired = Date.now() - cached.timestamp > cacheTtl;
            if (isExpired) {
                this.cache.delete(cacheKey);
                return null;
            }
            return cached.data;
        }
        return cached ? cached.data : null;
    }

    private setCache(cacheKey: string, data: any): void {
        this.cache.set(cacheKey, {
            data,
            timestamp: Date.now()
        });
    }

    // Retry logic
    private async executeWithRetry<T>(operation: () => Promise<T>): Promise<T> {
        let lastError: any;

        for (let attempt = 1; attempt <= this.retryConfig.maxAttempts; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;

                if (attempt === this.retryConfig.maxAttempts) {
                    throw error;
                }

                // Calculate delay with exponential backoff
                const delay = Math.min(
                    this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffFactor, attempt - 1),
                    this.retryConfig.maxDelay
                );

                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }

        throw lastError;
    }

    // Main request method
    private async request(
        url: string,
        options: RequestInit = {},
        cacheOptions?: { cache?: boolean; cacheTtl?: number }
    ): Promise<any> {
        const fullUrl = `${this.baseUrl}${url}`;

        // Check cache first for GET requests
        if (options.method === 'GET' || !options.method) {
            const cacheKey = this.getCacheKey(url, null);
            if (cacheOptions?.cache) {
                const cachedData = this.getFromCache(cacheKey, cacheOptions.cacheTtl);
                if (cachedData) {
                    return cachedData;
                }
            }
        }

        // Prepare request options
        const requestOptions: RequestInit = {
            ...options,
            headers: {
                ...this.defaultHeaders,
                ...options.headers
            }
        };

        // Apply request interceptors
        const { url: interceptedUrl, options: interceptedOptions } = this.applyRequestInterceptors(fullUrl, requestOptions);

        // Create abort controller for timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await this.executeWithRetry(async () => {
                const res = await fetch(interceptedUrl, {
                    ...interceptedOptions,
                    signal: controller.signal
                });

                clearTimeout(timeoutId);

                // Apply response interceptors
                const interceptedResponse = this.applyResponseInterceptors(res);

                if (!interceptedResponse.ok) {
                    const errorData = await interceptedResponse.text();
                    let parsedError;
                    try {
                        parsedError = JSON.parse(errorData);
                    } catch {
                        parsedError = { message: errorData };
                    }

                    const error = new Error(parsedError.message || `HTTP ${interceptedResponse.status}`);
                    (error as any).status = interceptedResponse.status;
                    (error as any).response = parsedError;
                    throw error;
                }

                return interceptedResponse;
            });

            // Parse response
            const contentType = response.headers.get('Content-Type');
            let data;

            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            // Cache successful GET responses
            if ((options.method === 'GET' || !options.method) && cacheOptions?.cache) {
                const cacheKey = this.getCacheKey(url, null);
                this.setCache(cacheKey, data);
            }

            return data;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    // HTTP methods
    async get(url: string, params?: any, options?: { cache?: boolean; cacheTtl?: number }): Promise<any> {
        let fullUrl = url;
        if (params) {
            const searchParams = new URLSearchParams(params);
            fullUrl = `${url}?${searchParams.toString()}`;
        }

        return this.request(fullUrl, { method: 'GET' }, options);
    }

    async post(url: string, data?: any, options?: RequestInit): Promise<any> {
        return this.request(url, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
            ...options
        });
    }

    async put(url: string, data?: any, options?: RequestInit): Promise<any> {
        return this.request(url, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
            ...options
        });
    }

    async delete(url: string, options?: RequestInit): Promise<any> {
        return this.request(url, {
            method: 'DELETE',
            ...options
        });
    }

    async patch(url: string, data?: any, options?: RequestInit): Promise<any> {
        return this.request(url, {
            method: 'PATCH',
            body: data ? JSON.stringify(data) : undefined,
            ...options
        });
    }

    // File upload method
    async upload(url: string, file: File, additionalData?: Record<string, any>, options?: RequestInit): Promise<any> {
        const formData = new FormData();
        formData.append('file', file);

        if (additionalData) {
            Object.entries(additionalData).forEach(([key, value]) => {
                formData.append(key, String(value));
            });
        }

        // Remove Content-Type header for FormData (browser will set it automatically)
        const { 'Content-Type': _, ...headersWithoutContentType } = this.defaultHeaders;

        return this.request(url, {
            method: 'POST',
            body: formData,
            headers: headersWithoutContentType,
            ...options
        });
    }
}

// Export configured client instance
export const apiClient = new ApiClient({
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