import { AuthResponse, AuthError, SignUpRequest, SignInRequest, Session, AuthUser } from '../types';

// Authentication service interface
export interface IAuthService {
    // Authentication methods
    signUp(request: SignUpRequest): Promise<AuthResponse>;
    signIn(request: SignInRequest): Promise<AuthResponse>;
    signOut(): Promise<{ error?: AuthError }>;

    // Session management
    getSession(): Promise<{ data: { session: Session | null }; error?: AuthError }>;
    refreshSession(): Promise<AuthResponse>;

    // User management
    getUser(): Promise<{ data: { user: AuthUser | null }; error?: AuthError }>;
    updateUser(updates: { email?: string; password?: string; data?: Record<string, any> }): Promise<AuthResponse>;

    // Password management
    resetPassword(email: string, redirectTo?: string): Promise<{ error?: AuthError }>;
    updatePassword(password: string): Promise<{ error?: AuthError }>;

    // Email verification
    resendVerification(email: string): Promise<{ error?: AuthError }>;
    verifyEmail(token: string): Promise<{ error?: AuthError }>;

    // OAuth methods (for future implementation)
    signInWithOAuth(provider: string, options?: any): Promise<{ data: { url: string }; error?: AuthError }>;

    // Utility methods
    onAuthStateChange(callback: (event: string, session: Session | null) => void): { data: { subscription: any } };
}

// Supabase implementation
export class SupabaseAuthService implements IAuthService {
    constructor(private supabaseClient: any) {} // Supabase client will be injected

    async signUp(request: SignUpRequest): Promise<AuthResponse> {
        try {
            const { data, error } = await this.supabaseClient.auth.signUp({
                email: request.email,
                password: request.password,
                options: {
                    data: request.options?.data || {},
                    ...(request.options?.redirectTo && { redirectTo: request.options.redirectTo }),
                    ...(request.options?.captchaToken && { captchaToken: request.options.captchaToken })
                }
            });

            if (error) {
                return {
                    user: null,
                    session: null,
                    error: this.transformError(error)
                };
            }

            return {
                user: data.user,
                session: data.session,
                error: undefined
            };
        } catch (error) {
            return {
                user: null,
                session: null,
                error: this.handleUnexpectedError(error)
            };
        }
    }

    async signIn(request: SignInRequest): Promise<AuthResponse> {
        try {
            const { data, error } = await this.supabaseClient.auth.signInWithPassword({
                email: request.email,
                password: request.password,
                options: request.options
            });

            if (error) {
                return {
                    user: null,
                    session: null,
                    error: this.transformError(error)
                };
            }

            return {
                user: data.user,
                session: data.session,
                error: undefined
            };
        } catch (error) {
            return {
                user: null,
                session: null,
                error: this.handleUnexpectedError(error)
            };
        }
    }

    async signOut(): Promise<{ error?: AuthError }> {
        try {
            const { error } = await this.supabaseClient.auth.signOut();

            if (error) {
                return { error: this.transformError(error) };
            }

            return {};
        } catch (error) {
            return { error: this.handleUnexpectedError(error) };
        }
    }

    async getSession(): Promise<{ data: { session: Session | null }; error?: AuthError }> {
        try {
            const { data, error } = await this.supabaseClient.auth.getSession();

            if (error) {
                return {
                    data: { session: null },
                    error: this.transformError(error)
                };
            }

            return { data: { session: data.session } };
        } catch (error) {
            return {
                data: { session: null },
                error: this.handleUnexpectedError(error)
            };
        }
    }

    async refreshSession(): Promise<AuthResponse> {
        try {
            const { data, error } = await this.supabaseClient.auth.refreshSession();

            if (error) {
                return {
                    user: null,
                    session: null,
                    error: this.transformError(error)
                };
            }

            return {
                user: data.user,
                session: data.session,
                error: undefined
            };
        } catch (error) {
            return {
                user: null,
                session: null,
                error: this.handleUnexpectedError(error)
            };
        }
    }

    async getUser(): Promise<{ data: { user: AuthUser | null }; error?: AuthError }> {
        try {
            const { data, error } = await this.supabaseClient.auth.getUser();

            if (error) {
                return {
                    data: { user: null },
                    error: this.transformError(error)
                };
            }

            return { data: { user: data.user } };
        } catch (error) {
            return {
                data: { user: null },
                error: this.handleUnexpectedError(error)
            };
        }
    }

    async updateUser(updates: {
        email?: string;
        password?: string;
        data?: Record<string, any>
    }): Promise<AuthResponse> {
        try {
            const { data, error } = await this.supabaseClient.auth.updateUser(updates);

            if (error) {
                return {
                    user: null,
                    session: null,
                    error: this.transformError(error)
                };
            }

            return {
                user: data.user,
                session: data.session,
                error: undefined
            };
        } catch (error) {
            return {
                user: null,
                session: null,
                error: this.handleUnexpectedError(error)
            };
        }
    }

