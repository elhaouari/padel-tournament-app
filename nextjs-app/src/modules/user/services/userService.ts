import { UserRepository, IUserRepository } from './userRepository';
import { AuthService } from './authService';
import { User, CreateUserRequest, UpdateUserRequest, UserFilters } from '../types';
import { validateEmail, validateName, validatePhone } from '../utils';

export class UserService {
    constructor(
        private userRepository: IUserRepository = new UserRepository(),
        private authService = new AuthService()
    ) {}

    async registerUser(userData: CreateUserRequest): Promise<{ user?: User; error?: string }> {
        try {
            // Validate input
            const validationError = this.validateUserData(userData);
            if (validationError) {
                return { error: validationError };
            }

            // Check if user already exists
            const existingUser = await this.userRepository.getUserByEmail(userData.email);
            if (existingUser) {
                return { error: 'User with this email already exists' };
            }

            // Register with Supabase
            const authResult = await this.authService.register(userData);
            if (authResult.error || !authResult.user) {
                return { error: authResult.error || 'Registration failed' };
            }

            // Create user in database
            const { password, ...userDataWithoutPassword } = userData;
            const user = await this.userRepository.createUser({
                ...userDataWithoutPassword,
                id: authResult.user.id,
                isActive: true
            });

            return { user };
        } catch (error) {
            return { error: error instanceof Error ? error.message : 'Registration failed' };
        }
    }

    async getUsers(page = 1, limit = 12, filters: UserFilters = {}) {
        return await this.userRepository.getUsers(page, limit, filters);
    }

    async getUserById(id: string): Promise<User | null> {
        return await this.userRepository.getUserById(id);
    }

    async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
        // Validate update data
        if (userData.name && !validateName(userData.name)) {
            throw new Error('Name must be at least 2 characters long');
        }
        if (userData.phone && !validatePhone(userData.phone)) {
            throw new Error('Please enter a valid phone number');
        }

        return await this.userRepository.updateUser(id, userData);
    }

    async searchUsers(query: string, currentUserId?: string): Promise<User[]> {
        if (query.trim().length < 2) {
            return [];
        }
        return await this.userRepository.searchUsers(query, currentUserId);
    }

    private validateUserData(userData: CreateUserRequest): string | null {
        if (!validateEmail(userData.email)) {
            return 'Please enter a valid email address';
        }
        if (!validateName(userData.name)) {
            return 'Name must be at least 2 characters long';
        }
        if (!userData.password || userData.password.length < 6) {
            return 'Password must be at least 6 characters long';
        }
        if (userData.phone && !validatePhone(userData.phone)) {
            return 'Please enter a valid phone number';
        }
        return null;
    }
}