// Simplified Users List
'use client';

import { useState } from 'react';
import { useUsers, useAuth } from '@/lib/hooks';
import { UserCard } from './UserCard';
import { ProtectedRoute } from './ProtectedRoute';
import { useRouter } from 'next/navigation';
import { UserFilters } from '@/lib/users';

export function UsersList() {
  const router = useRouter();
  const { user: currentUser } = useAuth();
  const [filters, setFilters] = useState<UserFilters>({});
  const { users, loading, error } = useUsers(filters);

  const handleViewProfile = (user: any) => {
    router.push(`/users/${user.id}`);
  };

  return (
    <ProtectedRoute>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Directory</h1>
          <p className="text-gray-600">Connect with players and coaches from around the world</p>
        </div>

        {/* Filters */}
        <div className="mb-6 flex flex-wrap gap-4">
          <select
            value={filters.role || ''}
            onChange={(e) => setFilters({ ...filters, role: e.target.value as any || undefined })}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Roles</option>
            <option value="PLAYER">Players</option>
            <option value="COACH">Coaches</option>
          </select>

          <input
            type="text"
            placeholder="Search users..."
            value={filters.search || ''}
            onChange={(e) => setFilters({ ...filters, search: e.target.value || undefined })}
            className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 flex-1 max-w-md"
          />
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading users...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
              {error}
            </div>
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No users found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                onViewProfile={handleViewProfile}
                showConnectButton={user.id !== currentUser?.id}
              />
            ))}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}