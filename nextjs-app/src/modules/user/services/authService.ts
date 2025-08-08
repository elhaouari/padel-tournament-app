import { supabase } from '../lib/supabase';
import { CreateUserRequest } from '../types';
import bcrypt from 'bcryptjs';

export interface AuthResponse {
    user: any;
    session: any;
    error?: string;
}

export class AuthService {
    async register(userData: CreateUserRequest): Promise<AuthResponse> {
        try {
            // Register with Supabase Auth
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        name: userData.name,
                        role: userData.role
                    }
                }
            });

            if (authError) {
                return { user: null, session: null, error: authError.message };
            }

            return {
                user: authData.user,
                session: authData.session
            };
        } catch (error) {
            return {
                user: null,
                session: null,
                error: error instanceof Error ? error.message : 'Registration failed'
            };
        }
    }

    async login(email: string, password: string): Promise<AuthResponse> {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) {
                return { user: null, session: null, error: error.message };
            }

            return {
                user: data.user,
                session: data.session
            };
        } catch (error) {
            return {
                user: null,
                session: null,
                error: error instanceof Error ? error.message : 'Login failed'
            };
        }
    }

    async logout(): Promise<{ error?: string }> {
        try {
            const { error } = await supabase.auth.signOut();
            return { error: error?.message };
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : 'Logout failed'
            };
        }
    }

    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            return { user, error: error?.message };
        } catch (error) {
            return {
                user: null,
                error: error instanceof Error ? error.message : 'Failed to get user'
            };
        }
    }

    async updatePassword(newPassword: string): Promise<{ error?: string }> {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword
            });
            return { error: error?.message };
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : 'Password update failed'
            };
        }
    }
}