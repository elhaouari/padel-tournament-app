import { User, UserRole, PadelLevel } from '../types';

// Date formatting utilities
export const formatDate = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
    }

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(dateObj);
};

export const formatDateTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;

    if (isNaN(dateObj.getTime())) {
        return 'Invalid date';
    }

    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(dateObj);
};

export const formatRelativeTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - dateObj.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
};

// User display utilities
export const getInitials = (name: string): string => {
    if (!name || typeof name !== 'string') return 'U';

    return name
        .split(' ')
        .map(word => word.charAt(0).toUpperCase())
        .join('')
        .slice(0, 2);
};

export const getDisplayName = (user: User): string => {
    return user.name || 'Unknown User';
};

export const getUserFullLocation = (user: User): string => {
    return user.location || 'Location not specified';
};

// Padel level utilities
export const getPadelLevelColor = (level: PadelLevel): string => {
    const colors = {
        [PadelLevel.BEGINNER]: '#38a169',      // Green
        [PadelLevel.INTERMEDIATE]: '#d69e2e',  // Yellow/Orange
        [PadelLevel.ADVANCED]: '#d53f8c',      // Pink/Purple
        [PadelLevel.PROFESSIONAL]: '#805ad5'   // Purple
    };
    return colors[level] || '#718096'; // Default gray
};

export const getPadelLevelLabel = (level: PadelLevel): string => {
    const labels = {
        [PadelLevel.BEGINNER]: 'Beginner',
        [PadelLevel.INTERMEDIATE]: 'Intermediate',
        [PadelLevel.ADVANCED]: 'Advanced',
        [PadelLevel.PROFESSIONAL]: 'Professional'
    };
    return labels[level] || 'Unknown';
};

export const getPadelLevelIcon = (level: PadelLevel): string => {
    const icons = {
        [PadelLevel.BEGINNER]: '🟢',
        [PadelLevel.INTERMEDIATE]: '🟡',
        [PadelLevel.ADVANCED]: '🟠',
        [PadelLevel.PROFESSIONAL]: '🔴'
    };
    return icons[level] || '⚪';
};

// Role utilities
export const getRoleIcon = (role: UserRole): string => {
    return role === UserRole.COACH ? '🎾' : '🏆';
};

export const getRoleLabel = (role: UserRole): string => {
    const labels = {
        [UserRole.PLAYER]: 'Player',
        [UserRole.COACH]: 'Coach'
    };
    return labels[role] || 'Unknown';
};

export const getRoleBadgeColor = (role: UserRole): string => {
    const colors = {
        [UserRole.PLAYER]: '#3182ce', // Blue
        [UserRole.COACH]: '#d69e2e'   // Orange
    };
    return colors[role] || '#718096';
};

// Profile completeness
export const calculateProfileCompleteness = (user: User): number => {
    let completedFields = 0;
    let totalFields = 0;

    // Basic fields (always count)
    const basicFields = ['name', 'email'];
    totalFields += basicFields.length;
    basicFields.forEach(field => {
        if (user[field as keyof User] != null && user[field as keyof User] !== '') completedFields++;
    });

    // Optional but valuable fields
    const optionalFields = ['avatar', 'phone', 'bio', 'location'];
    totalFields += optionalFields.length;
    optionalFields.forEach(field => {
        if (user[field as keyof User] != null && user[field as keyof User] !== '') completedFields++;
    });

    // Role-specific fields
    if (user.role === UserRole.PLAYER) {
        totalFields += 2; // level, experience
        if (user.level != null && user.level !== '') completedFields++;
        if (user.experience != null && user.experience !== '') completedFields++;
    } else if (user.role === UserRole.COACH) {
        totalFields += 3; // hourlyRate, certifications, specialties
        if (user.hourlyRate != null && user.hourlyRate !== '') completedFields++;
        if (user.certifications?.length) completedFields++;
        if (user.specialties?.length) completedFields++;
    }

    return Math.round((completedFields / totalFields) * 100);
};

// Phone number formatting
export const formatPhoneNumber = (phone: string): string => {
    if (!phone) return '';

    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // If it starts with +, keep it international format
    if (cleaned.startsWith('+')) {
        return cleaned;
    }

    // For US numbers, format as (XXX) XXX-XXXX
    if (cleaned.length === 10) {
        const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            return `(${match[1]}) ${match[2]}-${match[3]}`;
        }
    }

    return phone; // Return original if no formatting applied
};

