// Formatting utilities for consistent display across the application

// Number formatting
export const formatNumber = (num: number, locale = 'en-US'): string => {
    return new Intl.NumberFormat(locale).format(num);
};

export const formatCurrency = (
    amount: number,
    currency = 'EUR',
    locale = 'en-US'
): string => {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency
    }).format(amount);
};

export const formatPercentage = (value: number, decimals = 1): string => {
    return `${(value).toFixed(decimals)}%`;
};

// String formatting
export const capitalizeFirst = (str: string): string => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const capitalizeWords = (str: string): string => {
    if (!str) return '';
    return str.split(' ')
        .map(word => capitalizeFirst(word))
        .join(' ');
};

export const camelToKebab = (str: string): string => {
    return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
};

export const kebabToCamel = (str: string): string => {
    return str.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
};

export const slugify = (str: string): string => {
    return str
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '') // Remove special characters
        .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
        .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

// Text formatting
export const truncate = (
    text: string,
    length: number,
    suffix = '...'
): string => {
    if (!text || text.length <= length) return text;
    return text.substring(0, length - suffix.length) + suffix;
};

export const excerpt = (text: string, sentences = 2): string => {
    if (!text) return '';
    const sentenceArray = text.match(/[^\.!?]+[\.!?]+/g) || [text];
    return sentenceArray.slice(0, sentences).join(' ').trim();
};

export const removeHtml = (html: string): string => {
    return html.replace(/<[^>]*>/g, '');
};

export const sanitizeString = (str: string): string => {
    return str
        .replace(/[<>]/g, '') // Remove angle brackets
        .replace(/javascript:/gi, '') // Remove javascript: protocol
        .trim();
};

// Array formatting
export const formatList = (
    items: string[],
    conjunction = 'and',
    locale = 'en-US'
): string => {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return `${items[0]} ${conjunction} ${items[1]}`;

    const last = items.pop();
    return `${items.join(', ')}, ${conjunction} ${last}`;
};

export const formatTags = (tags: string[], maxVisible = 3): string => {
    if (tags.length === 0) return '';
    if (tags.length <= maxVisible) return tags.join(', ');

    const visible = tags.slice(0, maxVisible);
    const remaining = tags.length - maxVisible;
    return `${visible.join(', ')} +${remaining} more`;
};

// Date and time formatting
export const formatTime = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }).format(dateObj);
};

export const formatDateShort = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
    }).format(dateObj);
};

export const formatDateLong = (date: Date | string): string => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(dateObj);
};

export const formatDateRange = (
    startDate: Date | string,
    endDate: Date | string
): string => {
    const start = typeof startDate === 'string' ? new Date(startDate) : startDate;
    const end = typeof endDate === 'string' ? new Date(endDate) : endDate;

    const startStr = formatDateShort(start);
    const endStr = formatDateShort(end);

    if (startStr === endStr) return startStr;
    return `${startStr} - ${endStr}`;
};

export const formatDuration = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) return `${mins}m`;
    if (mins === 0) return `${hours}h`;
    return `${hours}h ${mins}m`;
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// URL formatting
export const formatUrl = (url: string): string => {
    if (!url) return '';

    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
        return `https://${url}`;
    }

    return url;
};

export const extractDomain = (url: string): string => {
    try {
        const urlObj = new URL(formatUrl(url));
        return urlObj.hostname.replace(/^www\./, '');
    } catch {
        return url;
    }
};

// Address formatting
export const formatAddress = (address: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postalCode?: string;
}): string => {
    const parts = [];

    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.postalCode) parts.push(address.postalCode);
    if (address.country) parts.push(address.country);

    return parts.join(', ');
};

// Social media formatting
export const formatUsername = (username: string, platform?: string): string => {
    if (!username) return '';

    const cleaned = username.replace(/^@/, ''); // Remove @ if present

    if (platform) {
        const prefixes: Record<string, string> = {
            twitter: '@',
            instagram: '@',
            linkedin: '',
            github: '@'
        };

        const prefix = prefixes[platform.toLowerCase()] || '';
        return `${prefix}${cleaned}`;
    }

    return cleaned;
};

// Template formatting
export const formatTemplate = (
    template: string,
    variables: Record<string, any>
): string => {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] !== undefined ? String(variables[key]) : match;
    });
};

// Color formatting
export const hexToRgba = (hex: string, alpha = 1): string => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

