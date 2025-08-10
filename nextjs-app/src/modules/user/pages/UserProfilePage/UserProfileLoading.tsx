'use client';

import React from 'react';
import styles from './UserProfileLoading.module.css';

export const UserProfileLoading: React.FC = () => {
    return (
        <div className={styles.container}>
            {/* Header Skeleton */}
            <div className={styles.header}>
                <div className={styles.skeleton} style={{ width: '80px', height: '36px' }}></div>
                <div className={styles.skeleton} style={{ width: '100px', height: '36px' }}></div>
            </div>

            {/* Profile Header Skeleton */}
            <div className={styles.profileHeader}>
                <div className={styles.profileHeaderBackground}>
                    <div className={styles.avatarSkeleton}></div>
                    <div className={styles.profileInfo}>
                        <div className={styles.skeleton} style={{ width: '200px', height: '32px', marginBottom: '8px' }}></div>
                        <div className={styles.skeleton} style={{ width: '120px', height: '20px', marginBottom: '8px' }}></div>
                        <div className={styles.skeleton} style={{ width: '160px', height: '16px' }}></div>
                    </div>
                </div>
            </div>

            {/* Content Skeleton */}
            <div className={styles.content}>
                {/* About Section */}
                <div className={styles.section}>
                    <div className={styles.skeleton} style={{ width: '80px', height: '24px', marginBottom: '16px' }}></div>
                    <div className={styles.skeleton} style={{ width: '100%', height: '60px' }}></div>
                </div>

                {/* Info Cards */}
                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <div className={styles.skeleton} style={{ width: '100px', height: '18px', marginBottom: '12px' }}></div>
                        <div className={styles.skeleton} style={{ width: '80%', height: '14px', marginBottom: '8px' }}></div>
                        <div className={styles.skeleton} style={{ width: '60%', height: '14px' }}></div>
                    </div>
                    <div className={styles.infoCard}>
                        <div className={styles.skeleton} style={{ width: '120px', height: '18px', marginBottom: '12px' }}></div>
                        <div className={styles.skeleton} style={{ width: '90%', height: '14px', marginBottom: '8px' }}></div>
                        <div className={styles.skeleton} style={{ width: '70%', height: '14px' }}></div>
                    </div>
                </div>

                {/* Professional Details (for coaches) */}
                <div className={styles.section}>
                    <div className={styles.skeleton} style={{ width: '180px', height: '24px', marginBottom: '16px' }}></div>
                    <div className={styles.professionalGrid}>
                        <div className={styles.professionalCard}>
                            <div className={styles.skeleton} style={{ width: '120px', height: '16px', marginBottom: '12px' }}></div>
                            <div className={styles.tagContainer}>
                                <div className={styles.tagSkeleton}></div>
                                <div className={styles.tagSkeleton}></div>
                                <div className={styles.tagSkeleton}></div>
                            </div>
                        </div>
                        <div className={styles.professionalCard}>
                            <div className={styles.skeleton} style={{ width: '100px', height: '16px', marginBottom: '12px' }}></div>
                            <div className={styles.tagContainer}>
                                <div className={styles.tagSkeleton}></div>
                                <div className={styles.tagSkeleton}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Related Users Section */}
                <div className={styles.section}>
                    <div className={styles.sectionHeader}>
                        <div className={styles.skeleton} style={{ width: '200px', height: '20px' }}></div>
                        <div className={styles.skeleton} style={{ width: '100px', height: '32px' }}></div>
                    </div>
                    <div className={styles.userGrid}>
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className={styles.userCardSkeleton}>
                                <div className={styles.userCardHeader}>
                                    <div className={styles.userAvatarSkeleton}></div>
                                </div>
                                <div className={styles.userCardContent}>
                                    <div className={styles.skeleton} style={{ width: '80%', height: '16px', marginBottom: '8px' }}></div>
                                    <div className={styles.skeleton} style={{ width: '60%', height: '14px', marginBottom: '8px' }}></div>
                                    <div className={styles.skeleton} style={{ width: '70%', height: '12px' }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading Indicator */}
            <div className={styles.loadingIndicator}>
                <div className={styles.loadingSpinner}></div>
                <span>Loading profile...</span>
            </div>
        </div>
    );
};

export default UserProfileLoading;