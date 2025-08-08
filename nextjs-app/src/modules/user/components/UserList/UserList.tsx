'use client';

import React from 'react';
import { User } from '../../types';
import { UserCard } from '../UserCard';
import styles from './UserList.module.css';

interface UserListProps {
    users: User[];
    loading?: boolean;
    error?: string | null;
    onViewProfile?: (user: User) => void;
    onConnect?: (user: User) => void;
    showConnectButton?: boolean;
    emptyMessage?: string;
    emptyDescription?: string;
}

export const UserList: React.FC<UserListProps> = ({
                                                      users,
                                                      loading = false,
                                                      error,
                                                      onViewProfile,
                                                      onConnect,
                                                      showConnectButton = false,
                                                      emptyMessage = 'No users found',
                                                      emptyDescription = 'Try adjusting your filters or search criteria'
                                                  }) => {
    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading users...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <div className={styles.errorIcon}>⚠️</div>
                    <h3>Error loading users</h3>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    if (users.length === 0) {
        return (
            <div className={styles.container}>
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>👥</div>
                    <h3>{emptyMessage}</h3>
                    <p>{emptyDescription}</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.grid}>
                {users.map(user => (
                    <UserCard
                        key={user.id}
                        user={user}
                        onViewProfile={onViewProfile}
                        onConnect={onConnect}
                        showConnectButton={showConnectButton}
                    />
                ))}
            </div>
        </div>
    );
};