export const getContrastColor = (hexColor: string): string => {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);

    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

    return luminance > 0.5 ? '#000000' : '#ffffff';
};

// Error message formatting
export const formatErrorMessage = (error: any): string => {
    if (typeof error === 'string') return error;
    if (error?.message) return error.message;
    if (error?.error) return error.error;
    return 'An unexpected error occurred';
};

// Search query formatting
export const formatSearchQuery = (query: string): string => {
    return query
        .trim()
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .toLowerCase();
};

export const highlightSearchTerm = (
    text: string,
    searchTerm: string,
    highlightClass = 'highlight'
): string => {
    if (!searchTerm || !text) return text;

    // Properly escape special regex characters in searchTerm
    const escapedTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedTerm})`, 'gi');
    return text.replace(regex, `<mark class="${highlightClass}">$1</mark>`);
};

// Form validation message formatting
export const formatValidationError = (
  field: string, 
  rule: string, 
  value?: any
): string => {
  const messages: Record<string, (field: string, value?: any) => string> = {
    required: (field) => `${capitalizeFirst(field)} is required`,
    email: (field) => `Please enter a valid ${field.toLowerCase()}`,
    minLength: (field, value) => `${capitalizeFirst(field)} must be at least ${value} characters`,
    maxLength: (field, value) => `${capitalizeFirst(field)} must be no more than ${value} characters`,
    min: (field, value) => `${capitalizeFirst(field)} must be at least ${value}`,
    max: (field, value) => `${capitalizeFirst(field)} must be no more than ${value}`,
    pattern: (field) => `${capitalizeFirst(field)} format is invalid`
  };
  
  const formatter = messages[rule];
  if (formatter) {
    return formatter(field, value);
  }
  
  return `${capitalizeFirst(field)} is invalid`;
};

// API response formatting
export const formatApiError = (error: {
  status?: number;
  statusText?: string;
  message?: string;
}): string => {
  if (error.message) return error.message;
  if (error.status && error.statusText) {
    return `${error.status}: ${error.statusText}`;
  }
  if (error.status) {
    const statusMessages: Record<number, string> = {
      400: 'Bad Request',
      401: 'Unauthorized',
      403: 'Forbidden',
      404: 'Not Found',
      429: 'Too Many Requests',
      500: 'Internal Server Error',
      502: 'Bad Gateway',
      503: 'Service Unavailable'
    };
    return `${error.status}: ${statusMessages[error.status] || 'Unknown Error'}`;
  }
  return 'An error occurred';
};

// Rating and score formatting
export const formatRating = (rating: number, maxRating = 5): string => {
  const stars = '★'.repeat(Math.floor(rating)) + '☆'.repeat(maxRating - Math.floor(rating));
  return `${stars} (${rating.toFixed(1)})`;
};

export const formatScore = (score: number, maxScore = 100): string => {
  const percentage = (score / maxScore) * 100;
  return `${score}/${maxScore} (${percentage.toFixed(0)}%)`;
};

// Social proof formatting
export const formatCount = (count: number, singular: string, plural?: string): string => {
    const pluralForm = plural || `${singular}s`;
    return `${formatNumber(count)} ${count === 1 ? singular : pluralForm}`;
};

export const formatCompactNumber = (num: number): string => {
    if (num < 1000) return num.toString();
    if (num < 1000000) return `${(num / 1000).toFixed(1)}K`;
    if (num < 1000000000) return `${(num / 1000000).toFixed(1)}M`;
    return `${(num / 1000000000).toFixed(1)}B`;
};

// Status formatting
export const formatStatus = (status: string): string => {
    return status
        .split('_')
        .map(word => capitalizeFirst(word))
        .join(' ');
};

// Phone number international formatting
export const formatInternationalPhone = (phone: string, countryCode = '+1'): string => {
    if (!phone) return '';

    // Remove all non-digit characters except +
    const cleaned = phone.replace(/[^\d+]/g, '');

    // If already has country code, return as is
    if (cleaned.startsWith('+')) return cleaned;

    // Add default country code if not present
    return `${countryCode}${cleaned}`;
};

// Breadcrumb formatting
export const formatBreadcrumb = (path: string): string[] => {
    return path
        .split('/')
        .filter(segment => segment.length > 0)
        .map(segment => capitalizeWords(segment.replace(/[-_]/g, ' ')));
};