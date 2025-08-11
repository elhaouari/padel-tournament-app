'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { UserList, UserFilter, Pagination } from '../../components';
import { useUsers, useAuth, useDebounce } from '../../hooks';
import { User, UserRole, UserLevel, UserFilters } from '../../types';
import { handleApiError } from '../../utils';
import styles from './UserListPage.module.css';

interface UserListPageProps {
    initialFilters?: UserFilters;
    hideFilters?: boolean;
    maxUsers?: number;
    showStats?: boolean;
}

export const UserListPage: React.FC<UserListPageProps> = ({
                                                              initialFilters = {},
                                                              hideFilters = false,
                                                              maxUsers,
                                                              showStats = true
                                                          }) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user: currentUser, isAuthenticated } = useAuth();

    // Parse URL parameters for filters and pagination
    const [filters, setFilters] = useState<UserFilters>(() => ({
        role: (searchParams?.get('role') as UserRole) || initialFilters.role,
        level: (searchParams?.get('level') as UserLevel) || initialFilters.level,
        location: searchParams?.get('location') || initialFilters.location,
        search: searchParams?.get('search') || initialFilters.search || ''
    }));

    const [currentPage, setCurrentPage] = useState(() => {
        const page = searchParams?.get('page');
        return page ? parseInt(page, 10) : 1;
    });

    const pageSize = maxUsers || 12;

    // Debounce search to avoid too many API calls
    const debouncedSearch = useDebounce(filters.search || '', 300);

    // Update filters when debounced search changes
    const debouncedFilters = {
        ...filters,
        search: debouncedSearch
    };

    // Fetch users with current filters
    const {
        users,
        loading,
        error,
        pagination,
        stats,
        refresh
    } = useUsers({
        page: currentPage,
        limit: pageSize,
        filters: debouncedFilters,
        includeStats: showStats
    });

    // State for user interactions
    const [connectingUsers, setConnectingUsers] = useState<Set<string>>(new Set());
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    // Update URL when filters or page change
    useEffect(() => {
        const params = new URLSearchParams();

        if (filters.role) params.set('role', filters.role);
        if (filters.level) params.set('level', filters.level);
        if (filters.location) params.set('location', filters.location);
        if (filters.search) params.set('search', filters.search);
        if (currentPage > 1) params.set('page', currentPage.toString());

        const newUrl = params.toString() ? `?${params.toString()}` : '';
        const currentUrl = window.location.search;

        if (newUrl !== currentUrl) {
            router.replace(`/users${newUrl}`, { scroll: false });
        }
    }, [filters, currentPage, router]);

    // Reset to first page when filters change
    useEffect(() => {
        if (currentPage > 1) {
            setCurrentPage(1);
        }
    }, [debouncedFilters.role, debouncedFilters.level, debouncedFilters.location, debouncedSearch]);

    // Handle filter changes
    const handleFiltersChange = (newFilters: UserFilters) => {
        setFilters(newFilters);
        setErrorMessage(null);
    };

    // Handle page changes
    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        // Scroll to top when page changes
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle viewing user profile
    const handleViewProfile = (user: User) => {
        router.push(`/users/${user.id}`);
    };

    // Handle connecting with user
    const handleConnectUser = async (user: User) => {
        if (!isAuthenticated || !currentUser) {
            router.push('/auth/login');
            return;
        }

        setConnectingUsers(prev => new Set(prev).add(user.id));
        setErrorMessage(null);

        try {
            // TODO: Implement friend request functionality
            // await sendFriendRequest(user.id);

            // For now, just show a success message
            setSuccessMessage(`Connection request sent to ${user.name}!`);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (error) {
            setErrorMessage(handleApiError(error));
        } finally {
            setConnectingUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(user.id);
                return newSet;
            });
        }
    };

    // Handle retry on error
    const handleRetry = () => {
        setErrorMessage(null);
        refresh();
    };

    // Handle clearing all filters
    const handleClearFilters = () => {
        setFilters({});
        setCurrentPage(1);
    };

    // Check if user is connecting
    const isConnecting = (userId: string) => connectingUsers.has(userId);

    return (
        <div className={styles.container}>
            {/* Page Header */}
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <h1 className={styles.title}>User Directory</h1>
                    <p className={styles.subtitle}>
                        Connect with players and coaches from around the world
                    </p>
                </div>

                {/* Quick Stats */}
                {showStats && stats && (
                    <div className={styles.statsContainer}>
                        <div className={styles.statsGrid}>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{stats.totalUsers}</span>
                                <span className={styles.statLabel}>Total Users</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{stats.totalPlayers}</span>
                                <span className={styles.statLabel}>Players</span>
                            </div>
                            <div className={styles.statItem}>
                                <span className={styles.statValue}>{stats.totalCoaches}</span>
                                <span className={styles.statLabel}>Coaches</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
                <div className={styles.successMessage}>
                    <span className={styles.successIcon}>✅</span>
                    {successMessage}
                </div>
            )}

            {errorMessage && (
                <div className={styles.errorMessage}>
                    <span className={styles.errorIcon}>❌</span>
                    {errorMessage}
                    <button onClick={handleRetry} className={styles.retryButton}>
                        Retry
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div className={styles.content}>
                {/* Filters Section */}
                {!hideFilters && (
                    <div className={styles.filtersSection}>
                        <UserFilter
                            filters={filters}
                            onFiltersChange={handleFiltersChange}
                            loading={loading}
                        />

                        {/* Active Filters & Clear */}
                        {(filters.role || filters.level || filters.location || filters.search) && (
                            <div className={styles.activeFilters}>
                                <span className={styles.activeFiltersLabel}>Active filters:</span>
                                <div className={styles.filterTags}>
                                    {filters.role && (
                                        <span className={styles.filterTag}>
                                            Role: {filters.role}
                                            <button
                                                onClick={() => handleFiltersChange({ ...filters, role: undefined })}
                                                className={styles.removeFilter}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {filters.level && (
                                        <span className={styles.filterTag}>
                                            Level: {filters.level}
                                            <button
                                                onClick={() => handleFiltersChange({ ...filters, level: undefined })}
                                                className={styles.removeFilter}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {filters.location && (
                                        <span className={styles.filterTag}>
                                            Location: {filters.location}
                                            <button
                                                onClick={() => handleFiltersChange({ ...filters, location: undefined })}
                                                className={styles.removeFilter}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                    {filters.search && (
                                        <span className={styles.filterTag}>
                                            Search: "{filters.search}"
                                            <button
                                                onClick={() => handleFiltersChange({ ...filters, search: '' })}
                                                className={styles.removeFilter}
                                            >
                                                ×
                                            </button>
                                        </span>
                                    )}
                                </div>
                                <button
                                    onClick={handleClearFilters}
                                    className={styles.clearFilters}
                                >
                                    Clear All
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Results Summary */}
                <div className={styles.resultsHeader}>
                    <div className={styles.resultsInfo}>
                        {loading ? (
                            <span>Loading users...</span>
                        ) : (
                            <span>
                                {pagination.total > 0 ? (
                                    <>
                                        Showing {((currentPage - 1) * pageSize) + 1}-{Math.min(currentPage * pageSize, pagination.total)} of {pagination.total} users
                                    </>
                                ) : (
                                    'No users found'
                                )}
                            </span>
                        )}
                    </div>

                    {/* View Options */}
                    <div className={styles.viewOptions}>
                        <button
                            onClick={() => router.push('/users/coaches')}
                            className={styles.viewOptionButton}
                        >
                            View Coaches
                        </button>
                        <button
                            onClick={() => router.push('/users/players')}
                            className={styles.viewOptionButton}
                        >
                            View Players
                        </button>
                    </div>
                </div>

                {/* User List */}
                <div className={styles.userListContainer}>
                    <UserList
                        users={users}
                        loading={loading}
                        onViewProfile={handleViewProfile}
                        onConnect={handleConnectUser}
                        showConnectButton={true}
                        connectingUsers={connectingUsers}
                        currentUserId={currentUser?.id}
                        emptyMessage="No users found"
                        emptyDescription="Try adjusting your filters or search terms"
                    />
                </div>

                {/* Pagination */}
                {pagination.total > pageSize && (
                    <div className={styles.paginationContainer}>
                        <Pagination
                            currentPage={currentPage}
                            totalPages={Math.ceil(pagination.total / pageSize)}
                            totalItems={pagination.total}
                            itemsPerPage={pageSize}
                            onPageChange={handlePageChange}
                            loading={loading}
                        />
                    </div>
                )}
            </div>

            {/* Development Info */}
            {process.env.NODE_ENV === 'development' && (
                <div className={styles.devInfo}>
                    <details>
                        <summary>Debug Information</summary>
                        <pre>{JSON.stringify({
                            filters,
                            debouncedFilters,
                            currentPage,
                            pageSize,
                            pagination,
                            usersCount: users.length,
                            loading,
                            error,
                            isAuthenticated,
                            currentUserId: currentUser?.id
                        }, null, 2)}</pre>
                    </details>
                </div>
            )}
        </div>
    );
};

// Higher-order components for specific routes
export const CoachesListPage: React.FC = () => (
    <UserListPage
        initialFilters={{ role: UserRole.COACH }}
        showStats={true}
    />
);

export const PlayersListPage: React.FC = () => (
    <UserListPage
        initialFilters={{ role: UserRole.PLAYER }}
        showStats={true}
    />
);

// Compact version for embedding in other pages
export const CompactUserList: React.FC<{ maxUsers?: number }> = ({ maxUsers = 6 }) => (
    <UserListPage
        hideFilters={true}
        maxUsers={maxUsers}
        showStats={false}
    />
);

// Wrapper for Next.js App Router
export const UserListPageWrapper: React.FC = () => {
    return <UserListPage />;
};

export default UserListPage;