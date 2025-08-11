// Main types export file - exports all type definitions for the user module

// Core User Types
export * from './user.types';

// API Types
export * from './api.types';

// Authentication Types
export * from './auth.types';

// Common Utility Types
export * from './common.types';

// Re-export commonly used types for convenience
import { User, UserRole, CreateUserRequest, UpdateUserRequest, UserFilters, UserListResponse, UserCardProps, UserListProps, UserFilterProps, PaginationProps, UseAuthReturn, UseUsersReturn, UseUserReturn, UseSearchReturn, UserFormData, RegisterFormData, LoginFormData, AuthUser } from './user.types';
import { ApiResponse, PaginatedApiResponse, ApiError } from './api.types';
import { SignInRequest, AuthError } from './auth.types';
import { FormState, ValidationRule, LoadingState, AsyncState, ID, Timestamp, Optional, RequiredFields } from './common.types';
import { RequestStatus } from './user.types';

export type {
    User,
    UserRole,
    CreateUserRequest,
    UpdateUserRequest,
    UserFilters,
    UserListResponse,
    UserCardProps,
    UserListProps,
    UserFilterProps,
    PaginationProps,
    UseAuthReturn,
    UseUsersReturn,
    UseUserReturn,
    UseSearchReturn,
    UserFormData,
    RegisterFormData,
    LoginFormData,
    ApiResponse,
    AuthUser,
} from './user.types';

export type {
    PaginatedApiResponse,
    ApiError,
} from './api.types';

export type {
    SignInRequest,
    AuthError,
} from './auth.types';

export type {
    FormState,
    ValidationRule,
    LoadingState,
    AsyncState,
    ID,
    Timestamp,
    Optional,
    RequiredFields,
} from './common.types';

// Type Guards
export const isUser = (obj: any): obj is User => {
    return obj &&
        typeof obj.id === 'string' &&
        typeof obj.email === 'string' &&
        typeof obj.name === 'string' &&
        typeof obj.role === 'string';
};

export const isPlayer = (user: User): user is User & { level: PadelLevel } => {
    return user.role === UserRole.PLAYER && !!user.level;
};

export const isCoach = (user: User): user is User & { hourlyRate: number; specialties: string[] } => {
    return user.role === UserRole.COACH && !!user.hourlyRate;
};

export const isAuthError = (obj: any): obj is AuthError => {
    return obj && typeof obj.message === 'string';
};

export const isApiError = (obj: any): obj is ApiError => {
    return obj && typeof obj.message === 'string' && typeof obj.status === 'number';
};

// Type Utilities
export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type NonEmptyArray<T> = [T, ...T[]];

export type KeysOfType<T, U> = {
    [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

export type PartialExcept<T, K extends keyof T> = Partial<T> & Pick<T, K>;

export type WithRequired<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Branded Types for better type safety
export type UserId = string & { __brand: 'UserId' };
export type Email = string & { __brand: 'Email' };
export type PhoneNumber = string & { __brand: 'PhoneNumber' };

// Helper functions for branded types
export const createUserId = (id: string): UserId => id as UserId;
export const createEmail = (email: string): Email => email as Email;
export const createPhoneNumber = (phone: string): PhoneNumber => phone as PhoneNumber;

// Enum helpers
export const getUserRoleOptions = () => [
    { value: UserRole.PLAYER, label: 'Player' },
    { value: UserRole.COACH, label: 'Coach' }
];

// If you want to use PadelLevel as a value, define it as an enum in user.types.ts:
// export enum PadelLevel {
//     BEGINNER = 'BEGINNER',
//     INTERMEDIATE = 'INTERMEDIATE',
//     ADVANCED = 'ADVANCED',
//     PROFESSIONAL = 'PROFESSIONAL'
// }

export const PADEL_LEVEL_OPTIONS = [
    { value: 'BEGINNER', label: 'Beginner' },
    { value: 'INTERMEDIATE', label: 'Intermediate' },
    { value: 'ADVANCED', label: 'Advanced' },
    { value: 'PROFESSIONAL', label: 'Professional' }
];

// Validation type predicates
export const isValidEmail = (email: string): email is Email => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): phone is PhoneNumber => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const isValidUserId = (id: string): id is UserId => {
    return typeof id === 'string' && id.length > 0;
};

// Default values
export const DEFAULT_USER_FILTERS: UserFilters = {
    // Provide explicit defaults if needed, otherwise empty object is fine
};

export const DEFAULT_PAGINATION = {
    page: 1,
    limit: 12,
    total: 0
};

export const DEFAULT_FORM_STATE = <T>(initialValues: T): FormState<T> => ({
    values: initialValues,
    errors: {} as Record<keyof T, string>,
    touched: {} as Record<keyof T, boolean>,
    isValid: false,
    isDirty: false,
    isSubmitting: false
});

// Constants
export const USER_ROLES = Object.values(UserRole);
export const REQUEST_STATUSES = Object.values(RequestStatus);