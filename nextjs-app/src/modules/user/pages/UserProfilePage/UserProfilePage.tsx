'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserProfile, UserForm, UserList } from '../../components';
import { useAuth, useUser, useUsers } from '../../hooks';
import { User, UserRole } from '../../types';
import { handleApiError, formatDate } from '../../utils';
import styles from './UserProfilePage.module.css';

interface UserProfilePageProps {
    userId: string;
    mode?: 'view' | 'edit';
}

export const UserProfilePage: React.FC<UserProfilePageProps> = ({
                                                                    userId,
                                                                    mode = 'view'
                                                                }) => {
    const router = useRouter();
    const { user: currentUser, isAuthenticated, updateProfile } = useAuth();
    const { user: profileUser, loading, error, refresh } = useUser(userId);
    const { users: relatedUsers, loading: relatedLoading } = useUsers({
        role: profileUser?.role,
        location: profileUser?.location
    });

    const [currentMode, setCurrentMode] = useState<'view' | 'edit'>(mode);
    const [updateLoading, setUpdateLoading] = useState(false);
    const [updateError, setUpdateError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Check if current user can view this profile
    const isOwnProfile = currentUser?.id === userId;
    const canEdit = isOwnProfile;
    const canView = isAuthenticated && (isOwnProfile || profileUser?.isActive);

    // Handle unauthorized access
    useEffect(() => {
        if (!loading && !canView) {
            router.push('/auth/login');
        }
    }, [loading, canView, router]);

    // Handle edit mode
    const handleEditProfile = () => {
        if (canEdit) {
            setCurrentMode('edit');
            setUpdateError(null);
            setSuccessMessage(null);
        }
    };

    const handleCancelEdit = () => {
        setCurrentMode('view');
        setUpdateError(null);
        setSuccessMessage(null);
    };

    const handleSaveProfile = async (updateData: any) => {
        if (!canEdit || !profileUser) return;

        setUpdateLoading(true);
        setUpdateError(null);

        try {
            const result = await updateProfile(updateData);

            if (result.success) {
                setSuccessMessage('Profile updated successfully!');
                setCurrentMode('view');
                await refresh(); // Refresh profile data

                // Clear success message after 3 seconds
                setTimeout(() => setSuccessMessage(null), 3000);
            } else {
                setUpdateError(result.error || 'Failed to update profile');
            }
        } catch (error) {
            setUpdateError(handleApiError(error));
        } finally {
            setUpdateLoading(false);
        }
    };

    const handleViewOtherProfile = (user: User) => {
        router.push(`/users/${user.id}`);
    };

    const handleConnectUser = (user: User) => {
        // Placeholder for future friend request feature
        console.log('Connect with user:', user.name);
        // TODO: Implement friend request functionality
    };

    // Show loading state
    if (loading) {
        return (
            <div className={styles.container}>
                <div className={styles.loading}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    // Show error state
    if (error && !profileUser) {
        return (
            <div className={styles.container}>
                <div className={styles.error}>
                    <div className={styles.errorIcon}>❌</div>
                    <h2>Profile Not Found</h2>
                    <p>{error}</p>
                    <button
                        onClick={() => router.push('/users')}
                        className={styles.backButton}
                    >
                        Back to Users
                    </button>
                </div>
            </div>
        );
    }

    // Show unauthorized state
    if (!canView) {
        return (
            <div className={styles.container}>
                <div className={styles.unauthorized}>
                    <div className={styles.errorIcon}>🔒</div>
                    <h2>Access Denied</h2>
                    <p>You don't have permission to view this profile.</p>
                    <button
                        onClick={() => router.push('/auth/login')}
                        className={styles.loginButton}
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    // Main profile display
    if (!profileUser) return null;

    return (
        <div className={styles.container}>
            {/* Navigation Header */}
            <div className={styles.header}>
                <button
                    onClick={() => router.back()}
                    className={styles.backButton}
                >
                    ← Back
                </button>

                <div className={styles.headerActions}>
                    {canEdit && currentMode === 'view' && (
                        <button
                            onClick={handleEditProfile}
                            className={styles.editButton}
                        >
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            {/* Success/Error Messages */}
            {successMessage && (
                <div className={styles.successMessage}>
                    <span className={styles.successIcon}>✅</span>
                    {successMessage}
                </div>
            )}

            {updateError && (
                <div className={styles.errorMessage}>
                    <span className={styles.errorIcon}>❌</span>
                    {updateError}
                </div>
            )}

            {/* Main Content */}
            <div className={styles.content}>
                {currentMode === 'view' ? (
                    // View Mode
                    <div className={styles.viewMode}>
                        <UserProfile
                            user={profileUser}
                            isOwnProfile={isOwnProfile}
                            onEdit={handleEditProfile}
                        />
                    </div>
                ) : (
                    // Edit Mode
                    <div className={styles.editMode}>
                        <div className={styles.editHeader}>
                            <h2>Edit Profile</h2>
                            <p>Update your information and preferences</p>
                        </div>

                        <UserForm
                            user={profileUser}
                            onSave={handleSaveProfile}
                            onCancel={handleCancelEdit}
                            loading={updateLoading}
                        />
                    </div>
                )}

                {/* Related Users Section (only in view mode) */}
                {currentMode === 'view' && (
                    <div className={styles.relatedSection}>
                        <div className={styles.sectionHeader}>
                            <h3>
                                {profileUser.role === UserRole.COACH
                                    ? 'Other Coaches'
                                    : 'Similar Players'
                                }
                                {profileUser.location && ` in ${profileUser.location}`}
                            </h3>
                            <button
                                onClick={() => router.push('/users')}
                                className={styles.viewAllButton}
                            >
                                View All Users
                            </button>
                        </div>

                        {relatedLoading ? (
                            <div className={styles.relatedLoading}>
                                <div className={styles.loadingSpinner}></div>
                                <p>Loading related users...</p>
                            </div>
                        ) : (
                            <UserList
                                users={relatedUsers.filter(u => u.id !== profileUser.id).slice(0, 6)}
                                loading={relatedLoading}
                                onViewProfile={handleViewOtherProfile}
                                onConnect={handleConnectUser}
                                showConnectButton={!isOwnProfile}
                                emptyMessage={`No other ${profileUser.role.toLowerCase()}s found`}
                                emptyDescription="Try browsing all users to find connections"
                            />
                        )}
                    </div>
                )}
            </div>

            {/* Profile Metadata (only for own profile) */}
            {isOwnProfile && currentMode === 'view' && (
                <div className={styles.metadata}>
                    <div className={styles.metadataCard}>
                        <h4>Profile Information</h4>
                        <div className={styles.metadataGrid}>
                            <div className={styles.metadataItem}>
                                <span className={styles.metadataLabel}>Member Since:</span>
                                <span className={styles.metadataValue}>
                  {formatDate(profileUser.createdAt)}
                </span>
                            </div>
                            <div className={styles.metadataItem}>
                                <span className={styles.metadataLabel}>Last Updated:</span>
                                <span className={styles.metadataValue}>
                  {formatDate(profileUser.updatedAt)}
                </span>
                            </div>
                            <div className={styles.metadataItem}>
                                <span className={styles.metadataLabel}>Profile ID:</span>
                                <span className={styles.metadataValue}>
                  {profileUser.id}
                </span>
                            </div>
                            <div className={styles.metadataItem}>
                                <span className={styles.metadataLabel}>Account Status:</span>
                                <span className={`${styles.metadataValue} ${styles.statusActive}`}>
                  {profileUser.isActive ? 'Active' : 'Inactive'}
                </span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Development Info (only in development mode) */}
            {process.env.NODE_ENV === 'development' && (
                <div className={styles.devInfo}>
                    <details>
                        <summary>Debug Information</summary>
                        <pre>{JSON.stringify({
                            userId,
                            currentMode,
                            isOwnProfile,
                            canEdit,
                            canView,
                            isAuthenticated,
                            currentUserId: currentUser?.id,
                            profileUserId: profileUser?.id
                        }, null, 2)}</pre>
                    </details>
                </div>
            )}
        </div>
    );
};

// Higher-order component for URL-based routing
export const UserProfilePageWrapper: React.FC<{ params: { id: string } }> = ({
                                                                                 params
                                                                             }) => {
    return <UserProfilePage userId={params.id} />;
};

// Export both components
export default UserProfilePage;