// Avatar utilities
export const generateAvatarUrl = (userId: string, name?: string): string => {
    // Use a service like DiceBear for consistent avatar generation
    const seed = userId || name || 'default';
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(seed)}`;
};

export const getAvatarFallback = (user: User): string => {
    return user.avatar || generateAvatarUrl(user.id, user.name);
};

// Search and filtering helpers
export const searchUsers = (users: User[], query: string): User[] => {
    if (!query.trim()) return users;

    const searchTerm = query.toLowerCase().trim();

    return users.filter(user =>
        user.name.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        (user.bio && user.bio.toLowerCase().includes(searchTerm)) ||
        (user.location && user.location.toLowerCase().includes(searchTerm)) ||
        (user.specialties && user.specialties.some(s => s.toLowerCase().includes(searchTerm)))
    );
};

export const filterUsersByRole = (users: User[], role?: UserRole): User[] => {
    if (!role) return users;
    return users.filter(user => user.role === role);
};

export const filterUsersByLevel = (users: User[], level?: PadelLevel): User[] => {
    if (!level) return users;
    return users.filter(user => user.level === level);
};

export const filterUsersByLocation = (users: User[], location?: string): User[] => {
    if (!location?.trim()) return users;
    const searchLocation = location.toLowerCase().trim();
    return users.filter(user =>
        user.location && user.location.toLowerCase().includes(searchLocation)
    );
};

// Sorting utilities
export type UserSortField = 'name' | 'createdAt' | 'role' | 'level' | 'location' | 'hourlyRate';
export type SortOrder = 'asc' | 'desc';

export const sortUsers = (users: User[], field: UserSortField, order: SortOrder = 'asc'): User[] => {
    const sortedUsers = [...users].sort((a, b) => {
        let aValue: any = a[field];
        let bValue: any = b[field];

        // Handle undefined/null values
        if (aValue == null && bValue == null) return 0;
        if (aValue == null) return order === 'asc' ? 1 : -1;
        if (bValue == null) return order === 'asc' ? -1 : 1;

        // Convert to comparable values
        if (field === 'createdAt') {
            aValue = new Date(aValue).getTime();
            bValue = new Date(bValue).getTime();
        } else if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
        }

        if (aValue < bValue) return order === 'asc' ? -1 : 1;
        if (aValue > bValue) return order === 'asc' ? 1 : -1;
        return 0;
    });

    return sortedUsers;
};

// URL and slug utilities
export const createUserSlug = (user: User): string => {
    return `${user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${user.id.slice(-6)}`;
};

export const parseUserSlug = (slug: string): { name: string; id: string } | null => {
    const match = slug.match(/^(.+)-([a-f0-9]{6})$/);
    if (!match) return null;

    return {
        name: match[1].replace(/-/g, ' '),
        id: match[2]
    };
};

// Utility for coach pricing
export const formatHourlyRate = (rate: number, currency = '€'): string => {
    return `${currency}${rate.toFixed(2)}/hour`;
};

export const calculateSessionCost = (hourlyRate: number, durationMinutes: number): number => {
    return (hourlyRate * durationMinutes) / 60;
};

// Age calculation (if birthDate is added later)
export const calculateAge = (birthDate: Date | string): number => {
    const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }

    return age;
};

// Text truncation
export const truncateText = (text: string, maxLength: number, suffix = '...'): string => {
    if (!text || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
};

// Bio formatting
export const formatBio = (bio: string, maxLength = 150): string => {
    return truncateText(bio, maxLength);
};

// Experience formatting
export const formatExperience = (years: number): string => {
    if (years === 0) return 'New to padel';
    if (years === 1) return '1 year experience';
    return `${years} years experience`;
};

// Availability helpers (for future features)
export const isUserOnline = (lastActivity: Date | string, thresholdMinutes = 15): boolean => {
    const lastActive = typeof lastActivity === 'string' ? new Date(lastActivity) : lastActivity;
    const now = new Date();
    const diffMinutes = (now.getTime() - lastActive.getTime()) / (1000 * 60);
    return diffMinutes <= thresholdMinutes;
};

// Array utilities for user lists
export const groupUsersByRole = (users: User[]): Record<UserRole, User[]> => {
    return users.reduce((groups, user) => {
        if (!groups[user.role]) {
            groups[user.role] = [];
        }
        groups[user.role].push(user);
        return groups;
    }, {} as Record<UserRole, User[]>);
};

export const groupUsersByLevel = (users: User[]): Record<string, User[]> => {
    return users.reduce((groups, user) => {
        const level = user.level || 'No Level';
        if (!groups[level]) {
            groups[level] = [];
        }
        groups[level].push(user);
        return groups;
    }, {} as Record<string, User[]>);
};