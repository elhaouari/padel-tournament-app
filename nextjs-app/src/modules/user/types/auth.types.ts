// Authentication and Authorization Types

import { User } from './user.types';

// Session Types
export interface Session {
    access_token: string;
    refresh_token: string;
    expires_at: number;
    expires_in: number;
    token_type: string;
    user: AuthUser;
}

export interface AuthUser {
    id: string;
    email: string;
    email_confirmed_at?: string;
    phone?: string;
    phone_confirmed_at?: string;
    created_at: string;
    updated_at: string;
    last_sign_in_at?: string;
    user_metadata: Record<string, any>;
    app_metadata: Record<string, any>;
}

// Authentication Request Types
export interface SignUpRequest {
    email: string;
    password: string;
    options?: {
        data?: Record<string, any>;
        redirectTo?: string;
        captchaToken?: string;
    };
}

export interface SignInRequest {
    email: string;
    password: string;
    options?: {
        redirectTo?: string;
        captchaToken?: string;
    };
}

export interface SignInWithOAuthRequest {
    provider: 'google' | 'facebook' | 'apple' | 'github';
    options?: {
        redirectTo?: string;
        scopes?: string;
        queryParams?: Record<string, string>;
    };
}

export interface ResetPasswordRequest {
    email: string;
    redirectTo?: string;
    captchaToken?: string;
}

export interface UpdatePasswordRequest {
    password: string;
}

export interface UpdateUserRequest {
    email?: string;
    password?: string;
    phone?: string;
    data?: Record<string, any>;
}

// Authentication Response Types
export interface AuthResponse {
    user: AuthUser | null;
    session: Session | null;
    error?: AuthError;
}

export interface AuthError {
    message: string;
    status?: number;
    code?: string;
}

// Authentication State Types
export interface AuthState {
    user: User | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    isEmailConfirmed: boolean;
    isPhoneConfirmed: boolean;
}

// Token Types
export interface AccessToken {
    token: string;
    expires_at: number;
    token_type: 'bearer';
}

export interface RefreshToken {
    token: string;
    expires_at: number;
}

export interface TokenPair {
    access_token: AccessToken;
    refresh_token: RefreshToken;
}

// JWT Payload Types
export interface JWTPayload {
    sub: string; // subject (user ID)
    email: string;
    aud: string; // audience
    exp: number; // expiration time
    iat: number; // issued at
    iss: string; // issuer
    role?: string;
    user_metadata?: Record<string, any>;
    app_metadata?: Record<string, any>;
}

// OAuth Types
export interface OAuthProvider {
    name: string;
    clientId: string;
    redirectUri: string;
    scope: string[];
    authorizeUrl: string;
    tokenUrl: string;
}

export interface OAuthState {
    provider: string;
    redirectTo?: string;
    nonce: string;
    timestamp: number;
}

export interface OAuthCallback {
    code: string;
    state: string;
    error?: string;
    error_description?: string;
}

// Multi-Factor Authentication Types
export interface MFAChallenge {
    challenge_id: string;
    challenge_type: 'totp' | 'sms' | 'email';
    expires_at: number;
}

export interface MFAVerifyRequest {
    challenge_id: string;
    code: string;
}

export interface MFAEnrollRequest {
    type: 'totp' | 'phone';
    friendly_name?: string;
}

export interface MFAFactor {
    id: string;
    type: 'totp' | 'phone';
    friendly_name: string;
    status: 'verified' | 'unverified';
    created_at: string;
    updated_at: string;
}

// Permission and Role Types
export interface Permission {
    id: string;
    resource: string;
    action: string;
    description: string;
}

export interface Role {
    id: string;
    name: string;
    description: string;
    permissions: Permission[];
    created_at: string;
    updated_at: string;
}

// Rename UserRole interface to UserRoleAssignment to avoid conflict with enum
export interface UserRoleAssignment {
    user_id: string;
    role_id: string;
    assigned_at: string;
    assigned_by: string;
}

// Authorization Types
export interface AuthorizationContext {
    user: User;
    roles: Role[];
    permissions: Permission[];
    session: Session;
}

export interface ResourceAccess {
    resource: string;
    actions: string[];
    conditions?: Record<string, any>;
}

// Security Types
export interface SecurityEvent {
    id: string;
    user_id: string;
    event_type: 'login' | 'logout' | 'password_change' | 'mfa_enable' | 'mfa_disable' | 'suspicious_activity';
    ip_address: string;
    user_agent: string;
    location?: {
        country: string;
        region: string;
        city: string;
    };
    metadata?: Record<string, any>;
    created_at: string;
}

export interface LoginAttempt {
    id: string;
    email: string;
    ip_address: string;
    user_agent: string;
    success: boolean;
    failure_reason?: string;
    created_at: string;
}

// Password Policy Types
export interface PasswordPolicy {
    min_length: number;
    require_uppercase: boolean;
    require_lowercase: boolean;
    require_numbers: boolean;
    require_special_chars: boolean;
    disallow_common_passwords: boolean;
    password_history_count: number;
    max_age_days?: number;
}

export interface PasswordValidation {
    is_valid: boolean;
    strength_score: number; // 0-100
    feedback: string[];
    requirements_met: {
        min_length: boolean;
        has_uppercase: boolean;
        has_lowercase: boolean;
        has_numbers: boolean;
        has_special_chars: boolean;
        not_common: boolean;
    };
}

// Session Management Types
export interface SessionConfig {
    timeout_minutes: number;
    refresh_threshold_minutes: number;
    concurrent_sessions_limit: number;
    remember_me_duration_days: number;
}

export interface ActiveSession {
    id: string;
    user_id: string;
    created_at: string;
    last_activity: string;
    ip_address: string;
    user_agent: string;
    is_current: boolean;
}

// Auth Provider Configuration
export interface AuthConfig {
    supabase: {
        url: string;
        anonKey: string;
        serviceRoleKey: string;
    };
    oauth: {
        google?: OAuthProvider;
        facebook?: OAuthProvider;
        github?: OAuthProvider;
        apple?: OAuthProvider;
    };
    mfa: {
        enabled: boolean;
        required_for_roles: string[];
        totp_issuer: string;
    };
    password_policy: PasswordPolicy;
    session: SessionConfig;
}

// Hook Return Types
export interface UseAuthResult {
    // State
    user: User | null;
    session: Session | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;

    // Actions
    signUp: (request: SignUpRequest) => Promise<AuthResponse>;
    signIn: (request: SignInRequest) => Promise<AuthResponse>;
    signInWithOAuth: (request: SignInWithOAuthRequest) => Promise<void>;
    signOut: () => Promise<{ error?: AuthError }>;
    resetPassword: (request: ResetPasswordRequest) => Promise<{ error?: AuthError }>;
    updateUser: (request: UpdateUserRequest) => Promise<AuthResponse>;
    refreshSession: () => Promise<AuthResponse>;

    // Utilities
    clearError: () => void;
    hasPermission: (resource: string, action: string) => boolean;
    hasRole: (roleName: string) => boolean;
}

// Custom Auth Errors
export class AuthenticationError extends Error {
    constructor(
        message: string,
        public code?: string,
        public status?: number
    ) {
        super(message);
        this.name = 'AuthenticationError';
    }
}

export class AuthorizationError extends Error {
    constructor(
        message: string,
        public resource?: string,
        public action?: string
    ) {
        super(message);
        this.name = 'AuthorizationError';
    }
}

export class SessionExpiredError extends Error {
    constructor(message: string = 'Session has expired') {
        super(message);
        this.name = 'SessionExpiredError';
    }
}