    async resetPassword(email: string, redirectTo?: string): Promise<{ error?: AuthError }> {
        try {
            const { error } = await this.supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: redirectTo || `${window.location.origin}/auth/reset-password`
            });

            if (error) {
                return { error: this.transformError(error) };
            }

            return {};
        } catch (error) {
            return { error: this.handleUnexpectedError(error) };
        }
    }

    async updatePassword(password: string): Promise<{ error?: AuthError }> {
        try {
            const { error } = await this.supabaseClient.auth.updateUser({
                password: password
            });

            if (error) {
                return { error: this.transformError(error) };
            }

            return {};
        } catch (error) {
            return { error: this.handleUnexpectedError(error) };
        }
    }

    async resendVerification(email: string): Promise<{ error?: AuthError }> {
        try {
            const { error } = await this.supabaseClient.auth.resend({
                type: 'signup',
                email: email
            });

            if (error) {
                return { error: this.transformError(error) };
            }

            return {};
        } catch (error) {
            return { error: this.handleUnexpectedError(error) };
        }
    }

    async verifyEmail(token: string): Promise<{ error?: AuthError }> {
        try {
            const { error } = await this.supabaseClient.auth.verifyOtp({
                token_hash: token,
                type: 'email'
            });

            if (error) {
                return { error: this.transformError(error) };
            }

            return {};
        } catch (error) {
            return { error: this.handleUnexpectedError(error) };
        }
    }

    async signInWithOAuth(
        provider: string,
        options: any = {}
    ): Promise<{ data: { url: string }; error?: AuthError }> {
        try {
            const { data, error } = await this.supabaseClient.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: options.redirectTo || `${window.location.origin}/auth/callback`,
                    scopes: options.scopes,
                    queryParams: options.queryParams
                }
            });

            if (error) {
                return {
                    data: { url: '' },
                    error: this.transformError(error)
                };
            }

            return { data: { url: data.url } };
        } catch (error) {
            return {
                data: { url: '' },
                error: this.handleUnexpectedError(error)
            };
        }
    }

    onAuthStateChange(callback: (event: string, session: Session | null) => void): {
        data: { subscription: any }
    } {
        const { data } = this.supabaseClient.auth.onAuthStateChange(callback);
        return { data };
    }

    // Private helper methods
    private transformError(error: any): AuthError {
        // Map Supabase errors to our error format
        const errorMap: Record<string, string> = {
            'invalid_credentials': 'Invalid email or password',
            'email_not_confirmed': 'Please verify your email address before signing in',
            'signup_disabled': 'Registration is currently disabled',
            'email_address_invalid': 'Please enter a valid email address',
            'password_too_weak': 'Password is too weak. Please choose a stronger password',
            'user_already_exists': 'An account with this email already exists',
            'session_not_found': 'Session not found. Please sign in again',
            'token_expired': 'Token has expired. Please request a new one',
            'rate_limit_exceeded': 'Too many requests. Please try again later'
        };

        const message = errorMap[error.message] || error.message || 'An authentication error occurred';

        return {
            message,
            status: error.status,
            code: error.error_code || error.code
        };
    }

    private handleUnexpectedError(error: any): AuthError {
        console.error('Unexpected auth error:', error);

        return {
            message: 'An unexpected error occurred. Please try again.',
            status: 500,
            code: 'unexpected_error'
        };
    }
}

// Mock implementation for testing
export class MockAuthService implements IAuthService {
    private currentSession: Session | null = null;
    private currentUser: AuthUser | null = null;
    private users: Map<string, { email: string; password: string; data: any }> = new Map();

    async signUp(request: SignUpRequest): Promise<AuthResponse> {
        // Simulate network delay
        await this.delay(500);

        // Check if user already exists
        if (this.users.has(request.email)) {
            return {
                user: null,
                session: null,
                error: {
                    message: 'User already exists',
                    code: 'user_already_exists'
                }
            };
        }

        // Create mock user
        const userId = `user_${Date.now()}`;
        const user: AuthUser = {
            id: userId,
            email: request.email,
            email_confirmed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            user_metadata: request.options?.data || {},
            app_metadata: {}
        };

        const session: Session = {
            access_token: `access_token_${Date.now()}`,
            refresh_token: `refresh_token_${Date.now()}`,
            expires_at: Date.now() + 3600000, // 1 hour
            expires_in: 3600,
            token_type: 'bearer',
            user
        };

        // Store user credentials
        this.users.set(request.email, {
            email: request.email,
            password: request.password,
            data: request.options?.data || {}
        });

        this.currentUser = user;
        this.currentSession = session;

        return {
            user,
            session,
            error: undefined
        };
    }

