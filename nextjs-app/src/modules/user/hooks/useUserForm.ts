import { useState, useCallback } from 'react';
import { User, UpdateUserRequest, UserRole, PadelLevel } from '../types';
import { validateEmail, validateName, validatePhone } from '../utils';

interface UseUserFormProps {
    initialUser?: User;
    onSubmit: (data: UpdateUserRequest) => Promise<void>;
}

export const useUserForm = ({ initialUser, onSubmit }: UseUserFormProps) => {
    const [formData, setFormData] = useState({
        name: initialUser?.name || '',
        phone: initialUser?.phone || '',
        bio: initialUser?.bio || '',
        level: initialUser?.level || PadelLevel.BEGINNER,
        location: initialUser?.location || '',
        // Coach specific
        certifications: initialUser?.certifications?.join(', ') || '',
        hourlyRate: initialUser?.hourlyRate?.toString() || '',
        specialties: initialUser?.specialties?.join(', ') || ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);
    const [isDirty, setIsDirty] = useState(false);

    const validateForm = useCallback(() => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (!validateName(formData.name)) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (formData.phone && !validatePhone(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number';
        }

        if (initialUser?.role === UserRole.COACH) {
            if (formData.hourlyRate && (isNaN(Number(formData.hourlyRate)) || Number(formData.hourlyRate) <= 0)) {
                newErrors.hourlyRate = 'Please enter a valid hourly rate';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData, initialUser?.role]);

    const handleChange = useCallback((field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setIsDirty(true);

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    }, [errors]);

    const handleSubmit = useCallback(async () => {
        if (!validateForm()) {
            return { success: false, errors };
        }

        setLoading(true);
        try {
            const updateData: UpdateUserRequest = {
                name: formData.name.trim(),
                phone: formData.phone.trim() || undefined,
                bio: formData.bio.trim() || undefined,
                level: formData.level,
                location: formData.location.trim() || undefined,
            };

            // Add coach-specific fields
            if (initialUser?.role === UserRole.COACH) {
                updateData.certifications = formData.certifications
                    ? formData.certifications.split(',').map(c => c.trim()).filter(c => c.length > 0)
                    : [];
                updateData.hourlyRate = formData.hourlyRate ? parseFloat(formData.hourlyRate) : undefined;
                updateData.specialties = formData.specialties
                    ? formData.specialties.split(',').map(s => s.trim()).filter(s => s.length > 0)
                    : [];
            }

            await onSubmit(updateData);
            setIsDirty(false);
            return { success: true };
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update profile';
            return { success: false, error: errorMessage };
        } finally {
            setLoading(false);
        }
    }, [formData, initialUser?.role, validateForm, errors, onSubmit]);

    const reset = useCallback(() => {
        setFormData({
            name: initialUser?.name || '',
            phone: initialUser?.phone || '',
            bio: initialUser?.bio || '',
            level: initialUser?.level || PadelLevel.BEGINNER,
            location: initialUser?.location || '',
            certifications: initialUser?.certifications?.join(', ') || '',
            hourlyRate: initialUser?.hourlyRate?.toString() || '',
            specialties: initialUser?.specialties?.join(', ') || ''
        });
        setErrors({});
        setIsDirty(false);
    }, [initialUser]);

    const clearErrors = useCallback(() => {
        setErrors({});
    }, []);

    return {
        formData,
        errors,
        loading,
        isDirty,
        handleChange,
        handleSubmit,
        reset,
        clearErrors,
        validateForm
    };
};