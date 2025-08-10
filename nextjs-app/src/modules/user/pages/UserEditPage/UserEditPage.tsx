'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { UserForm } from '../../components';
import { useAuth, useUser } from '../../hooks';
import { User, UpdateUserRequest } from '../../types';
import { handleApiError, formatDate } from '../../utils';
import styles from './UserEditPage.module.css';

interface UserEditPageProps {
    userId: string;
    onSaveSuccess?: (user: User) => void;
    onCancel?: () => void;
    redirectAfterSave?: string;
    showHeader?: boolean;
    embedded?: boolean;
}

export const UserEditPage: React.FC<UserEditPageProps> = ({
                                                              userId,
                                                              onSaveSuccess,
                                                              onCancel,
                                                              redirectAfterSave,
                                                              showHeader = true,
                                                              embedded = false
                                                          }) => {
    const router = useRouter();
    const { user: currentUser, isAuthenticated, updateProfile } = useAuth();
    const { user: targetUser, loading, error, refresh } = useUser(userId);

    // State management
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

    // Check permissions
    const isOwnProfile = currentUser?.id === userId;
    const canEdit = isAuthenticated && isOwnProfile; // Can be extended for admin permissions

    // Redirect if not authenticated
    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/auth/login');
        }
    }, [loading, isAuthenticated, router]);

    // Handle unauthorized access
    useEffect(() => {
        if (!loading && isAuthenticated && !canEdit) {
            router.push(`/users/${userId}`);
        }
    }, [loading, isAuthenticated, canEdit, userId, router]);

    // Handle beforeunload to warn about unsaved changes
    useEffect(() => {
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (hasUnsavedChanges && !saving) {
                e.preventDefault();
                e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [hasUnsavedChanges, saving]);

    // Handle form changes
    const handleFormChange = () => {
        setHasUnsavedChanges(true);
        setSaveError(null);
        setSuccessMessage(null);
    };

    // Handle save
    const handleSave = async (updateData: UpdateUserRequest) => {
        if (!canEdit || !targetUser) return;

        setSaving(true);
        setSaveError(null);
        setSuccessMessage(null);

        try {
            const result = await updateProfile(updateData);

            if (result.success && result.user) {
                setSuccessMessage('Profile updated successfully!');
                setHasUnsavedChanges(false);

                // Refresh user data
                await refresh();

                // Call success callback
                if (onSaveSuccess) {
                    onSaveSuccess(result.user);
                }

                // Auto-hide success message after 3 seconds
                setTimeout(() => setSuccessMessage(null), 3000);

                // Redirect if specified
                if (redirectAfterSave) {
                    setTimeout(() => {
                        router.push(redirectAfterSave);
                    }, 1500);
                }
            } else {
                setSaveError(result.error || 'Failed to update profile');
            }
        } catch (error) {
            setSaveError(handleApiError(error));
        } finally {
            setSaving(false);
        }
    };

    // Handle cancel
    const handleCancel = () => {
        if (hasUnsavedChanges) {
            const confirmLeave = window.confirm(
                'You have unsaved changes. Are you sure you want to cancel?'
            );
            if (!confirmLeave) return;
        }

        setHasUnsavedChanges(false);
        setSaveError(null);
        setSuccessMessage(null);

        if (onCancel) {
            onCancel();
        } else {
            router.push(`/users/${userId}`);
        }
    };

    // Handle navigation
    const handleViewProfile = () => {
        if (hasUnsavedChanges) {
            const confirmLeave = window.confirm(
                'You have unsaved changes. Are you sure you want to leave?'
            );
            if (!confirmLeave) return;
        }

        router.push(`/users/${userId}`);
    };

    // Loading state
    if (loading) {
        return (
            <div className={`${styles.container} ${embedded ? styles.embedded : ''}`}>
                <div className={styles.loading}>
                    <div className={styles.loadingSpinner}></div>
                    <p>Loading profile...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (error && !targetUser) {
        return (
            <div className={`${styles.container} ${embedded ? styles.embedded : ''}`}>
                <div className={styles.error}>
                    <div className={styles.errorIcon}>❌</div>
                    <h2>Profile Not Found</h2>
                    <p>{error}</p>
                    <div className={styles.errorActions}>
                        <button
                            onClick={() => router.push('/users')}
                            className={styles.secondaryButton}
                        >
                            Browse Users
                        </button>
                        <button
                            onClick={() => window.location.reload()}
                            className={styles.primaryButton}
                        >
                            Retry
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Unauthorized state
    if (!canEdit) {
        return (
            <div className={`${styles.container} ${embedded ? styles.embedded : ''}`}>
                <div className={styles.unauthorized}>
                    <div className={styles.errorIcon}>🔒</div>
                    <h2>Access Denied</h2>
                    <p>You can only edit your own profile.</p>
                    <div className={styles.errorActions}>
                        <button
                            onClick={() => router.push('/auth/login')}
                            className={styles.primaryButton}
                        >
                            Sign In
                        </button>
                        <button
                            onClick={() => router.push(`/users/${userId}`)}
                            className={styles.secondaryButton}
                        >
                            View Profile
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!targetUser) return null;

    return (
        <div className={`${styles.container} ${embedded ? styles.embedded : ''}`}>
            {/* Header */}
            {showHeader && (
                <div className={styles.header}>
                    <div className={styles.headerContent}>
                        <div className={styles.headerLeft}>
                            <button
                                onClick={handleCancel}
                                className={styles.backButton}
                                disabled={saving}
                            >
                                ← {embedded ? 'Cancel' : 'Back'}
                            </button>
                            <div className={styles.headerInfo}>
                                <h1 className={styles.title}>Edit Profile</h1>
                                <p className={styles.subtitle}>
                                    Update your information and preferences
                                </p>
                            </div>
                        </div>

                        <div className={styles.headerActions}>
                            <button
                                onClick={handleViewProfile}
                                className={styles.viewProfileButton}
                                disabled={saving}
                            >
                                View Profile
                            </button>
                        </div>
                    </div>

                    {/* Unsaved changes indicator */}
                    {hasUnsavedChanges && (
                        <div className={styles.unsavedIndicator}>
                            <span className={styles.unsavedIcon}>●</span>
                            Unsaved changes
                        </div>
                    )}
                </div>
            )}

            {/* Success/Error Messages */}
            {successMessage && (
                <div className={styles.successMessage}>
                    <span className={styles.successIcon}>✅</span>
                    {successMessage}
                    {redirectAfterSave && (
                        <span className={styles.redirectInfo}>
                            Redirecting...
                        </span>
                    )}
                </div>
            )}

            {saveError && (
                <div className={styles.errorMessage}>
                    <span className={styles.errorIcon}>❌</span>
                    {saveError}
                    <button
                        onClick={() => setSaveError(null)}
                        className={styles.dismissButton}
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Main Content */}
            <div className={styles.content}>
                <div className={styles.formContainer}>
                    <UserForm
                        user={targetUser}
                        onSave={handleSave}
                        onCancel={handleCancel}
                        onChange={handleFormChange}
                        loading={saving}
                        showCancelButton={!embedded}
                        saveButtonText={saving ? 'Saving...' : 'Save Changes'}
                        cancelButtonText="Cancel"
                    />
                </div>

                {/* Profile metadata */}
                {!embedded && (
                    <div className={styles.metadata}>
                        <div className={styles.metadataCard}>
                            <h3>Profile Information</h3>
                            <div className={styles.metadataGrid}>
                                <div className={styles.metadataItem}>
                                    <span className={styles.metadataLabel}>Member Since:</span>
                                    <span className={styles.metadataValue}>
                                        {formatDate(targetUser.createdAt)}
                                    </span>
                                </div>
                                <div className={styles.metadataItem}>
                                    <span className={styles.metadataLabel}>Last Updated:</span>
                                    <span className={styles.metadataValue}>
                                        {formatDate(targetUser.updatedAt)}
                                    </span>
                                </div>
                                <div className={styles.metadataItem}>
                                    <span className={styles.metadataLabel}>Profile ID:</span>
                                    <span className={styles.metadataValue}>
                                        {targetUser.id}
                                    </span>
                                </div>
                                <div className={styles.metadataItem}>
                                    <span className={styles.metadataLabel}>Account Status:</span>
                                    <span className={`${styles.metadataValue} ${styles.statusActive}`}>
                                        {targetUser.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Development Info */}
            {process.env.NODE_ENV === 'development' && !embedded && (
                <div className={styles.devInfo}>
                    <details>
                        <summary>Debug Information</summary>
                        <pre>{JSON.stringify({
                            userId,
                            isOwnProfile,
                            canEdit,
                            hasUnsavedChanges,
                            saving,
                            embedded,
                            redirectAfterSave,
                            currentUserId: currentUser?.id,
                            targetUserId: targetUser?.id
                        }, null, 2)}</pre>
                    </details>
                </div>
            )}
        </div>
    );
};

// Higher-order components for different use cases
export const UserEditPageWrapper: React.FC<{ params: { id: string } }> = ({ params }) => {
    return (
        <UserEditPage
            userId={params.id}
            redirectAfterSave={`/users/${params.id}`}
        />
    );
};

// Modal version for embedded editing
export const UserEditModal: React.FC<{
    userId: string;
    isOpen: boolean;
    onClose: () => void;
    onSave?: (user: User) => void;
}> = ({ userId, isOpen, onClose, onSave }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay}>
            <div className={styles.modalContent}>
                <UserEditPage
                    userId={userId}
                    onSaveSuccess={(user) => {
                        onSave?.(user);
                        onClose();
                    }}
                    onCancel={onClose}
                    showHeader={false}
                    embedded={true}
                />
            </div>
        </div>
    );
};

// Quick edit component for profile sections
export const QuickEditProfile: React.FC<{
    userId: string;
    onSave: (user: User) => void;
    onCancel: () => void;
}> = ({ userId, onSave, onCancel }) => {
    return (
        <UserEditPage
            userId={userId}
            onSaveSuccess={onSave}
            onCancel={onCancel}
            showHeader={false}
            embedded={true}
        />
    );
};

export default UserEditPage;