// Main services export file - exports all service classes and functions

import {PrismaUserRepository, MockUserRepository, IUserRepository} from './userRepository';
import {IAuthService, MockAuthService, SupabaseAuthService, ApiAuthService} from "@/modules/user/services/authService";
import {IUserService, UserService, ApiUserService} from "@/modules/user/services/userService";
import {checkApiHealth} from "@/modules/user/services/apiClient";

// Repository exports
export * from './userRepository';

// Authentication service exports
export * from './authService';

// User service exports
export * from './userService';

// API client exports
export * from './apiClient';
export {
    apiClient,
    userApiService,
    authApiService,
    uploadApiService,
    api,
    handleApiError,
    isApiSuccess,
    isApiError,
    batchApiRequests,
    clearAllCache,
    clearUserCache,
    checkApiHealth
} from './apiClient';

// Service factory functions for dependency injection
export const createUserService = (
    userRepository: IUserRepository,
    authService?: IAuthService
): IUserService => {
    return new UserService(userRepository, authService);
};

// Default service instances (can be overridden in tests)
let defaultUserRepository: IUserRepository;
let defaultAuthService: IAuthService;
let defaultUserService: IUserService;

// Initialize default services
export const initializeServices = (config: {
    prismaClient?: any;
    supabaseClient?: any;
    mockMode?: boolean;
}) => {
    const { prismaClient, supabaseClient, mockMode = false } = config;

    if (mockMode || (!prismaClient && !supabaseClient)) {
        // Use API-based services for client-side or mock services for testing
        if (typeof window !== 'undefined') {
            // Client-side: use API-based services
            defaultUserService = new ApiUserService();
            defaultAuthService = new ApiAuthService();
            defaultUserRepository = new MockUserRepository(); // Not used by ApiUserService
        } else {
            // Server-side testing: use mock services
            defaultUserRepository = new MockUserRepository();
            defaultAuthService = new MockAuthService();
            defaultUserService = new UserService(defaultUserRepository, defaultAuthService);
        }
    } else {
        // Use real services with provided clients (server-side)
        if (prismaClient) {
            defaultUserRepository = new PrismaUserRepository(prismaClient);
        } else {
            throw new Error('Prisma client is required for PrismaUserRepository');
        }

        if (supabaseClient) {
            defaultAuthService = new SupabaseAuthService(supabaseClient);
        } else {
            throw new Error('Supabase client is required for SupabaseAuthService');
        }

        defaultUserService = new UserService(defaultUserRepository, defaultAuthService);
    }
};

// Getter functions for default services
export const getUserRepository = (): IUserRepository => {
    if (!defaultUserRepository) {
        throw new Error('Services not initialized. Call initializeServices() first.');
    }
    return defaultUserRepository;
};

export const getAuthService = (): IAuthService => {
    if (!defaultAuthService) {
        throw new Error('Services not initialized. Call initializeServices() first.');
    }
    return defaultAuthService;
};

export const getUserService = (): IUserService => {
    if (!defaultUserService) {
        throw new Error('Services not initialized. Call initializeServices() first.');
    }
    return defaultUserService;
};

// Service configuration interface
export interface ServiceConfig {
    database: {
        type: 'prisma' | 'mock';
        client?: any;
    };
    auth: {
        type: 'supabase' | 'mock';
        client?: any;
    };
    api: {
        baseUrl?: string;
        timeout?: number;
        retryConfig?: {
            maxAttempts: number;
            initialDelay: number;
            maxDelay: number;
            backoffFactor: number;
        };
    };
}

// Advanced service factory with full configuration
export const createServices = (config: ServiceConfig) => {
    let userRepository: IUserRepository;
    let authService: IAuthService;

    // Create user repository
    switch (config.database.type) {
        case 'prisma':
            if (!config.database.client) {
                throw new Error('Prisma client is required for prisma database type');
            }
            userRepository = new PrismaUserRepository(config.database.client);
            break;
        case 'mock':
            userRepository = new MockUserRepository();
            break;
        default:
            throw new Error(`Unsupported database type: ${config.database.type}`);
    }

    // Create auth service
    switch (config.auth.type) {
        case 'supabase':
            if (!config.auth.client) {
                throw new Error('Supabase client is required for supabase auth type');
            }
            authService = new SupabaseAuthService(config.auth.client);
            break;
        case 'mock':
            authService = new MockAuthService();
            break;
        default:
            throw new Error(`Unsupported auth type: ${config.auth.type}`);
    }

    // Create user service
    const userService = new UserService(userRepository, authService);

    return {
        userRepository,
        authService,
        userService,
        // Convenience getters
        getRepository: () => userRepository,
        getAuth: () => authService,
        getUser: () => userService
    };
};

// Testing utilities
export const createMockServices = () => {
    return createServices({
        database: { type: 'mock' },
        auth: { type: 'mock' },
        api: {}
    });
};

// Production service factory
export const createProductionServices = (
    prismaClient: any,
    supabaseClient: any,
    apiConfig?: Partial<ServiceConfig['api']>
) => {
    return createServices({
        database: { type: 'prisma', client: prismaClient },
        auth: { type: 'supabase', client: supabaseClient },
        api: apiConfig || {}
    });
};

// Error handling utilities for services
export const handleServiceError = (error: any, context: string): never => {
    console.error(`Service error in ${context}:`, error);

    if (error.message) {
        throw new Error(`${context}: ${error.message}`);
    }

    throw new Error(`${context}: An unexpected error occurred`);
};

// Service health check
export const checkServicesHealth = async () => {
    const health = {
        userRepository: false,
        authService: false,
        apiClient: false,
        timestamp: new Date()
    };

    try {
        // Check user repository
        const userRepo = getUserRepository();
        await userRepo.count();
        health.userRepository = true;
    } catch (error) {
        console.error('User repository health check failed:', error);
    }

    try {
        // Check auth service
        const auth = getAuthService();
        await auth.getSession();
        health.authService = true;
    } catch (error) {
        console.error('Auth service health check failed:', error);
    }

    try {
        // Check API client
        health.apiClient = await checkApiHealth();
    } catch (error) {
        console.error('API client health check failed:', error);
    }

    return health;
};

// Service configuration validation
export const validateServiceConfig = (config: ServiceConfig): string[] => {
    const errors: string[] = [];

    // Validate database config
    if (!config.database.type) {
        errors.push('Database type is required');
    } else if (config.database.type === 'prisma' && !config.database.client) {
        errors.push('Prisma client is required when using prisma database type');
    }

    // Validate auth config
    if (!config.auth.type) {
        errors.push('Auth type is required');
    } else if (config.auth.type === 'supabase' && !config.auth.client) {
        errors.push('Supabase client is required when using supabase auth type');
    }

    // Validate API config
    if (config.api.baseUrl && !config.api.baseUrl.startsWith('http')) {
        errors.push('API base URL must start with http or https');
    }

    if (config.api.timeout && config.api.timeout < 1000) {
        errors.push('API timeout must be at least 1000ms');
    }

    return errors;
};

// Service metrics (for monitoring)
export const getServiceMetrics = () => {
    // This would typically integrate with monitoring tools
    return {
        userRepository: {
            totalCalls: 0, // Would track actual metrics
            averageResponseTime: 0,
            errorRate: 0
        },
        authService: {
            totalCalls: 0,
            averageResponseTime: 0,
            errorRate: 0
        },
        apiClient: {
            totalRequests: 0,
            averageResponseTime: 0,
            errorRate: 0,
            cacheHitRate: 0
        }
    };
};