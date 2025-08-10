import { User, CreateUserRequest, UpdateUserRequest, UserFilters, UserListResponse } from '../types';
import { IUserRepository } from './userRepository';
import { IAuthService } from './authService';
import { validateUserRegistration, validateUserUpdate, ValidationResult } from '../utils/userValidation';

// User service interface
export interface IUserService {
    // User registration and authentication
    registerUser(userData: CreateUserRequest): Promise<{ user?: User; error?: string }>;

    // User CRUD operations
    getUserById(id: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    getUsers(page?: number, limit?: number, filters?: UserFilters): Promise<UserListResponse>;
    updateUser(id: string, userData: UpdateUserRequest): Promise<User>;
    deleteUser(id: string): Promise<void>;

    // Search and filtering
    searchUsers(query: string, currentUserId?: string): Promise<User[]>;
    getUsersByRole(role: string, page?: number, limit?: number): Promise<UserListResponse>;
    getUsersByLevel(level: string, page?: number, limit?: number): Promise<UserListResponse>;
    getUsersByLocation(location: string, page?: number, limit?: number): Promise<UserListResponse>;

    // User statistics
    getUserStats(): Promise<{
        totalUsers: number;
        totalPlayers: number;
        totalCoaches: number;
        usersByLevel: Record<string, number>;
        usersByRole: Record<string, number>;
        recentUsers: User[];
    }>;

    // Profile management
    updateProfile(userId: string, profileData: UpdateUserRequest): Promise<User>;
    uploadAvatar(userId: string, file: File): Promise<{ avatarUrl: string }>;

    // Validation
    validateRegistrationData(userData: CreateUserRequest): ValidationResult;
    validateUpdateData(userData: UpdateUserRequest): ValidationResult;

    // Business logic
    canUserAccessProfile(requesterId: string, targetUserId: string): Promise<boolean>;
    isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean>;
    calculateProfileCompleteness(user: User): number;
}

// Main user service implementation
export class UserService implements IUserService {
    constructor(
        private userRepository: IUserRepository,
        private authService?: IAuthService
    ) {}

    async registerUser(userData: CreateUserRequest): Promise<{ user?: User; error?: string }> {
        try {
            // 1. Validate registration data
            const validation = this.validateRegistrationData(userData);
            if (!validation.isValid) {
                return {
                    error: Object.values(validation.errors).join(', ')
                };
            }

            // 2. Check if email is already taken
            const existingUser = await this.userRepository.findByEmail(userData.email);
            if (existingUser) {
                return { error: 'An account with this email already exists' };
            }

            // 3. Register with authentication service if available
            if (this.authService) {
                const authResult = await this.authService.signUp({
                    email: userData.email,
                    password: userData.password,
                    options: {
                        data: {
                            name: userData.name,
                            role: userData.role
                        }
                    }
                });

                if (authResult.error) {
                    return { error: authResult.error.message };
                }

                // 4. Create user record in database with auth user ID
                const userRecord = await this.createUserRecord(userData, authResult.user?.id);
                return { user: userRecord };
            } else {
                // 5. Create user without auth service (for testing)
                const userRecord = await this.createUserRecord(userData);
                return { user: userRecord };
            }
        } catch (error) {
            console.error('Error in registerUser:', error);
            return {
                error: error instanceof Error ? error.message : 'Registration failed'
            };
        }
    }

    async getUserById(id: string): Promise<User | null> {
        try {
            return await this.userRepository.findById(id);
        } catch (error) {
            console.error('Error getting user by ID:', error);
            throw new Error('Failed to fetch user');
        }
    }

    async getUserByEmail(email: string): Promise<User | null> {
        try {
            return await this.userRepository.findByEmail(email);
        } catch (error) {
            console.error('Error getting user by email:', error);
            throw new Error('Failed to fetch user');
        }
    }

    async getUsers(
        page = 1,
        limit = 12,
        filters: UserFilters = {}
    ): Promise<UserListResponse> {
        try {
            // Apply business rules to filters
            const sanitizedFilters = this.sanitizeFilters(filters);

            return await this.userRepository.findMany(page, limit, sanitizedFilters);
        } catch (error) {
            console.error('Error getting users:', error);
            throw new Error('Failed to fetch users');
        }
    }

