'use client';

import React, { useState } from 'react';
import { useAuth } from '../../hooks';
import { UserRole, PadelLevel } from '../../types';
import styles from './RegisterForm.module.css';

interface RegisterFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onCancel }) => {
    const { register, loading, error } = useAuth();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        role: UserRole.PLAYER,
        level: PadelLevel.BEGINNER,
        location: '',
        bio: '',
        // Coach fields
        certifications: '',
        hourlyRate: '',
        specialties: ''
    });

    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear validation error when user starts typing
        if (validationErrors[name]) {
            setValidationErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) errors.name = 'Name is required';
        if (!formData.email.trim()) errors.email = 'Email is required';
        if (!formData.password) errors.password = 'Password is required';
        if (formData.password.length < 6) errors.password = 'Password must be at least 6 characters';
        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const userData = {
            name: formData.name,
            email: formData.email,
            password: formData.password,
            phone: formData.phone || undefined,
            role: formData.role,
            level: formData.level,
            location: formData.location || undefined,
            bio: formData.bio || undefined,
            ...(formData.role === UserRole.COACH && {
                certifications: formData.certifications ? formData.certifications.split(',').map(c => c.trim()) : [],
                hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined,
                specialties: formData.specialties ? formData.specialties.split(',').map(s => s.trim()) : []
            })
        };

        const result = await register(userData);
        if (result.success) {
            onSuccess?.();
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <h2 className={styles.title}>Join Our Padel Community</h2>

                {error && <div className={styles.error}>{error}</div>}

                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label htmlFor="name" className={styles.label}>Full Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`${styles.input} ${validationErrors.name ? styles.inputError : ''}`}
                            placeholder="Enter your full name"
                        />
                        {validationErrors.name && <span className={styles.fieldError}>{validationErrors.name}</span>}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="email" className={styles.label}>Email *</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
                            placeholder="Enter your email"
                        />
                        {validationErrors.email && <span className={styles.fieldError}>{validationErrors.email}</span>}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password" className={styles.label}>Password *</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className={`${styles.input} ${validationErrors.password ? styles.inputError : ''}`}
                            placeholder="At least 6 characters"
                        />
                        {validationErrors.password && <span className={styles.fieldError}>{validationErrors.password}</span>}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="confirmPassword" className={styles.label}>Confirm Password *</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`${styles.input} ${validationErrors.confirmPassword ? styles.inputError : ''}`}
                            placeholder="Confirm your password"
                        />
                        {validationErrors.confirmPassword && <span className={styles.fieldError}>{validationErrors.confirmPassword}</span>}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="phone" className={styles.label}>Phone</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="Your phone number"
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="role" className={styles.label}>I am a *</label>
                        <select
                            id="role"
                            name="role"
                            value={formData.role}
                            onChange={handleChange}
                            className={styles.select}
                        >
                            <option value={UserRole.PLAYER}>Player</option>
                            <option value={UserRole.COACH}>Coach</option>
                        </select>
                    </div>

                    {formData.role === UserRole.PLAYER && (
                        <div className={styles.field}>
                            <label htmlFor="level" className={styles.label}>Skill Level</label>
                            <select
                                id="level"
                                name="level"
                                value={formData.level}
                                onChange={handleChange}
                                className={styles.select}
                            >
                                <option value={PadelLevel.BEGINNER}>Beginner</option>
                                <option value={PadelLevel.INTERMEDIATE}>Intermediate</option>
                                <option value={PadelLevel.ADVANCED}>Advanced</option>
                                <option value={PadelLevel.PROFESSIONAL}>Professional</option>
                            </select>
                        </div>
                    )}

                    <div className={styles.field}>
                        <label htmlFor="location" className={styles.label}>Location</label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            className={styles.input}
                            placeholder="City, Country"
                        />
                    </div>
                </div>

                {formData.role === UserRole.COACH && (
                    <div className={styles.coachSection}>
                        <h3 className={styles.sectionTitle}>Coach Information</h3>
                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label htmlFor="hourlyRate" className={styles.label}>Hourly Rate (€)</label>
                                <input
                                    type="number"
                                    id="hourlyRate"
                                    name="hourlyRate"
                                    value={formData.hourlyRate}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="50"
                                    min="0"
                                    step="0.01"
                                />
                            </div>
                            <div className={styles.field}>
                                <label htmlFor="certifications" className={styles.label}>Certifications</label>
                                <input
                                    type="text"
                                    id="certifications"
                                    name="certifications"
                                    value={formData.certifications}
                                    onChange={handleChange}
                                    className={styles.input}
                                    placeholder="FEP Level 2, PTR Certified (comma separated)"
                                />
                            </div>
                        </div>
                        <div className={styles.field}>
                            <label htmlFor="specialties" className={styles.label}>Specialties</label>
                            <input
                                type="text"
                                id="specialties"
                                name="specialties"
                                value={formData.specialties}
                                onChange={handleChange}
                                className={styles.input}
                                placeholder="Beginner Training, Advanced Strategy (comma separated)"
                            />
                        </div>
                    </div>
                )}

                <div className={styles.field}>
                    <label htmlFor="bio" className={styles.label}>Bio</label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio}
                        onChange={handleChange}
                        className={styles.textarea}
                        placeholder="Tell us about yourself and your padel journey..."
                        rows={4}
                    />
                </div>

                <div className={styles.actions}>
                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            className={styles.cancelButton}
                            disabled={loading}
                        >
                            Cancel
                        </button>
                    )}
                    <button
                        type="submit"
                        disabled={loading}
                        className={styles.submitButton}
                    >
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>
                </div>
            </form>
        </div>
    );
};