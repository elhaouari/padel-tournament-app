import { prisma } from '../lib/prisma';
import { User, CreateUserRequest, UpdateUserRequest, UserFilters, UserListResponse } from '../types';

export interface IUserRepository {
    getUsers(page?: number, limit?: number, filters?: UserFilters): Promise<UserListResponse>;
    getUserById(id: string): Promise<User | null>;
    getUserByEmail(email: string): Promise<User | null>;
    createUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User>;
    updateUser(id: string, user: UpdateUserRequest): Promise<User>;
    deleteUser(id: string): Promise<void>;
    searchUsers(query: string, currentUserId?: string): Promise<User[]>;
}

export class UserRepository implements IUserRepository {
    async getUsers(page = 1, limit = 12, filters: UserFilters = {}): Promise<UserListResponse> {
        const skip = (page - 1) * limit;

        const where: any = {
            isActive: true,
            ...(filters.role && { role: filters.role }),
            ...(filters.level && { level: filters.level }),
            ...(filters.location && { location: { contains: filters.location, mode: 'insensitive' } }),
            ...(filters.search && {
                OR: [
                    { name: { contains: filters.search, mode: 'insensitive' } },
                    { bio: { contains: filters.search, mode: 'insensitive' } },
                ]
            })
        };

        const [users, total] = await Promise.all([
            prisma.user.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.user.count({ where })
        ]);

        return {
            users,
            total,
            page,
            limit
        };
    }

    async getUserById(id: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { id }
        });
    }

    async getUserByEmail(email: string): Promise<User | null> {
        return await prisma.user.findUnique({
            where: { email }
        });
    }

    async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
        return await prisma.user.create({
            data: userData
        });
    }

    async updateUser(id: string, userData: UpdateUserRequest): Promise<User> {
        return await prisma.user.update({
            where: { id },
            data: userData
        });
    }

    async deleteUser(id: string): Promise<void> {
        await prisma.user.update({
            where: { id },
            data: { isActive: false }
        });
    }

    async searchUsers(query: string, currentUserId?: string): Promise<User[]> {
        return await prisma.user.findMany({
            where: {
                isActive: true,
                ...(currentUserId && { NOT: { id: currentUserId } }),
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { location: { contains: query, mode: 'insensitive' } },
                    { bio: { contains: query, mode: 'insensitive' } }
                ]
            },
            take: 10,
            orderBy: { name: 'asc' }
        });
    }
}