// Simplified authentication system
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'PLAYER' | 'COACH';
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
}

class AuthManager {
  private storageKey = 'auth-user';

  getStoredAuth(): User | null {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  setStoredAuth(user: User | null): void {
    if (typeof window === 'undefined') return;
    
    if (user) {
      localStorage.setItem(this.storageKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this.storageKey);
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Login failed' };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        createdAt: data.user.createdAt,
      };

      this.setStoredAuth(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  async register(userData: { name: string; email: string; password: string; role: string }): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        return { success: false, error: data.error || 'Registration failed' };
      }

      const user: User = {
        id: data.user.id,
        email: data.user.email,
        name: data.user.name,
        role: data.user.role,
        createdAt: data.user.createdAt,
      };

      this.setStoredAuth(user);
      return { success: true, user };
    } catch (error) {
      return { success: false, error: 'Network error' };
    }
  }

  logout(): void {
    this.setStoredAuth(null);
  }
}

export const authManager = new AuthManager();