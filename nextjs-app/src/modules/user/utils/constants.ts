// Constants and configuration values for the user module

import { UserRole, PadelLevel } from '../types';

// User validation constants
export const USER_VALIDATION = {
    NAME_MIN_LENGTH: 2,
    NAME_MAX_LENGTH: 100,
    PASSWORD_MIN_LENGTH: 6,
    BIO_MAX_LENGTH: 500,
    LOCATION_MAX_LENGTH: 100,
    PHONE_MAX_LENGTH: 20,
    CERTIFICATION_MAX_LENGTH: 100,
    SPECIALTY_MAX_LENGTH: 100,
    HOURLY_RATE_MIN: 1,
    HOURLY_RATE_MAX: 10000
} as const;

// Regular expressions for validation
export const REGEX_PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    PHONE: /^[\+]?[1-9][\d]{0,15}$/,
    PASSWORD_STRONG: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    URL: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/
} as const;

// User role options for forms
export const USER_ROLE_OPTIONS = [
    { value: UserRole.PLAYER, label: 'Player', icon: '🏆', description: 'Play padel matches and improve skills' },
    { value: UserRole.COACH, label: 'Coach', icon: '🎾', description: 'Teach and train padel players' }
] as const;

// Padel level options with detailed descriptions
export const PADEL_LEVEL_OPTIONS = [
    {
        value: PadelLevel.BEGINNER,
        label: 'Beginner',
        icon: '🟢',
        color: '#38a169',
        description: 'New to padel or learning basic techniques'
    },
    {
        value: PadelLevel.INTERMEDIATE,
        label: 'Intermediate',
        icon: '🟡',
        color: '#d69e2e',
        description: 'Comfortable with basics, developing strategy'
    },
    {
        value: PadelLevel.ADVANCED,
        label: 'Advanced',
        icon: '🟠',
        color: '#d53f8c',
        description: 'Strong tactical play and consistent technique'
    },
    {
        value: PadelLevel.PROFESSIONAL,
        label: 'Professional',
        icon: '🔴',
        color: '#805ad5',
        description: 'Competitive tournament level player'
    }
] as const;

// Default pagination settings
export const PAGINATION_DEFAULTS = {
    DEFAULT_PAGE_SIZE: 12,
    MAX_PAGE_SIZE: 100,
    MIN_PAGE_SIZE: 6
} as const;

// Search and filtering constants
export const SEARCH_CONFIG = {
    MIN_SEARCH_LENGTH: 2,
    MAX_SEARCH_LENGTH: 100,
    DEBOUNCE_DELAY: 300,
    MAX_SEARCH_RESULTS: 50
} as const;

// File upload constants
export const FILE_UPLOAD = {
    MAX_AVATAR_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_AVATAR_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
    AVATAR_DIMENSIONS: {
        MAX_WIDTH: 1024,
        MAX_HEIGHT: 1024,
        THUMBNAIL_SIZE: 150
    }
} as const;

// Time and date constants
export const TIME_CONSTANTS = {
    CACHE_DURATION: 5 * 60 * 1000, // 5 minutes
    SESSION_TIMEOUT: 30 * 60 * 1000, // 30 minutes
    ONLINE_THRESHOLD: 15 * 60 * 1000, // 15 minutes
    NOTIFICATION_DELAY: 3000 // 3 seconds
} as const;

// API configuration
export const API_CONFIG = {
    TIMEOUT: 30000, // 30 seconds
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // 1 second
    RATE_LIMIT: {
        REQUESTS: 100,
        WINDOW: 60 * 1000 // 1 minute
    }
} as const;

// Error messages
export const ERROR_MESSAGES = {
    // Network errors
    NETWORK_ERROR: 'Network error. Please check your connection.',
    TIMEOUT_ERROR: 'Request timed out. Please try again.',
    SERVER_ERROR: 'Server error. Please try again later.',

    // Authentication errors
    INVALID_CREDENTIALS: 'Invalid email or password.',
    EMAIL_ALREADY_EXISTS: 'An account with this email already exists.',
    EMAIL_NOT_VERIFIED: 'Please verify your email address.',
    SESSION_EXPIRED: 'Your session has expired. Please log in again.',
    UNAUTHORIZED: 'You are not authorized to perform this action.',

    // Validation errors
    REQUIRED_FIELD: 'This field is required.',
    INVALID_EMAIL: 'Please enter a valid email address.',
    INVALID_PHONE: 'Please enter a valid phone number.',
    PASSWORD_TOO_WEAK: 'Password must be at least 6 characters long.',
    PASSWORDS_DO_NOT_MATCH: 'Passwords do not match.',

    // User errors
    USER_NOT_FOUND: 'User not found.',
    USER_ALREADY_EXISTS: 'User already exists.',
    PROFILE_UPDATE_FAILED: 'Failed to update profile.',

    // Generic errors
    SOMETHING_WENT_WRONG: 'Something went wrong. Please try again.',
    FEATURE_NOT_AVAILABLE: 'This feature is not available yet.',
    PERMISSION_DENIED: 'You do not have permission to access this resource.'
} as const;

