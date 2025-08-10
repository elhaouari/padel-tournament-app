import { User, CreateUserRequest, UpdateUserRequest, UserFilters, UserListResponse } from '../types';

// Repository interface for dependency injection and testing
export interface IUserRepository {
    // User CRUD operations
    findById(id: string): Promise<User | null>;
    findByEmail(email: string): Promise<User | null>;
    findMany(page?: number, limit?: number, filters?: UserFilters): Promise<UserListResponse>;
    create(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
    update(id: string, userData: UpdateUserRequest): Promise<User>;
    delete(id: string): Promise<void>;
    softDelete(id: string): Promise<void>;

    // Search and filtering
    search(query: string, currentUserId?: string, limit?: number): Promise<User[]>;
    findByRole(role: string, page?: number, limit?: number): Promise<UserListResponse>;
    findByLevel(level: string, page?: number, limit?: number): Promise<UserListResponse>;
    findByLocation(location: string, page?: number, limit?: number): Promise<UserListResponse>;

    // Statistics and analytics
    count(): Promise<number>;
    countByRole(): Promise<Record<string, number>>;
    countByLevel(): Promise<Record<string, number>>;
    getRecentUsers(limit?: number): Promise<User[]>;

    // Bulk operations
    createMany(users: Array<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User[]>;
    updateMany(updates: Array<{ id: string; data: UpdateUserRequest }>): Promise<User[]>;

    // Relationship operations (for future friend system)
    getFriends(userId: string): Promise<User[]>;
    getMutualConnections(userId1: string, userId2: string): Promise<User[]>;
}

// Prisma implementation of the repository
export class PrismaUserRepository implements IUserRepository {
    constructor(private prisma: any) {} // Prisma client will be injected

    async findById(id: string): Promise<User | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { id },
                include: this.getIncludeOptions()
            });

