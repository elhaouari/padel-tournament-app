'use client';

import React, { useState } from 'react';
import { User, UserRole, PadelLevel } from '../../types';
import { useAuth } from '../../hooks';
import { formatDate, getPadelLevelColor, getRoleIcon } from '../../utils';
import styles from './UserProfile.module.css';

interface UserProfileProps {
    user: User;
    isOwnProfile?: boolean;
    onEdit?: () => void;
}

export const UserProfile: React.FC<UserProfileProps> = ({
                                                            user,
                                                            isOwnProfile = false,
                                                            onEdit
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
        <div className={styles.container}>
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

                <div className={styles.basicInfo}>
                    <h1 className={styles.name}>{user.name}</h1>
                    <p className={styles.role}>
                        {user.role === UserRole.COACH ? '🎾 Coach' : '🏆 Player'}
                    </p>
                    {user.location && (
                        <p className={styles.location}>📍 {user.location}</p>
                    )}
                    {isOwnProfile && (
                        <button onClick={onEdit} className={styles.editButton}>
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>

            <div className={styles.content}>
                {user.bio && (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>About</h3>
                        <p className={styles.bio}>{user.bio}</p>
                    </div>
                )}

                <div className={styles.infoGrid}>
                    <div className={styles.infoCard}>
                        <h3 className={styles.cardTitle}>Contact</h3>
                        <div className={styles.cardContent}>
                            <p className={styles.email}>✉️ {user.email}</p>
                            {user.phone && (
                                <p className={styles.phone}>📱 {user.phone}</p>
                            )}
                        </div>
                    </div>

                    {user.role === UserRole.PLAYER && (
                        <div className={styles.infoCard}>
                            <h3 className={styles.cardTitle}>Player Info</h3>
                            <div className={styles.cardContent}>
                                {user.level && (
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
                                {user.experience && (
                                    <p className={styles.experience}>
                                        🏃 {user.experience} year{user.experience !== 1 ? 's' : ''} experience
                                    </p>
                                )}
                            </div>
                        </div>
                    )}

                    {user.role === UserRole.COACH && (
                        <div className={styles.infoCard}>
                            <h3 className={styles.cardTitle}>Coach Info</h3>
                            <div className={styles.cardContent}>
                                {user.hourlyRate && (
                                    <p className={styles.hourlyRate}>💰 €{user.hourlyRate}/hour</p>
                                )}
                                {user.experience && (
                                    <p className={styles.experience}>
                                        🎓 {user.experience} year{user.experience !== 1 ? 's' : ''} coaching
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {user.role === UserRole.COACH && (user.certifications?.length || user.specialties?.length) && (
                    <div className={styles.section}>
                        <h3 className={styles.sectionTitle}>Professional Details</h3>
                        <div className={styles.professionalGrid}>
                            {user.certifications && user.certifications.length > 0 && (
                                <div className={styles.professionalCard}>
                                    <h4 className={styles.cardSubtitle}>Certifications</h4>
                                    <div className={styles.tagContainer}>
                                        {user.certifications.map((cert, index) => (
                                            <span key={index} className={styles.tag}>
                        {cert}
                      </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {user.specialties && user.specialties.length > 0 && (
                                <div className={styles.professionalCard}>
                                    <h4 className={styles.cardSubtitle}>Specialties</h4>
                                    <div className={styles.tagContainer}>
                                        {user.specialties.map((specialty, index) => (
                                            <span key={index} className={styles.tag}>
                        {specialty}
                      </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                <div className={styles.footer}>
                    <p className={styles.memberSince}>
                        Member since {formatDate(user.createdAt)}
                    </p>
                </div>
            </div>
        </div>
    );
};