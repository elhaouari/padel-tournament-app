'use client';

import React, { useState, useEffect } from 'react';
import { User, UserRole, PadelLevel, UpdateUserRequest } from '../../types';
import styles from './UserForm.module.css';

interface UserFormProps {
    user: User;
    onSave: (userData: UpdateUserRequest) => Promise<void>;
    onCancel: () => void;
    loading?: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
                                                      user,
                                                      onSave,
                                                      onCancel,
                                                      loading = false
                                                  }) => {
    const [formData, setFormData] = useState({
        name: user.name,
        phone: user.phone || '',
        bio: user.bio || '',
        level: user.level || PadelLevel.BEGINNER,
        location: user.location || '',
        // Coach specific
        certifications: user.certifications?.join(', ') || '',
        hourlyRate: user.hourlyRate?.toString() || '',
        specialties: user.specialties?.join(', ') || ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        const hasFormChanges =
            formData.name !== user.name ||
            formData.phone !== (user.phone || '') ||
            formData.bio !== (user.bio || '') ||
            formData.level !== (user.level || PadelLevel.BEGINNER) ||
            formData.location !== (user.location || '') ||
            (user.role === UserRole.COACH && (
                formData.certifications !== (user.certifications?.join(', ') || '') ||
                formData.hourlyRate !== (user.hourlyRate?.toString() || '') ||
                formData.specialties !== (user.specialties?.join(', ') || '')
            ));

        setHasChanges(hasFormChanges);
    }, [formData, user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));

        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.trim().length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (user.role === UserRole.COACH) {
            if (formData.hourlyRate && (isNaN(Number(formData.hourlyRate)) || Number(formData.hourlyRate) <= 0)) {
                newErrors.hourlyRate = 'Please enter a valid hourly rate';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        const updateData: UpdateUserRequest = {
            name: formData.name.trim(),
            phone: formData.phone.trim() || undefined,
            bio: formData.bio.trim() || undefined,
            level: formData.level,
            location: formData.location.trim() || undefined,
        };

        // Add coach-specific fields
        if (user.role === UserRole.COACH) {
            updateData.certifications = formData.certifications
                ? formData.certifications.split(',').map(c => c.trim()).filter(c => c.length > 0)
                : [];
            updateData.hourlyRate = formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined;
            updateData.specialties = formData.specialties
                ? formData.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0)
                : [];
        }

        try {
            await onSave(updateData);
        } catch (error) {
            console.error('Error saving profile:', error);
        }
    };

    return (
        <div className={styles.container}>
            <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.header}>
                    <h2 className={styles.title}>Edit Profile</h2>
                    <p className={styles.subtitle}>Update your information</p>
                </div>

                <div className={styles.grid}>
                    <div className={styles.field}>
                        <label htmlFor="name" className={styles.label}>Full Name *</label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            className={`${styles.input} ${errors.name ? styles.inputError : ''}`}
                            placeholder="Enter your full name"
                        />
                        {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="phone" className={styles.label}>Phone</label>
                        <input
                            type="tel"
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            className={`${styles.input} ${errors.phone ? styles.inputError : ''}`}
                            placeholder="Your phone number"
                        />
                        {errors.phone && <span className={styles.fieldError}>{errors.phone}</span>}
                    </div>

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

                    {user.role === UserRole.PLAYER && (
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
                </div>

                {user.role === UserRole.COACH && (
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
                                    className={`${styles.input} ${errors.hourlyRate ? styles.inputError : ''}`}
                                    placeholder="50"
                                    min="0"
                                    step="0.01"
                                />
                                {errors.hourlyRate && <span className={styles.fieldError}>{errors.hourlyRate}</span>}
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
                        placeholder="Tell others about yourself and your padel journey..."
                        rows={4}
                    />
                </div>

                <div className={styles.actions}>
                    <button
                        type="button"
                        onClick={onCancel}
                        className={styles.cancelButton}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !hasChanges}
                        className={`${styles.saveButton} ${!hasChanges ? styles.saveButtonDisabled : ''}`}
                    >
                        {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    );
};