            return user ? this.transformUser(user) : null;
        } catch (error) {
            console.error('Error finding user by ID:', error);
            throw new Error('Failed to find user');
        }
    }

    async findByEmail(email: string): Promise<User | null> {
        try {
            const user = await this.prisma.user.findUnique({
                where: { email: email.toLowerCase() },
                include: this.getIncludeOptions()
            });

            return user ? this.transformUser(user) : null;
        } catch (error) {
            console.error('Error finding user by email:', error);
            throw new Error('Failed to find user');
        }
    }

    async findMany(
        page = 1,
        limit = 12,
        filters: UserFilters = {}
    ): Promise<UserListResponse> {
        try {
            const skip = (page - 1) * limit;
            const where = this.buildWhereClause(filters);

            const [users, total] = await Promise.all([
                this.prisma.user.findMany({
                    where,
                    skip,
                    take: limit,
                    include: this.getIncludeOptions(),
                    orderBy: { createdAt: 'desc' }
                }),
                this.prisma.user.count({ where })
            ]);

            return {
                users: users.map(user => this.transformUser(user)),
                total,
                page,
                limit
            };
        } catch (error) {
            console.error('Error finding users:', error);
            throw new Error('Failed to fetch users');
        }
    }

    async create(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
        try {
            const user = await this.prisma.user.create({
                data: {
                    ...userData,
                    email: userData.email.toLowerCase()
                },
                include: this.getIncludeOptions()
            });

            return this.transformUser(user);
        } catch (error) {
            console.error('Error creating user:', error);
            if (error.code === 'P2002') {
                throw new Error('User with this email already exists');
            }
            throw new Error('Failed to create user');
        }
    }

    async update(id: string, userData: UpdateUserRequest): Promise<User> {
        try {
            // Remove undefined values
            const cleanData = Object.entries(userData).reduce((acc, [key, value]) => {
                if (value !== undefined) {
                    acc[key] = value;
                }
                return acc;
            }, {} as any);

            const user = await this.prisma.user.update({
                where: { id },
                data: cleanData,
                include: this.getIncludeOptions()
            });

            return this.transformUser(user);
        } catch (error) {
            console.error('Error updating user:', error);
            if (error.code === 'P2025') {
                throw new Error('User not found');
            }
            throw new Error('Failed to update user');
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.prisma.user.delete({
                where: { id }
            });
        } catch (error) {
            console.error('Error deleting user:', error);
            if (error.code === 'P2025') {
                throw new Error('User not found');
            }
            throw new Error('Failed to delete user');
        }
    }

    async softDelete(id: string): Promise<void> {
        try {
            await this.prisma.user.update({
                where: { id },
                data: { isActive: false }
            });
        } catch (error) {
            console.error('Error soft deleting user:', error);
            throw new Error('Failed to deactivate user');
        }
    }

    async search(query: string, currentUserId?: string, limit = 10): Promise<User[]> {
        try {
            const searchTerms = query.toLowerCase().split(' ').filter(term => term.length > 0);

            if (searchTerms.length === 0) return [];

            const where = {
                AND: [
                    { isActive: true },
                    ...(currentUserId ? [{ NOT: { id: currentUserId } }] : []),
                    {
                        OR: searchTerms.flatMap(term => [
                            { name: { contains: term, mode: 'insensitive' } },
                            { email: { contains: term, mode: 'insensitive' } },
                            { bio: { contains: term, mode: 'insensitive' } },
                            { location: { contains: term, mode: 'insensitive' } },
                            { specialties: { hasSome: [term] } }
                        ])
                    }
                ]
            };

            const users = await this.prisma.user.findMany({
                where,
                take: limit,
                include: this.getIncludeOptions(),
                orderBy: [
                    { name: 'asc' }
                ]
            });

            return users.map(user => this.transformUser(user));
        } catch (error) {
            console.error('Error searching users:', error);
            throw new Error('Failed to search users');
        }
    }

    async findByRole(role: string, page = 1, limit = 12): Promise<UserListResponse> {
        return this.findMany(page, limit, { role: role as any });
    }

    async findByLevel(level: string, page = 1, limit = 12): Promise<UserListResponse> {
        return this.findMany(page, limit, { level: level as any });
    }

    async findByLocation(location: string, page = 1, limit = 12): Promise<UserListResponse> {
        return this.findMany(page, limit, { location });
    }

    async count(): Promise<number> {
        try {
            return await this.prisma.user.count({
                where: { isActive: true }
            });
        } catch (error) {
            console.error('Error counting users:', error);
            throw new Error('Failed to count users');
        }
    }

    async countByRole(): Promise<Record<string, number>> {
        try {
            const roleCounts = await this.prisma.user.groupBy({
                by: ['role'],
                where: { isActive: true },
                _count: { role: true }
            });

            return roleCounts.reduce((acc, item) => {
                acc[item.role] = item._count.role;
                return acc;
            }, {} as Record<string, number>);
        } catch (error) {
            console.error('Error counting users by role:', error);
            throw new Error('Failed to get role statistics');
        }
    }

    async countByLevel(): Promise<Record<string, number>> {
        try {
            const levelCounts = await this.prisma.user.groupBy({
                by: ['level'],
                where: {
                    isActive: true,
                    level: { not: null }
                },
                _count: { level: true }
            });

            return levelCounts.reduce((acc, item) => {
                if (item.level) {
                    acc[item.level] = item._count.level;
                }
                return acc;
            }, {} as Record<string, number>);
        } catch (error) {
            console.error('Error counting users by level:', error);
            throw new Error('Failed to get level statistics');
        }
    }

    async getRecentUsers(limit = 10): Promise<User[]> {
        try {
            const users = await this.prisma.user.findMany({
                where: { isActive: true },
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: this.getIncludeOptions()
            });

            return users.map(user => this.transformUser(user));
        } catch (error) {
            console.error('Error getting recent users:', error);
            throw new Error('Failed to get recent users');
        }
    }

    async createMany(users: Array<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User[]> {
        try {
            const createdUsers = await Promise.all(
                users.map(userData => this.create(userData))
            );
            return createdUsers;
        } catch (error) {
            console.error('Error creating multiple users:', error);
            throw new Error('Failed to create users');
        }
    }

    async updateMany(updates: Array<{ id: string; data: UpdateUserRequest }>): Promise<User[]> {
        try {
            const updatedUsers = await Promise.all(
                updates.map(({ id, data }) => this.update(id, data))
            );
            return updatedUsers;
        } catch (error) {
            console.error('Error updating multiple users:', error);
            throw new Error('Failed to update users');
        }
    }

    async getFriends(userId: string): Promise<User[]> {
        // Placeholder for future friend system implementation
        try {
            // This would join with FriendRequest table when implemented
            const friendships = await this.prisma.friendRequest.findMany({
                where: {
                    OR: [
                        { senderId: userId, status: 'ACCEPTED' },
                        { receiverId: userId, status: 'ACCEPTED' }
                    ]
                },
                include: {
                    sender: { include: this.getIncludeOptions() },
                    receiver: { include: this.getIncludeOptions() }
                }
            });

            const friends = friendships.map(friendship => {
                const friend = friendship.senderId === userId
                    ? friendship.receiver
                    : friendship.sender;
                return this.transformUser(friend);
            });

            return friends;
        } catch (error) {
            // If friend system not implemented yet, return empty array
            console.warn('Friend system not implemented yet');
            return [];
        }
    }

    async getMutualConnections(userId1: string, userId2: string): Promise<User[]> {
        // Placeholder for mutual connections feature
        try {
            const [user1Friends, user2Friends] = await Promise.all([
                this.getFriends(userId1),
                this.getFriends(userId2)
            ]);

            const mutualFriends = user1Friends.filter(friend1 =>
                user2Friends.some(friend2 => friend2.id === friend1.id)
            );

            return mutualFriends;
        } catch (error) {
            console.warn('Mutual connections feature not implemented yet');
            return [];
        }
    }

    // Private helper methods
    private getIncludeOptions() {
        return {
            // Add any relations you want to include
            // For now, we don't have relations defined
        };
    }

    private buildWhereClause(filters: UserFilters) {
        const where: any = {
            isActive: true
        };

        if (filters.role) {
            where.role = filters.role;
        }

        if (filters.level) {
            where.level = filters.level;
        }

        if (filters.location) {
            where.location = {
                contains: filters.location,
                mode: 'insensitive'
            };
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            where.OR = [
                { name: { contains: searchTerm, mode: 'insensitive' } },
                { email: { contains: searchTerm, mode: 'insensitive' } },
                { bio: { contains: searchTerm, mode: 'insensitive' } },
                { location: { contains: searchTerm, mode: 'insensitive' } },
                { specialties: { hasSome: [searchTerm] } }
            ];
        }

        return where;
    }

    private transformUser(prismaUser: any): User {
        return {
            id: prismaUser.id,
            email: prismaUser.email,
            name: prismaUser.name,
            avatar: prismaUser.avatar,
            phone: prismaUser.phone,
            bio: prismaUser.bio,
            role: prismaUser.role,
            level: prismaUser.level,
            experience: prismaUser.experience,
            location: prismaUser.location,
            isActive: prismaUser.isActive,
            createdAt: new Date(prismaUser.createdAt),
            updatedAt: new Date(prismaUser.updatedAt),
            certifications: prismaUser.certifications || [],
            hourlyRate: prismaUser.hourlyRate ? parseFloat(prismaUser.hourlyRate) : undefined,
            specialties: prismaUser.specialties || []
        };
    }
}

