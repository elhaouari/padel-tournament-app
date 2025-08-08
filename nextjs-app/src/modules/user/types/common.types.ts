// Common utility types used throughout the application

// Generic Types
export type ID = string;
export type Timestamp = Date;
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Status Types
export type LoadingState = 'idle' | 'loading' | 'succeeded' | 'failed';
export type AsyncState<T> = {
    data: T | null;
    loading: boolean;
    error: string | null;
};

// Form Types
export interface FormField {
    name: string;
    label: string;
    type: 'text' | 'email' | 'password' | 'tel' | 'textarea' | 'select' | 'number';
    required?: boolean;
    placeholder?: string;
    options?: Array<{ value: string; label: string }>;
    validation?: ValidationRule[];
}

export interface ValidationRule {
    type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern' | 'custom';
    value?: any;
    message: string;
}

export interface FormState<T> {
    values: T;
    errors: Record<keyof T, string>;
    touched: Record<keyof T, boolean>;
    isValid: boolean;
    isDirty: boolean;
    isSubmitting: boolean;
}

// UI Component Types
export interface BaseComponentProps {
    className?: string;
    style?: React.CSSProperties;
    children?: React.ReactNode;
}

export interface ClickableProps {
    onClick?: () => void;
    disabled?: boolean;
}

export interface LoadingProps {
    loading?: boolean;
    loadingText?: string;
}

// Theme Types
export interface Theme {
    colors: {
        primary: string;
        secondary: string;
        success: string;
        warning: string;
        error: string;
        info: string;
        text: {
            primary: string;
            secondary: string;
            muted: string;
        };
        background: {
            primary: string;
            secondary: string;
            muted: string;
        };
        border: string;
    };
    spacing: {
        xs: string;
        sm: string;
        md: string;
        lg: string;
        xl: string;
    };
    typography: {
        fontFamily: string;
        fontSize: {
            xs: string;
            sm: string;
            md: string;
            lg: string;
            xl: string;
        };
        fontWeight: {
            normal: number;
            medium: number;
            bold: number;
        };
    };
    borderRadius: {
        sm: string;
        md: string;
        lg: string;
    };
    shadows: {
        sm: string;
        md: string;
        lg: string;
    };
}

// Date/Time Types
export interface DateRange {
    start: Date;
    end: Date;
}

export interface TimeSlot {
    start: Date;
    end: Date;
    available: boolean;
}

// Location Types
export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface Address {
    street: string;
    city: string;
    state?: string;
    country: string;
    postalCode?: string;
    coordinates?: Coordinates;
}

// File Types
export interface FileInfo {
    name: string;
    size: number;
    type: string;
    url?: string;
    uploadedAt?: Date;
}

export interface ImageInfo extends FileInfo {
    width?: number;
    height?: number;
    alt?: string;
}

// Event Types
export interface BaseEvent<T = any> {
    id: string;
    type: string;
    data: T;
    timestamp: Date;
    source?: string;
}

// Configuration Types
export interface AppConfig {
    apiUrl: string;
    appName: string;
    version: string;
    environment: 'development' | 'staging' | 'production';
    features: Record<string, boolean>;
}

// Error Types
export interface ErrorInfo {
    message: string;
    code?: string;
    field?: string;
    details?: any;
}

export interface ErrorBoundaryState {
    hasError: boolean;
    error?: Error;
    errorInfo?: ErrorInfo;
}

// Modal Types
export interface ModalProps extends BaseComponentProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl';
    closeOnOverlayClick?: boolean;
    closeOnEscape?: boolean;
}

// Notification Types
export interface Notification {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    actions?: Array<{
        label: string;
        onClick: () => void;
    }>;
}

// Search Types
export interface SearchOptions {
    query: string;
    filters?: Record<string, any>;
    sort?: {
        field: string;
        order: 'asc' | 'desc';
    };
    pagination?: {
        page: number;
        limit: number;
    };
}

// Breadcrumb Types
export interface BreadcrumbItem {
    label: string;
    href?: string;
    active?: boolean;
}

// Menu Types
export interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    href?: string;
    onClick?: () => void;
    disabled?: boolean;
    children?: MenuItem[];
}

// Table Types
export interface TableColumn<T> {
    key: keyof T;
    title: string;
    sortable?: boolean;
    filterable?: boolean;
    render?: (value: any, record: T) => React.ReactNode;
    width?: string | number;
    align?: 'left' | 'center' | 'right';
}

export interface TableProps<T> {
    data: T[];
    columns: TableColumn<T>[];
    loading?: boolean;
    pagination?: {
        current: number;
        pageSize: number;
        total: number;
        onChange: (page: number, pageSize: number) => void;
    };
    onRowClick?: (record: T) => void;
}

// Toast Types
export interface ToastMessage {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
    duration?: number;
    action?: {
        label: string;
        onClick: () => void;
    };
}

// Device Types
export interface DeviceInfo {
    type: 'mobile' | 'tablet' | 'desktop';
    os: string;
    browser: string;
    screenSize: {
        width: number;
        height: number;
    };
    touchEnabled: boolean;
}

// Analytics Types
export interface AnalyticsEvent {
    name: string;
    properties?: Record<string, any>;
    timestamp?: Date;
}

export interface PageView {
    path: string;
    title: string;
    timestamp: Date;
    userId?: string;
}