    async signIn(request: SignInRequest): Promise<AuthResponse> {
        await this.delay(500);

        const storedUser = this.users.get(request.email);

        if (!storedUser || storedUser.password !== request.password) {
            return {
                user: null,
                session: null,
                error: {
                    message: 'Invalid credentials',
                    code: 'invalid_credentials'
                }
            };
        }

        const user: AuthUser = {
            id: `user_${request.email.replace('@', '_').replace('.', '_')}`,
            email: request.email,
            email_confirmed_at: new Date().toISOString(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            last_sign_in_at: new Date().toISOString(),
            user_metadata: storedUser.data,
            app_metadata: {}
        };

        const session: Session = {
            access_token: `access_token_${Date.now()}`,
            refresh_token: `refresh_token_${Date.now()}`,
            expires_at: Date.now() + 3600000,
            expires_in: 3600,
            token_type: 'bearer',
            user
        };

        this.currentUser = user;
        this.currentSession = session;

        return {
            user,
            session,
            error: undefined
        };
    }

    async signOut(): Promise<{ error?: AuthError }> {
        await this.delay(200);

        this.currentUser = null;
        this.currentSession = null;

        return {};
    }

    async getSession(): Promise<{ data: { session: Session | null }; error?: AuthError }> {
        await this.delay(100);

        return {
            data: { session: this.currentSession }
        };
    }

    async refreshSession(): Promise<AuthResponse> {
        await this.delay(300);

        if (!this.currentSession) {
            return {
                user: null,
                session: null,
                error: {
                    message: 'No session to refresh',
                    code: 'session_not_found'
                }
            };
        }

        // Create new session with updated tokens
        const session: Session = {
            ...this.currentSession,
            access_token: `access_token_${Date.now()}`,
            refresh_token: `refresh_token_${Date.now()}`,
            expires_at: Date.now() + 3600000
        };

        this.currentSession = session;

        return {
            user: this.currentUser,
            session,
            error: undefined
        };
    }

    async getUser(): Promise<{ data: { user: AuthUser | null }; error?: AuthError }> {
        await this.delay(100);

        return {
            data: { user: this.currentUser }
        };
    }

    async updateUser(updates: {
        email?: string;
        password?: string;
        data?: Record<string, any>
    }): Promise<AuthResponse> {
        await this.delay(400);

        if (!this.currentUser) {
            return {
                user: null,
                session: null,
                error: {
                    message: 'Not authenticated',
                    code: 'not_authenticated'
                }
            };
        }

        // Update user data
        if (updates.email) {
            this.currentUser.email = updates.email;
        }

        if (updates.data) {
            this.currentUser.user_metadata = {
                ...this.currentUser.user_metadata,
                ...updates.data
            };
        }

        this.currentUser.updated_at = new Date().toISOString();

        return {
            user: this.currentUser,
            session: this.currentSession,
            error: undefined
        };
    }

    async resetPassword(email: string, redirectTo?: string): Promise<{ error?: AuthError }> {
        await this.delay(500);

        if (!this.users.has(email)) {
            // Don't reveal if user exists for security
            return {};
        }

        // In a real implementation, this would send an email
        console.log(`Mock: Password reset email sent to ${email}`);

        return {};
    }

    async updatePassword(password: string): Promise<{ error?: AuthError }> {
        await this.delay(300);

        if (!this.currentUser) {
            return {
                error: {
                    message: 'Not authenticated',
                    code: 'not_authenticated'
                }
            };
        }

        // Update stored password
        const storedUser = this.users.get(this.currentUser.email);
        if (storedUser) {
            storedUser.password = password;
        }

        return {};
    }

    async resendVerification(email: string): Promise<{ error?: AuthError }> {
        await this.delay(400);

        console.log(`Mock: Verification email resent to ${email}`);

        return {};
    }

    async verifyEmail(token: string): Promise<{ error?: AuthError }> {
        await this.delay(300);

        console.log(`Mock: Email verified with token ${token}`);

        return {};
    }

    async signInWithOAuth(
        provider: string,
        options: any = {}
    ): Promise<{ data: { url: string }; error?: AuthError }> {
        await this.delay(200);

        // Mock OAuth URL
        const mockUrl = `https://mock-oauth.com/${provider}?redirect_to=${options.redirectTo || '/auth/callback'}`;

        return {
            data: { url: mockUrl }
        };
    }

    onAuthStateChange(callback: (event: string, session: Session | null) => void): {
        data: { subscription: any }
    } {
        // Mock subscription
        const subscription = {
            unsubscribe: () => {
                console.log('Mock: Auth state change subscription unsubscribed');
            }
        };

        // Simulate initial auth state
        setTimeout(() => {
            callback('SIGNED_IN', this.currentSession);
        }, 100);

        return { data: { subscription } };
    }

    // Helper method for simulating network delay
    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Test helper methods
    setCurrentUser(user: AuthUser | null): void {
        this.currentUser = user;
    }

    setCurrentSession(session: Session | null): void {
        this.currentSession = session;
    }

    getStoredUsers(): Map<string, { email: string; password: string; data: any }> {
        return this.users;
    }

    clearUsers(): void {
        this.users.clear();
        this.currentUser = null;
        this.currentSession = null;
    }
}

// Factory function to create auth service based on environment
export const createAuthService = (supabaseClient?: any): IAuthService => {
    if (process.env.NODE_ENV === 'test' || !supabaseClient) {
        return new MockAuthService();
    }

    return new SupabaseAuthService(supabaseClient);
};