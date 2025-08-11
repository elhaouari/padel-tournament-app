// Simplified user services
import { User } from './auth';

export interface UserFilters {
  role?: 'PLAYER' | 'COACH';
  search?: string;
}

export interface UsersResponse {
  users: User[];
  total: number;
}

class UserService {
  async getUsers(page = 1, limit = 12, filters: UserFilters = {}): Promise<UsersResponse> {
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...filters,
      });

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch users');
      }

      return data;
    } catch (error) {
      console.error('Error fetching users:', error);
      return { users: [], total: 0 };
    }
  }

  async getUserById(id: string): Promise<User | null> {
    try {
      const response = await fetch(`/api/users/${id}`);
      const data = await response.json();

      if (!response.ok) {
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User | null> {
    try {
      const response = await fetch(`/api/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update user');
      }

      return data;
    } catch (error) {
      console.error('Error updating user:', error);
      return null;
    }
  }

  async searchUsers(query: string): Promise<User[]> {
    try {
      const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
      const data = await response.json();

      if (!response.ok) {
        return [];
      }

      return data;
    } catch (error) {
      console.error('Error searching users:', error);
      return [];
    }
  }
}

export const userService = new UserService();