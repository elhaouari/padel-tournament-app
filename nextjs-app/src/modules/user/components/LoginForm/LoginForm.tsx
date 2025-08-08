'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import styles from './LoginForm.module.css';

interface LoginFormProps {
    onSuccess?: () => void;
    onSwitchToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({
                                                        onSuccess,
                                                        onSwitchToRegister
                                                    }) => {
    const { login, loading, error } = useAuth();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Please enter a valid email';
        }

        if (!formData.password) {
            errors.password = 'Password is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const result = await login(formData.email, formData.password);
        if (result.success) {
            onSuccess?.();
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Welcome Back!</h2>
                    <p className={styles.subtitle}>Sign in to your padel account</p>
                </div>

                {error && (
                    <div className={styles.error}>
                        <span className={styles.errorIcon}>⚠️</span>
                        {error}
                    </div>
                )}

                <div className={styles.fields}>
                    <div className={styles.field}>
                        <label htmlFor="email" className={styles.label}>Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
                            placeholder="Enter your email"
                            autoComplete="email"
                        />
                        {validationErrors.email && (
                            <span className={styles.fieldError}>{validationErrors.email}</span>
                        )}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password" className={styles.label}>Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`${styles.input} ${validationErrors.password ? styles.inputError : ''}`}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                        />
                        {validationErrors.password && (
                            <span className={styles.fieldError}>{validationErrors.password}</span>
                        )}
                    </div>
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className={styles.submitButton}
                >
                    {loading ? (
                        <>
                            <div className={styles.loadingSpinner}></div>
                            Signing in...
                        </>
                    ) : (
                        'Sign In'
                    )}
                </button>

                <div className={styles.footer}>
                    <p className={styles.switchText}>
                        Don't have an account?{' '}
                        <button
                            type="button"
                            onClick={onSwitchToRegister}
                            className={styles.switchLink}
                        >
                            Sign up here
                        </button>
                    </p>
                </div>
            </form>
        </div>
    );
};