// Success messages
export const SUCCESS_MESSAGES = {
    REGISTRATION_SUCCESS: 'Account created successfully!',
    LOGIN_SUCCESS: 'Welcome back!',
    PROFILE_UPDATED: 'Profile updated successfully!',
    PASSWORD_CHANGED: 'Password changed successfully!',
    EMAIL_SENT: 'Email sent successfully!',
    VERIFICATION_SUCCESS: 'Email verified successfully!',
    LOGOUT_SUCCESS: 'Logged out successfully!'
} as const;

// Feature flags
export const FEATURES = {
    FRIEND_REQUESTS: false, // Will be implemented later
    REAL_TIME_CHAT: false, // Future feature
    VIDEO_CALLS: false, // Future feature
    PAYMENT_INTEGRATION: false, // Future feature
    ADVANCED_SEARCH: true,
    EMAIL_NOTIFICATIONS: true,
    SOCIAL_LOGIN: false // Configure when OAuth is set up
} as const;

// Theme colors
export const THEME_COLORS = {
    PRIMARY: '#3182ce',
    SECONDARY: '#718096',
    SUCCESS: '#38a169',
    WARNING: '#d69e2e',
    ERROR: '#e53e3e',
    INFO: '#3182ce',

    // Role colors
    PLAYER_COLOR: '#3182ce',
    COACH_COLOR: '#d69e2e',

    // Level colors (matches getPadelLevelColor utility)
    LEVEL_COLORS: {
        [PadelLevel.BEGINNER]: '#38a169',
        [PadelLevel.INTERMEDIATE]: '#d69e2e',
        [PadelLevel.ADVANCED]: '#d53f8c',
        [PadelLevel.PROFESSIONAL]: '#805ad5'
    }
} as const;

// Breakpoints for responsive design
export const BREAKPOINTS = {
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    '2XL': 1536
} as const;

// Animation durations (in milliseconds)
export const ANIMATION_DURATION = {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
    VERY_SLOW: 1000
} as const;

// Z-index layers
export const Z_INDEX = {
    DROPDOWN: 1000,
    STICKY: 1020,
    FIXED: 1030,
    MODAL_BACKDROP: 1040,
    MODAL: 1050,
    POPOVER: 1060,
    TOOLTIP: 1070,
    NOTIFICATION: 1080
} as const;

// Local storage keys
export const STORAGE_KEYS = {
    USER_PREFERENCES: 'padel_user_preferences',
    SEARCH_HISTORY: 'padel_search_history',
    FORM_DRAFT: 'padel_form_draft',
    THEME: 'padel_theme',
    LANGUAGE: 'padel_language'
} as const;

// Cookie names
export const COOKIE_NAMES = {
    SESSION: 'padel_session',
    REMEMBER_ME: 'padel_remember',
    CONSENT: 'padel_consent'
} as const;

// Social media platform configs
export const SOCIAL_PLATFORMS = {
    TWITTER: {
        name: 'Twitter',
        baseUrl: 'https://twitter.com/',
        icon: '🐦',
        color: '#1da1f2'
    },
    INSTAGRAM: {
        name: 'Instagram',
        baseUrl: 'https://instagram.com/',
        icon: '📷',
        color: '#e4405f'
    },
    LINKEDIN: {
        name: 'LinkedIn',
        baseUrl: 'https://linkedin.com/in/',
        icon: '💼',
        color: '#0077b5'
    }
} as const;

// Country codes for phone number formatting
export const COUNTRY_CODES = [
    { code: '+1', country: 'US/Canada', flag: '🇺🇸' },
    { code: '+33', country: 'France', flag: '🇫🇷' },
    { code: '+34', country: 'Spain', flag: '🇪🇸' },
    { code: '+39', country: 'Italy', flag: '🇮🇹' },
    { code: '+44', country: 'UK', flag: '🇬🇧' },
    { code: '+49', country: 'Germany', flag: '🇩🇪' },
    { code: '+351', country: 'Portugal', flag: '🇵🇹' },
    { code: '+31', country: 'Netherlands', flag: '🇳🇱' }
] as const;

// Common padel terms and specialties for coaches
export const PADEL_SPECIALTIES = [
    'Beginner Training',
    'Advanced Strategy',
    'Mental Coaching',
    'Fitness Training',
    'Technical Development',
    'Doubles Play',
    'Tournament Preparation',
    'Youth Coaching',
    'Adult Coaching',
    'Competitive Training'
] as const;

// Common certifications for coaches
export const COACH_CERTIFICATIONS = [
    'FEP Level 1',
    'FEP Level 2',
    'FEP Level 3',
    'PTR Certified',
    'IPF Certified',
    'FFP Certified',
    'USPTA Certified',
    'First Aid Certified'
] as const;

// Default user avatar categories
export const AVATAR_STYLES = [
    'avataaars',
    'big-smile',
    'croodles',
    'personas',
    'pixel-art'
] as const;

// Common locations (can be populated from user data later)
export const POPULAR_LOCATIONS = [
    'Madrid, Spain',
    'Barcelona, Spain',
    'Paris, France',
    'Rome, Italy',
    'London, UK',
    'Berlin, Germany',
    'Amsterdam, Netherlands',
    'Lisbon, Portugal',
    'Buenos Aires, Argentina',
    'Mexico City, Mexico'
] as const;