// Enums
export enum UserRole {
    PLAYER = 'PLAYER',
    COACH = 'COACH'
}

export enum PadelLevel {
    BEGINNER = 'BEGINNER',
    INTERMEDIATE = 'INTERMEDIATE',
    ADVANCED = 'ADVANCED',
    PROFESSIONAL = 'PROFESSIONAL'
}

export enum RequestStatus {
    PENDING = 'PENDING',
    ACCEPTED = 'ACCEPTED',
    REJECTED = 'REJECTED'
}

// Core User Interface
export interface User {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    phone?: string;
    bio?: string;
    role: UserRole;
    level?: PadelLevel;
    experience?: number; // years of experience
    location?: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;

    // Coach specific fields
    certifications?: string[];
    hourlyRate?: number;
    specialties?: string[];
}

// Request/Response Types
export interface CreateUserRequest {
    email: string;
    password: string;
    name: string;
    phone?: string;
    role: UserRole;
    level?: PadelLevel;
    location?: string;
    bio?: string;

    // Coach specific
    certifications?: string[];
    hourlyRate?: number;
    specialties?: string[];
}

export interface UpdateUserRequest {
    name?: string;
    phone?: string;
    bio?: string;
    level?: PadelLevel;
    location?: string;
    avatar?: string;

    // Coach specific
    certifications?: string[];
    hourlyRate?: number;
    specialties?: string[];
}

export interface UserFilters {
    role?: UserRole;
    level?: PadelLevel;
    location?: string;
    search?: string;
}

export interface UserListResponse {
    users: User[];
    total: number;
    page: number;
    limit: number;
}

// Friend Request System (for future features)
export interface FriendRequest {
    id: string;
    senderId: string;
    receiverId: string;
    status: RequestStatus;
    createdAt: Date;

    // Populated relations
    sender?: User;
    receiver?: User;
}

export interface CreateFriendRequestData {
    receiverId: string;
}

export interface UpdateFriendRequestData {
    status: RequestStatus;
}

// Authentication Types
export interface AuthUser {
    id: string;
    email: string;
    emailConfirmed: boolean;
    lastSignIn?: Date;
}

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterResponse {
    user?: User;
    error?: string;
    requiresVerification?: boolean;
}

export interface LoginResponse {
    user?: AuthUser;
    session?: any;
    error?: string;
}

// Profile Types
export interface UserProfile extends User {
    // Extended profile information
    joinedDate: Date;
    lastActive?: Date;
    profileCompleteness: number; // 0-100 percentage
    isOnline?: boolean;
}

export interface UserStats {
    totalUsers: number;
    totalPlayers: number;
    totalCoaches: number;
    usersByLevel: Record<PadelLevel, number>;
    usersByLocation: Record<string, number>;
    recentRegistrations: number;
}

// Search Types
export interface SearchRequest {
    query: string;
    filters?: UserFilters;
    limit?: number;
}

export interface SearchResult {
    users: User[];
    total: number;
    query: string;
    searchTime: number;
}

// Validation Types
// Removed duplicate ValidationError interface, use the class below

export interface FormValidationResult {
    isValid: boolean;
    errors: ValidationError[];
}

// API Response Types
export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: string;
    message?: string;
    timestamp: Date;
}

export interface PaginatedResponse<T> {
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNext: boolean;
        hasPrev: boolean;
    };
}

// Component Prop Types
export interface UserCardProps {
    user: User;
    onViewProfile?: (user: User) => void;
    onConnect?: (user: User) => void;
    showConnectButton?: boolean;
    compact?: boolean;
}

export interface UserListProps {
    users: User[];
    loading?: boolean;
    error?: string | null;
    onViewProfile?: (user: User) => void;
    onConnect?: (user: User) => void;
    showConnectButton?: boolean;
    emptyMessage?: string;
    emptyDescription?: string;
}

export interface UserFilterProps {
    filters: UserFilters;
    onFiltersChange: (filters: UserFilters) => void;
    loading?: boolean;
}

export interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    loading?: boolean;
}

// Hook Return Types
export interface UseAuthReturn {
    user: User | null;
    supabaseUser: any | null;
    loading: boolean;
    error: string | null;
    isAuthenticated: boolean;
    register: (userData: CreateUserRequest) => Promise<{ success: boolean; error?: string; user?: User }>;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
    updateProfile: (userData: Partial<User>) => Promise<{ success: boolean; error?: string; user?: User }>;
    refreshUser: () => Promise<void>;
    clearError: () => void;
}

export interface UseUsersReturn {
    users: User[];
    loading: boolean;
    error: string | null;
    filters: UserFilters;
    pagination: {
        page: number;
        limit: number;
        total: number;
    };
    fetchUsers: (page?: number, filters?: UserFilters) => Promise<void>;
    searchUsers: (query: string, currentUserId?: string) => Promise<User[]>;
    updateFilters: (filters: UserFilters) => void;
    nextPage: () => void;
    prevPage: () => void;
    goToPage: (page: number) => void;
    refresh: () => void;
    clearError: () => void;
    hasNextPage: boolean;
    hasPrevPage: boolean;
    totalPages: number;
}

export interface UseUserReturn {
    user: User | null;
    loading: boolean;
    error: string | null;
    refresh: () => void;
    clearError: () => void;
}

export interface UseSearchReturn {
    query: string;
    setQuery: (query: string) => void;
    results: User[];
    loading: boolean;
    error: string | null;
    hasSearched: boolean;
    clearSearch: () => void;
    clearError: () => void;
    isEmpty: boolean;
    hasResults: boolean;
}

// Utility Types
export type UserWithoutId = Omit<User, 'id'>;
export type UserPublicProfile = Pick<User, 'id' | 'name' | 'avatar' | 'role' | 'level' | 'location' | 'bio' | 'experience' | 'hourlyRate' | 'specialties' | 'createdAt'>;
export type UserPrivateData = Pick<User, 'email' | 'phone'>;
export type CoachUser = User & Required<Pick<User, 'hourlyRate' | 'specialties' | 'certifications'>>;
export type PlayerUser = User & Required<Pick<User, 'level'>>;

// Form Data Types
export interface UserFormData {
    name?: string;
    phone?: string;
    bio?: string;
    level?: PadelLevel;
    location?: string;
    certifications?: string;
    hourlyRate?: string;
    specialties?: string;
}

export interface RegisterFormData extends UserFormData {
    email: string;
    password: string;
    confirmPassword: string;
    role: UserRole;
}

export interface LoginFormData {
    email: string;
    password: string;
}

// Configuration Types
export interface UserModuleConfig {
    apiBaseUrl: string;
    enableRealTimeUpdates: boolean;
    defaultPageSize: number;
    maxSearchResults: number;
    debounceDelay: number;
    cacheTimeout: number;
}

// Event Types
export interface UserEvent {
    type: 'USER_REGISTERED' | 'USER_UPDATED' | 'USER_DELETED' | 'USER_LOGIN' | 'USER_LOGOUT';
    userId: string;
    timestamp: Date;
    data?: any;
}

// Error Types
export interface UserError {
    message: string;
    code?: string;
    field?: string;
    statusCode?: number;
}

export class ValidationError extends Error {
    constructor(
        public field: string,
        message: string,
        public code?: string
    ) {
        super(message);
        this.name = 'ValidationError';
    }
}