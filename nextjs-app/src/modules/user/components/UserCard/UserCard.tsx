'use client';

import React, { useState } from 'react';
import { User, UserRole } from '../../types';
import { formatDate, getPadelLevelColor, getRoleIcon } from '../../utils';
import styles from './UserCard.module.css';

interface UserCardProps {
    user: User;
    onViewProfile?: (user: User) => void;
    onConnect?: (user: User) => void;
    showConnectButton?: boolean;
}

export const UserCard: React.FC<UserCardProps> = ({
                                                      user,
                                                      onViewProfile,
                                                      onConnect,
                                                      showConnectButton = false
                                                  }) => {
    const [imageError, setImageError] = useState(false);

    const handleImageError = () => {
        setImageError(true);
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .join('')
            .slice(0, 2);
    };

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <div className={styles.avatarContainer}>
                    {user.avatar && !imageError ? (
                        <img
                            src={user.avatar}
                            alt={user.name}
                            className={styles.avatar}
                            onError={handleImageError}
                        />
                    ) : (
                        <div className={styles.avatarFallback}>
                            {getInitials(user.name)}
                        </div>
                    )}
                    <div className={styles.roleIndicator}>
            <span className={`${styles.roleIcon} ${styles[user.role.toLowerCase()]}`}>
              {getRoleIcon(user.role)}
            </span>
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                <h3 className={styles.name}>{user.name}</h3>
                <p className={styles.role}>
                    {user.role === UserRole.COACH ? '🎾 Coach' : '🏆 Player'}
                </p>

                {user.location && (
                    <p className={styles.location}>📍 {user.location}</p>
                )}

                {user.role === UserRole.PLAYER && user.level && (
                    <div className={styles.levelBadge}>
            <span
                className={styles.levelIndicator}
                style={{ backgroundColor: getPadelLevelColor(user.level) }}
            />
                        <span className={styles.levelText}>
              {user.level.charAt(0) + user.level.slice(1).toLowerCase()}
            </span>
                    </div>
                )}

                {user.role === UserRole.COACH && user.hourlyRate && (
                    <p className={styles.hourlyRate}>💰 €{user.hourlyRate}/hour</p>
                )}

                {user.bio && (
                    <p className={styles.bio}>{user.bio}</p>
                )}

                <p className={styles.memberSince}>
                    Member since {formatDate(user.createdAt)}
                </p>
            </div>

            <div className={styles.actions}>
                <button
                    onClick={() => onViewProfile?.(user)}
                    className={styles.viewButton}
                >
                    View Profile
                </button>
                {showConnectButton && (
                    <button
                        onClick={() => onConnect?.(user)}
                        className={styles.connectButton}
                    >
                        Connect
                    </button>
                )}
            </div>
        </div>
    );
};