// Mock implementation for testing
export class MockUserRepository implements IUserRepository {
    private users: User[] = [];
    private nextId = 1;

    async findById(id: string): Promise<User | null> {
        return this.users.find(user => user.id === id) || null;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.users.find(user => user.email.toLowerCase() === email.toLowerCase()) || null;
    }

    async findMany(page = 1, limit = 12, filters: UserFilters = {}): Promise<UserListResponse> {
        let filteredUsers = this.users.filter(user => user.isActive);

        if (filters.role) {
            filteredUsers = filteredUsers.filter(user => user.role === filters.role);
        }

        if (filters.level) {
            filteredUsers = filteredUsers.filter(user => user.level === filters.level);
        }

        if (filters.location) {
            filteredUsers = filteredUsers.filter(user =>
                user.location?.toLowerCase().includes(filters.location!.toLowerCase())
            );
        }

        if (filters.search) {
            const searchTerm = filters.search.toLowerCase();
            filteredUsers = filteredUsers.filter(user =>
                user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.bio?.toLowerCase().includes(searchTerm) ||
                user.location?.toLowerCase().includes(searchTerm)
            );
        }

        const startIndex = (page - 1) * limit;
        const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);

        return {
            users: paginatedUsers,
            total: filteredUsers.length,
            page,
            limit
        };
    }

    async create(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
        const user: User = {
            ...userData,
            id: userData.id || this.nextId++.toString(),
            createdAt: new Date(),
            updatedAt: new Date()
        };

        this.users.push(user);
        return user;
    }

    async update(id: string, userData: UpdateUserRequest): Promise<User> {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        this.users[userIndex] = {
            ...this.users[userIndex],
            ...userData,
            updatedAt: new Date()
        };

        return this.users[userIndex];
    }

    async delete(id: string): Promise<void> {
        const userIndex = this.users.findIndex(user => user.id === id);
        if (userIndex === -1) {
            throw new Error('User not found');
        }

        this.users.splice(userIndex, 1);
    }

    async softDelete(id: string): Promise<void> {
        const user = await this.findById(id);
        if (!user) {
            throw new Error('User not found');
        }

        await this.update(id, { isActive: false } as UpdateUserRequest);
    }

    async search(query: string, currentUserId?: string, limit = 10): Promise<User[]> {
        const searchTerm = query.toLowerCase();
        let filteredUsers = this.users.filter(user =>
            user.isActive &&
            user.id !== currentUserId &&
            (user.name.toLowerCase().includes(searchTerm) ||
                user.email.toLowerCase().includes(searchTerm) ||
                user.bio?.toLowerCase().includes(searchTerm) ||
                user.location?.toLowerCase().includes(searchTerm))
        );

        return filteredUsers.slice(0, limit);
    }

    async findByRole(role: string, page = 1, limit = 12): Promise<UserListResponse> {
        return this.findMany(page, limit, { role: role as any });
    }

    async findByLevel(level: string, page = 1, limit = 12): Promise<UserListResponse> {
        return this.findMany(page, limit, { level: level as any });
    }

    async findByLocation(location: string, page = 1, limit = 12): Promise<UserListResponse> {
        return this.findMany(page, limit, { location });
    }

    async count(): Promise<number> {
        return this.users.filter(user => user.isActive).length;
    }

    async countByRole(): Promise<Record<string, number>> {
        const activeUsers = this.users.filter(user => user.isActive);
        const roleCounts: Record<string, number> = {};

        activeUsers.forEach(user => {
            roleCounts[user.role] = (roleCounts[user.role] || 0) + 1;
        });

        return roleCounts;
    }

    async countByLevel(): Promise<Record<string, number>> {
        const activeUsers = this.users.filter(user => user.isActive && user.level);
        const levelCounts: Record<string, number> = {};

        activeUsers.forEach(user => {
            if (user.level) {
                levelCounts[user.level] = (levelCounts[user.level] || 0) + 1;
            }
        });

        return levelCounts;
    }

    async getRecentUsers(limit = 10): Promise<User[]> {
        const activeUsers = this.users.filter(user => user.isActive);
        return activeUsers
            .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
            .slice(0, limit);
    }

    async createMany(users: Array<Omit<User, 'id' | 'createdAt' | 'updatedAt'>>): Promise<User[]> {
        const createdUsers: User[] = [];
        for (const userData of users) {
            createdUsers.push(await this.create(userData));
        }
        return createdUsers;
    }

    async updateMany(updates: Array<{ id: string; data: UpdateUserRequest }>): Promise<User[]> {
        const updatedUsers: User[] = [];
        for (const { id, data } of updates) {
            updatedUsers.push(await this.update(id, data));
        }
        return updatedUsers;
    }

    async getFriends(userId: string): Promise<User[]> {
        // Mock implementation - return empty array
        return [];
    }

    async getMutualConnections(userId1: string, userId2: string): Promise<User[]> {
        // Mock implementation - return empty array
        return [];
    }
}