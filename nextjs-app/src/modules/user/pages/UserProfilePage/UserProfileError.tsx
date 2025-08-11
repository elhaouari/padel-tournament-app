'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import styles from './UserProfileError.module.css';

interface UserProfileErrorProps {
    error: string;
    userId?: string;
    type?: 'not-found' | 'unauthorized' | 'network' | 'server' | 'generic';
    onRetry?: () => void;
}

export const UserProfileError: React.FC<UserProfileErrorProps> = ({
                                                                      error,
                                                                      userId,
                                                                      type = 'generic',
                                                                      onRetry
                                                                  }) => {
    const router = useRouter();

    const getErrorConfig = () => {
        switch (type) {
            case 'not-found':
                return {
                    icon: '👤',
                    title: 'User Not Found',
                    description: 'The user profile you\'re looking for doesn\'t exist or has been removed.',
                    primaryAction: {
                        label: 'Browse All Users',
                        action: () => router.push('/users')
                    },
                    secondaryAction: {
                        label: 'Go Home',
                        action: () => router.push('/')
                    }
                };

            case 'unauthorized':
                return {
                    icon: '🔒',
                    title: 'Access Denied',
                    description: 'You don\'t have permission to view this profile. Please sign in or check your permissions.',
                    primaryAction: {
                        label: 'Sign In',
                        action: () => router.push('/auth/login')
                    },
                    secondaryAction: {
                        label: 'Go Home',
                        action: () => router.push('/')
                    }
                };

            case 'network':
                return {
                    icon: '📡',
                    title: 'Connection Problem',
                    description: 'Unable to load the profile due to network issues. Please check your connection and try again.',
                    primaryAction: {
                        label: 'Retry',
                        action: onRetry || (() => window.location.reload())
                    },
                    secondaryAction: {
                        label: 'Go Back',
                        action: () => router.back()
                    }
                };

            case 'server':
                return {
                    icon: '⚙️',
                    title: 'Server Error',
                    description: 'Our servers are experiencing issues. Please try again in a few moments.',
                    primaryAction: {
                        label: 'Retry',
                        action: onRetry || (() => window.location.reload())
                    },
                    secondaryAction: {
                        label: 'Go Home',
                        action: () => router.push('/')
                    }
                };

            default:
                return {
                    icon: '❌',
                    title: 'Something Went Wrong',
                    description: error || 'An unexpected error occurred while loading the profile.',
                    primaryAction: {
                        label: 'Try Again',
                        action: onRetry || (() => window.location.reload())
                    },
                    secondaryAction: {
                        label: 'Go Back',
                        action: () => router.back()
                    }
                };
        }
    };

    const config = getErrorConfig();

    return (
        <div className={styles.container}>
            <div className={styles.errorCard}>
                <div className={styles.iconContainer}>
                    <span className={styles.icon}>{config.icon}</span>
                </div>

                <div className={styles.content}>
                    <h1 className={styles.title}>{config.title}</h1>
                    <p className={styles.description}>{config.description}</p>

                    {error && error !== config.description && (
                        <details className={styles.errorDetails}>
                            <summary>Error Details</summary>
                            <code className={styles.errorMessage}>{error}</code>
                        </details>
                    )}

                    {userId && (
                        <div className={styles.userId}>
                            <span className={styles.userIdLabel}>User ID:</span>
                            <code className={styles.userIdValue}>{userId}</code>
                        </div>
                    )}
                </div>

                <div className={styles.actions}>
                    <button
                        onClick={config.primaryAction.action}
                        className={styles.primaryButton}
                    >
                        {config.primaryAction.label}
                    </button>

                    <button
                        onClick={config.secondaryAction.action}
                        className={styles.secondaryButton}
                    >
                        {config.secondaryAction.label}
                    </button>
                </div>

                {/* Additional help section */}
                <div className={styles.helpSection}>
                    <h3 className={styles.helpTitle}>Need Help?</h3>
                    <div className={styles.helpLinks}>
                        <button
                            onClick={() => router.push('/users')}
                            className={styles.helpLink}
                        >
                            Browse All Users
                        </button>
                        <button
                            onClick={() => router.push('/support')}
                            className={styles.helpLink}
                        >
                            Contact Support
                        </button>
                        <button
                            onClick={() => router.push('/help')}
                            className={styles.helpLink}
                        >
                            Help Center
                        </button>
                    </div>
                </div>
            </div>

            {/* Background decoration */}
            <div className={styles.backgroundDecoration}>
                <div className={styles.decorationElement}></div>
                <div className={styles.decorationElement}></div>
                <div className={styles.decorationElement}></div>
            </div>
        </div>
    );
};

// Specialized error components for common use cases
export const UserNotFoundError: React.FC<{ userId: string; onRetry?: () => void }> = ({
                                                                                          userId,
                                                                                          onRetry
                                                                                      }) => (
    <UserProfileError
        error="User not found"
        userId={userId}
        type="not-found"
        onRetry={onRetry}
    />
);

export const UnauthorizedError: React.FC<{ userId?: string }> = ({ userId }) => (
    <UserProfileError
        error="Access denied"
        userId={userId}
        type="unauthorized"
    />
);

export const NetworkError: React.FC<{ userId?: string; onRetry: () => void }> = ({
                                                                                     userId,
                                                                                     onRetry
                                                                                 }) => (
    <UserProfileError
        error="Network error"
        userId={userId}
        type="network"
        onRetry={onRetry}
    />
);

export const ServerError: React.FC<{ userId?: string; onRetry: () => void }> = ({
                                                                                    userId,
                                                                                    onRetry
                                                                                }) => (
    <UserProfileError
        error="Server error"
        userId={userId}
        type="server"
        onRetry={onRetry}
    />
);

export default UserProfileError;