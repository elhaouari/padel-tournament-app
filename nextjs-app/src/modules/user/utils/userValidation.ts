import { UserRole, PadelLevel, CreateUserRequest, UpdateUserRequest } from '../types';

// Basic validation functions
export const validateEmail = (email: string): boolean => {
    if (!email || typeof email !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

export const validateName = (name: string): boolean => {
    if (!name || typeof name !== 'string') return false;
    const trimmedName = name.trim();
    return trimmedName.length >= 2 && trimmedName.length <= 100;
};

export const validatePhone = (phone: string): boolean => {
    if (!phone || typeof phone !== 'string') return false;
    // Remove all non-digit characters except + at the start
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    // Check if it's a valid international format
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(cleanPhone);
};

export const validatePassword = (password: string): boolean => {
    if (!password || typeof password !== 'string') return false;
    return password.length >= 6;
};

export const validateHourlyRate = (rate: number): boolean => {
    return typeof rate === 'number' && rate > 0 && rate <= 10000;
};

export const validateBio = (bio: string): boolean => {
    if (!bio) return true; // Bio is optional
    return bio.length <= 500;
};

export const validateLocation = (location: string): boolean => {
    if (!location) return true; // Location is optional
    return location.trim().length <= 100;
};

// Comprehensive validation functions
export interface ValidationResult {
    isValid: boolean;
    errors: Record<string, string>;
}

export const validateUserRegistration = (userData: CreateUserRequest): ValidationResult => {
    const errors: Record<string, string> = {};

    // Required fields
    if (!validateName(userData.name)) {
        errors.name = 'Name must be between 2 and 100 characters';
    }

    if (!validateEmail(userData.email)) {
        errors.email = 'Please enter a valid email address';
    }

    if (!validatePassword(userData.password)) {
        errors.password = 'Password must be at least 6 characters long';
    }

    // Optional fields
    if (userData.phone && !validatePhone(userData.phone)) {
        errors.phone = 'Please enter a valid phone number';
    }

    if (userData.bio && !validateBio(userData.bio)) {
        errors.bio = 'Bio must be 500 characters or less';
    }

    if (userData.location && !validateLocation(userData.location)) {
        errors.location = 'Location must be 100 characters or less';
    }

    // Role-specific validation
    if (userData.role === UserRole.COACH) {
        if (userData.hourlyRate && !validateHourlyRate(userData.hourlyRate)) {
            errors.hourlyRate = 'Hourly rate must be between 1 and 10,000';
        }

        if (userData.certifications) {
            const invalidCerts = userData.certifications.filter(cert =>
                !cert || cert.trim().length === 0 || cert.length > 100
            );
            if (invalidCerts.length > 0) {
                errors.certifications = 'Each certification must be between 1 and 100 characters';
            }
        }

        if (userData.specialties) {
            const invalidSpecialties = userData.specialties.filter(specialty =>
                !specialty || specialty.trim().length === 0 || specialty.length > 100
            );
            if (invalidSpecialties.length > 0) {
                errors.specialties = 'Each specialty must be between 1 and 100 characters';
            }
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

export const validateUserUpdate = (userData: UpdateUserRequest): ValidationResult => {
    const errors: Record<string, string> = {};

    // Only validate fields that are provided
    if (userData.name !== undefined && !validateName(userData.name)) {
        errors.name = 'Name must be between 2 and 100 characters';
    }

    if (userData.phone !== undefined && userData.phone !== null && !validatePhone(userData.phone)) {
        errors.phone = 'Please enter a valid phone number';
    }

    if (userData.bio !== undefined && userData.bio !== null && !validateBio(userData.bio)) {
        errors.bio = 'Bio must be 500 characters or less';
    }

    if (userData.location !== undefined && userData.location !== null && !validateLocation(userData.location)) {
        errors.location = 'Location must be 100 characters or less';
    }

    if (userData.hourlyRate !== undefined && userData.hourlyRate !== null && !validateHourlyRate(userData.hourlyRate)) {
        errors.hourlyRate = 'Hourly rate must be between 1 and 10,000';
    }

    if (userData.certifications) {
        const invalidCerts = userData.certifications.filter(cert =>
            !cert || cert.trim().length === 0 || cert.length > 100
        );
        if (invalidCerts.length > 0) {
            errors.certifications = 'Each certification must be between 1 and 100 characters';
        }
    }

    if (userData.specialties) {
        const invalidSpecialties = userData.specialties.filter(specialty =>
            !specialty || specialty.trim().length === 0 || specialty.length > 100
        );
        if (invalidSpecialties.length > 0) {
            errors.specialties = 'Each specialty must be between 1 and 100 characters';
        }
    }

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};

// Password strength validation
export interface PasswordStrength {
    score: number; // 0-100
    feedback: string[];
    requirements: {
        minLength: boolean;
        hasUppercase: boolean;
        hasLowercase: boolean;
        hasNumbers: boolean;
        hasSpecialChars: boolean;
    };
}

export const validatePasswordStrength = (password: string): PasswordStrength => {
    const feedback: string[] = [];
    const requirements = {
        minLength: password.length >= 8,
        hasUppercase: /[A-Z]/.test(password),
        hasLowercase: /[a-z]/.test(password),
        hasNumbers: /\d/.test(password),
        hasSpecialChars: /[!@#$%^&*(),.?":{}|<>]/.test(password)
    };

    let score = 0;

    // Length check
    if (requirements.minLength) {
        score += 20;
    } else {
        feedback.push('Password should be at least 8 characters long');
    }

    // Character type checks
    if (requirements.hasUppercase) score += 15;
    else feedback.push('Add uppercase letters');

    if (requirements.hasLowercase) score += 15;
    else feedback.push('Add lowercase letters');

    if (requirements.hasNumbers) score += 15;
    else feedback.push('Add numbers');

    if (requirements.hasSpecialChars) score += 15;
    else feedback.push('Add special characters (!@#$%^&*)');

    // Bonus points for longer passwords
    if (password.length >= 12) score += 10;
    if (password.length >= 16) score += 10;

    // Penalty for common patterns
    if (/123456|password|qwerty|abc123/i.test(password)) {
        score -= 20;
        feedback.push('Avoid common patterns like "123456" or "password"');
    }

    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));

    return { score, feedback, requirements };
};

// Form field validation
export const validateFormField = (fieldName: string, value: any, required = false): string | null => {
    // Check if required field is empty
    if (required && (!value || (typeof value === 'string' && value.trim() === ''))) {
        return `${fieldName} is required`;
    }

    // If field is empty and not required, it's valid
    if (!value || (typeof value === 'string' && value.trim() === '')) {
        return null;
    }

    // Field-specific validation
    switch (fieldName.toLowerCase()) {
        case 'email':
            return validateEmail(value) ? null : 'Please enter a valid email address';

        case 'name':
            return validateName(value) ? null : 'Name must be between 2 and 100 characters';

        case 'phone':
            return validatePhone(value) ? null : 'Please enter a valid phone number';

        case 'password':
            return validatePassword(value) ? null : 'Password must be at least 6 characters long';

        case 'bio':
            return validateBio(value) ? null : 'Bio must be 500 characters or less';

        case 'location':
            return validateLocation(value) ? null : 'Location must be 100 characters or less';

        case 'hourlyrate':
            return validateHourlyRate(parseFloat(value)) ? null : 'Hourly rate must be between 1 and 10,000';

        default:
            return null;
    }
};

// Batch validation for forms
export const validateFormData = (
    data: Record<string, any>,
    requiredFields: string[] = []
): ValidationResult => {
    const errors: Record<string, string> = {};

    Object.entries(data).forEach(([fieldName, value]) => {
        const isRequired = requiredFields.includes(fieldName);
        const error = validateFormField(fieldName, value, isRequired);
        if (error) {
            errors[fieldName] = error;
        }
    });

    return {
        isValid: Object.keys(errors).length === 0,
        errors
    };
};