// Main utils export file - exports all utility functions for the user module

// Validation utilities
export * from './userValidation';

// User helper functions
export * from './userHelpers';

// Formatting utilities
export * from './formatUtils';

// API utilities
export * from './apiUtils';

// Constants
export * from './constants';


// Import missing constants and utilities
import {
    USER_ROLE_OPTIONS,
    PADEL_LEVEL_OPTIONS,
    REGEX_PATTERNS,
    USER_VALIDATION
} from './constants';

import { getRoleIcon, getDisplayName, getPadelLevelLabel, formatHourlyRate, createUserSlug } from './userHelpers';


// Utility type guards and helpers
export const isValidUserRole = (role: string): boolean => {
    return USER_ROLE_OPTIONS.some(option => option.value === role);
};

export const isValidPadelLevel = (level: string): boolean => {
    return PADEL_LEVEL_OPTIONS.some(option => option.value === level);
};

// Common utility combinations
export const formatUserDisplayName = (user: { name: string; role: string }): string => {
    const roleIcon = getRoleIcon(user.role as any);
    return `${roleIcon} ${getDisplayName(user as any)}`;
};

export const getUserSummary = (user: any): string => {
    const parts = [getDisplayName(user)];

    if (user.location) {
        parts.push(`from ${user.location}`);
    }

    if (user.role === 'PLAYER' && user.level) {
        parts.push(`${getPadelLevelLabel(user.level)} player`);
    } else if (user.role === 'COACH' && user.hourlyRate) {
        parts.push(`coach at ${formatHourlyRate(user.hourlyRate)}`);
    }

    return parts.join(' ');
};

// Form validation helpers
export const getFieldValidationRules = (fieldName: string) => {
    const rules: any = {};

    switch (fieldName) {
        case 'email':
            rules.required = true;
            rules.pattern = REGEX_PATTERNS.EMAIL;
            break;
        case 'name':
            rules.required = true;
            rules.minLength = USER_VALIDATION.NAME_MIN_LENGTH;
            rules.maxLength = USER_VALIDATION.NAME_MAX_LENGTH;
            break;
        case 'password':
            rules.required = true;
            rules.minLength = USER_VALIDATION.PASSWORD_MIN_LENGTH;
            break;
        case 'phone':
            rules.pattern = REGEX_PATTERNS.PHONE;
            break;
        case 'bio':
            rules.maxLength = USER_VALIDATION.BIO_MAX_LENGTH;
            break;
        case 'location':
            rules.maxLength = USER_VALIDATION.LOCATION_MAX_LENGTH;
            break;
        case 'hourlyRate':
            rules.min = USER_VALIDATION.HOURLY_RATE_MIN;
            rules.max = USER_VALIDATION.HOURLY_RATE_MAX;
            break;
    }

    return rules;
};

// Debug utilities (only in development)
export const debugLog = (message: string, data?: any): void => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`[User Module] ${message}`, data || '');
    }
};

export const debugError = (message: string, error?: any): void => {
    if (process.env.NODE_ENV === 'development') {
        console.error(`[User Module Error] ${message}`, error || '');
    }
};

// Performance utilities
export const measurePerformance = <T>(
    fn: () => T,
    label: string
): T => {
    if (process.env.NODE_ENV === 'development') {
        const start = performance.now();
        const result = fn();
        const end = performance.now();
        console.log(`[Performance] ${label}: ${(end - start).toFixed(2)}ms`);
        return result;
    }
    return fn();
};

// Local storage helpers specific to user module
export const getUserFromStorage = (): any | null => {
    if (typeof window === 'undefined') return null;

    try {
        const stored = localStorage.getItem('padel_user');
        return stored ? JSON.parse(stored) : null;
    } catch {
        return null;
    }
};

export const setUserInStorage = (user: any): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.setItem('padel_user', JSON.stringify(user));
    } catch (error) {
        console.error('Failed to store user data:', error);
    }
};

export const removeUserFromStorage = (): void => {
    if (typeof window === 'undefined') return;

    try {
        localStorage.removeItem('padel_user');
    } catch (error) {
        console.error('Failed to remove user data:', error);
    }
};

// URL utilities for user module
export const createUserProfileUrl = (userId: string, userName?: string): string => {
    const slug = userName ? createUserSlug({ id: userId, name: userName } as any) : userId;
    return `/users/${slug}`;
};

export const createUserListUrl = (filters?: Record<string, any>): string => {
    const params = new URLSearchParams();

    if (filters) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                params.append(key, String(value));
            }
        });
    }

    const queryString = params.toString();
    return `/users${queryString ? `?${queryString}` : ''}`;
};