    async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
        try {
            // 1. Validate update data
            const validation = this.validateUpdateData(userData);
            if (!validation.isValid) {
                throw new Error(Object.values(validation.errors).join(', '));
            }

            // 2. Check if user exists
            const existingUser = await this.userRepository.findById(id);
            if (!existingUser) {
                throw new Error('User not found');
            }

            // 3. Apply business rules
            const processedData = await this.processUpdateData(existingUser, userData);

            // 4. Update user
            return await this.userRepository.update(id, processedData);
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async deleteUser(id: string): Promise<void> {
        try {
            // Check if user exists
            const user = await this.userRepository.findById(id);
            if (!user) {
                throw new Error('User not found');
            }

            // Soft delete (set isActive to false) instead of hard delete
            await this.userRepository.softDelete(id);
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }

    async searchUsers(query: string, currentUserId?: string): Promise<User[]> {
        try {
            if (!query || query.trim().length < 2) {
                return [];
            }

            const sanitizedQuery = query.trim().toLowerCase();
            return await this.userRepository.search(sanitizedQuery, currentUserId);
        } catch (error) {
            console.error('Error searching users:', error);
            throw new Error('Search failed');
        }
    }

    async getUsersByRole(role: string, page = 1, limit = 12): Promise<UserListResponse> {
        try {
            return await this.userRepository.findByRole(role, page, limit);
        } catch (error) {
            console.error('Error getting users by role:', error);
            throw new Error('Failed to fetch users by role');
        }
    }

    async getUsersByLevel(level: string, page = 1, limit = 12): Promise<UserListResponse> {
        try {
            return await this.userRepository.findByLevel(level, page, limit);
        } catch (error) {
            console.error('Error getting users by level:', error);
            throw new Error('Failed to fetch users by level');
        }
    }

    async getUsersByLocation(location: string, page = 1, limit = 12): Promise<UserListResponse> {
        try {
            return await this.userRepository.findByLocation(location, page, limit);
        } catch (error) {
            console.error('Error getting users by location:', error);
            throw new Error('Failed to fetch users by location');
        }
    }

    async getUserStats(): Promise<{
        totalUsers: number;
        totalPlayers: number;
        totalCoaches: number;
        usersByLevel: Record<string, number>;
        usersByRole: Record<string, number>;
        recentUsers: User[];
    }> {
        try {
            const [
                totalUsers,
                usersByRole,
                usersByLevel,
                recentUsers
            ] = await Promise.all([
                this.userRepository.count(),
                this.userRepository.countByRole(),
                this.userRepository.countByLevel(),
                this.userRepository.getRecentUsers(10)
            ]);

            return {
                totalUsers,
                totalPlayers: usersByRole['PLAYER'] || 0,
                totalCoaches: usersByRole['COACH'] || 0,
                usersByLevel,
                usersByRole,
                recentUsers
            };
        } catch (error) {
            console.error('Error getting user stats:', error);
            throw new Error('Failed to fetch user statistics');
        }
    }

    async updateProfile(userId: string, profileData: UpdateUserRequest): Promise<User> {
        try {
            // Additional validation for profile updates
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // Apply profile-specific business rules
            const processedData = await this.processProfileUpdate(user, profileData);

            return await this.userRepository.update(userId, processedData);
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    }

    async uploadAvatar(userId: string, file: File): Promise<{ avatarUrl: string }> {
        try {
            // Validate file
            this.validateAvatarFile(file);

            // Check if user exists
            const user = await this.userRepository.findById(userId);
            if (!user) {
                throw new Error('User not found');
            }

            // TODO: Implement file upload to storage service (Supabase Storage)
            // For now, return a placeholder URL
            const avatarUrl = `https://example.com/avatars/${userId}_${Date.now()}.jpg`;

            // Update user avatar URL
            await this.userRepository.update(userId, { avatar: avatarUrl });

            return { avatarUrl };
        } catch (error) {
            console.error('Error uploading avatar:', error);
            throw error;
        }
    }

    validateRegistrationData(userData: CreateUserRequest): ValidationResult {
        return validateUserRegistration(userData);
    }

    validateUpdateData(userData: UpdateUserRequest): ValidationResult {
        return validateUserUpdate(userData);
    }

    async canUserAccessProfile(requesterId: string, targetUserId: string): Promise<boolean> {
        try {
            // Users can always access their own profile
            if (requesterId === targetUserId) {
                return true;
            }

            // Check if both users exist and are active
            const [requester, target] = await Promise.all([
                this.userRepository.findById(requesterId),
                this.userRepository.findById(targetUserId)
            ]);

            if (!requester || !target || !requester.isActive || !target.isActive) {
                return false;
            }

            // For now, all active users can view each other's profiles
            // TODO: Implement privacy settings and friend system
            return true;
        } catch (error) {
            console.error('Error checking profile access:', error);
            return false;
        }
    }

    async isEmailAvailable(email: string, excludeUserId?: string): Promise<boolean> {
        try {
            const existingUser = await this.userRepository.findByEmail(email);

            if (!existingUser) {
                return true;
            }

            // If excluding a user ID (for updates), check if it's the same user
            return excludeUserId ? existingUser.id === excludeUserId : false;
        } catch (error) {
            console.error('Error checking email availability:', error);
            return false;
        }
    }

    calculateProfileCompleteness(user: User): number {
        let completedFields = 0;
        let totalFields = 0;

        // Basic required fields
        const basicFields = ['name', 'email'];
        totalFields += basicFields.length;
        basicFields.forEach(field => {
            if (user[field as keyof User]) completedFields++;
        });

        // Optional but valuable fields
        const optionalFields = ['avatar', 'phone', 'bio', 'location'];
        totalFields += optionalFields.length;
        optionalFields.forEach(field => {
            if (user[field as keyof User]) completedFields++;
        });

        // Role-specific fields
        if (user.role === 'PLAYER') {
            totalFields += 2; // level, experience
            if (user.level) completedFields++;
            if (user.experience) completedFields++;
        } else if (user.role === 'COACH') {
            totalFields += 3; // hourlyRate, certifications, specialties
            if (user.hourlyRate) completedFields++;
            if (user.certifications?.length) completedFields++;
            if (user.specialties?.length) completedFields++;
        }

        return Math.round((completedFields / totalFields) * 100);
    }

    // Private helper methods
    private async createUserRecord(userData: CreateUserRequest, authUserId?: string): Promise<User> {
        const { password, ...userDataWithoutPassword } = userData;

        const userRecord = await this.userRepository.create({
            id: authUserId || `user_${Date.now()}`,
            ...userDataWithoutPassword,
            isActive: true
        });

        return userRecord;
    }

    private sanitizeFilters(filters: UserFilters): UserFilters {
        const sanitized: UserFilters = {};

        if (filters.role && ['PLAYER', 'COACH'].includes(filters.role)) {
            sanitized.role = filters.role;
        }

        if (filters.level && ['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'PROFESSIONAL'].includes(filters.level)) {
            sanitized.level = filters.level;
        }

        if (filters.location && filters.location.trim().length > 0) {
            sanitized.location = filters.location.trim();
        }

        if (filters.search && filters.search.trim().length >= 2) {
            sanitized.search = filters.search.trim();
        }

        return sanitized;
    }

    private async processUpdateData(
        existingUser: User,
        userData: UpdateUserRequest
    ): Promise<UpdateUserRequest> {
        const processedData = { ...userData };

        // Business rule: Coaches must have hourly rate if setting specialties
        if (existingUser.role === 'COACH' && processedData.specialties?.length && !processedData.hourlyRate && !existingUser.hourlyRate) {
            throw new Error('Coaches must set an hourly rate when adding specialties');
        }

        // Business rule: Players should have a level
        if (existingUser.role === 'PLAYER' && !processedData.level && !existingUser.level) {
            console.warn('Player should have a skill level set');
        }

        return processedData;
    }

    private async processProfileUpdate(
        user: User,
        profileData: UpdateUserRequest
    ): Promise<UpdateUserRequest> {
        // Apply the same processing as regular updates
        return this.processUpdateData(user, profileData);
    }

    private validateAvatarFile(file: File): void {
        const maxSize = 5 * 1024 * 1024; // 5MB
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

        if (file.size > maxSize) {
            throw new Error('Avatar file size must be less than 5MB');
        }

        if (!allowedTypes.includes(file.type)) {
            throw new Error('Avatar must be a JPEG, PNG, or WebP image');
        }
    }
}