// HTTP Method Types
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

// API Configuration
export interface ApiConfig {
    baseUrl: string;
    timeout: number;
    retries: number;
    retryDelay: number;
}

// Request Types
export interface ApiRequest {
    url: string;
    method: HttpMethod;
    headers?: Record<string, string>;
    data?: any;
    params?: Record<string, any>;
    timeout?: number;
}

export interface ApiRequestConfig {
    timeout?: number;
    retries?: number;
    retryDelay?: number;
    headers?: Record<string, string>;
}

// Response Types
export interface ApiResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
}

// Note: ApiResponse<T> here is for API client responses, while in user.types.ts it's for API payloads.
// ApiError interface represents the structure of an error response from the API.
export interface ApiError {
    message: string;
    status?: number;
    code?: string;
    details?: any;
    timestamp: Date;
}

// Pagination Types
export interface PaginationParams {
    page?: number;
    limit?: number;
    offset?: number;
}

export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
}

export interface PaginatedApiResponse<T> {
    data: T[];
    meta: PaginationMeta;
}

// Query Types
export interface QueryParams {
    [key: string]: string | number | boolean | undefined;
}

export interface SortParams {
    field: string;
    order: 'asc' | 'desc';
}

export interface FilterParams {
    [key: string]: any;
}

// Upload Types
export interface FileUploadRequest {
    file: File;
    fileName?: string;
    contentType?: string;
    metadata?: Record<string, any>;
}

export interface FileUploadResponse {
    url: string;
    fileName: string;
    size: number;
    contentType: string;
    uploadedAt: Date;
}

// Batch Operations
export interface BatchRequest<T> {
    operations: Array<{
        method: HttpMethod;
        url: string;
        data?: T;
    }>;
}

export interface BatchResponse<T> {
    results: Array<{
        success: boolean;
        data?: T;
        error?: ApiError;
    }>;
}

// Real-time Types
export interface WebSocketMessage<T = any> {
    type: string;
    data: T;
    timestamp: Date;
    id?: string;
}

export interface SubscriptionParams {
    channel: string;
    filters?: Record<string, any>;
}

// Cache Types
export interface CacheEntry<T> {
    data: T;
    timestamp: Date;
    ttl: number;
}

export interface CacheConfig {
    defaultTTL: number;
    maxSize: number;
    enableCompression: boolean;
}

// Rate Limiting
export interface RateLimitInfo {
    limit: number;
    remaining: number;
    resetTime: Date;
}

export interface RateLimitConfig {
    requests: number;
    window: number; // in milliseconds
}

// Health Check
export interface HealthCheckResponse {
    status: 'healthy' | 'unhealthy' | 'degraded';
    timestamp: Date;
    services: Record<string, {
        status: 'up' | 'down' | 'degraded';
        responseTime: number;
        lastCheck: Date;
    }>;
}