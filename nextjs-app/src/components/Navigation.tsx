// Simplified Navigation
'use client';

import { useAuth } from '@/lib/hooks';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export function Navigation() {
  const { isAuthenticated, user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-xl font-bold text-gray-900">
              Padel App
            </Link>
            
            {isAuthenticated && (
              <div className="hidden md:flex space-x-4">
                <Link 
                  href="/users" 
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Users
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user?.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden md:block text-gray-700">{user?.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <Link 
                  href="/auth/login"
                  className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
                >
                  Login
                </Link>
                <Link 
                  href="/auth/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}