'use client';

import React, { useState } from 'react';
import { UserRole, PadelLevel, UserFilters } from '../../types';
import styles from './UserFilter.module.css';

interface UserFilterProps {
    filters: UserFilters;
    onFiltersChange: (filters: UserFilters) => void;
    loading?: boolean;
}

export const UserFilter: React.FC<UserFilterProps> = ({
                                                          filters,
                                                          onFiltersChange,
                                                          loading = false
                                                      }) => {
    const [localFilters, setLocalFilters] = useState<UserFilters>(filters);

    const handleFilterChange = (key: keyof UserFilters, value: any) => {
        const newFilters = { ...localFilters, [key]: value || undefined };
        setLocalFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const clearFilters = () => {
        const emptyFilters: UserFilters = {};
        setLocalFilters(emptyFilters);
        onFiltersChange(emptyFilters);
    };

    const hasActiveFilters = Object.values(localFilters).some(value => value !== undefined && value !== '');

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3 className={styles.title}>Find Players & Coaches</h3>
                <p className={styles.subtitle}>Discover your perfect padel partner</p>
            </div>

            <div className={styles.filterGrid}>
                <div className={styles.searchField}>
                    <label htmlFor="search" className={styles.label}>Search</label>
                    <input
                        type="text"
                        id="search"
                        placeholder="Search by name, bio, or location..."
                        value={localFilters.search || ''}
                        onChange={(e) => handleFilterChange('search', e.target.value)}
                        className={styles.searchInput}
                        disabled={loading}
                    />
                    <div className={styles.searchIcon}>🔍</div>
                </div>

                <div className={styles.filterField}>
                    <label htmlFor="role" className={styles.label}>Role</label>
                    <select
                        id="role"
                        value={localFilters.role || ''}
                        onChange={(e) => handleFilterChange('role', e.target.value as UserRole)}
                        className={styles.select}
                        disabled={loading}
                    >
                        <option value="">All Users</option>
                        <option value={UserRole.PLAYER}>🏆 Players</option>
                        <option value={UserRole.COACH}>🎾 Coaches</option>
                    </select>
                </div>

                <div className={styles.filterField}>
                    <label htmlFor="level" className={styles.label}>Skill Level</label>
                    <select
                        id="level"
                        value={localFilters.level || ''}
                        onChange={(e) => handleFilterChange('level', e.target.value as PadelLevel)}
                        className={styles.select}
                        disabled={loading}
                    >
                        <option value="">All Levels</option>
                        <option value={PadelLevel.BEGINNER}>🟢 Beginner</option>
                        <option value={PadelLevel.INTERMEDIATE}>🟡 Intermediate</option>
                        <option value={PadelLevel.ADVANCED}>🟠 Advanced</option>
                        <option value={PadelLevel.PROFESSIONAL}>🔴 Professional</option>
                    </select>
                </div>

                <div className={styles.filterField}>
                    <label htmlFor="location" className={styles.label}>Location</label>
                    <input
                        type="text"
                        id="location"
                        placeholder="City or country..."
                        value={localFilters.location || ''}
                        onChange={(e) => handleFilterChange('location', e.target.value)}
                        className={styles.input}
                        disabled={loading}
                    />
                </div>
            </div>

            {hasActiveFilters && (
                <div className={styles.activeFilters}>
                    <div className={styles.activeFiltersHeader}>
                        <span className={styles.activeFiltersText}>Active Filters:</span>
                        <button
                            onClick={clearFilters}
                            className={styles.clearButton}
                            disabled={loading}
                        >
                            Clear All
                        </button>
                    </div>
                    <div className={styles.filterTags}>
                        {localFilters.search && (
                            <span className={styles.filterTag}>
                Search: "{localFilters.search}"
                <button
                    onClick={() => handleFilterChange('search', '')}
                    className={styles.removeTag}
                >
                  ×
                </button>
              </span>
                        )}
                        {localFilters.role && (
                            <span className={styles.filterTag}>
                Role: {localFilters.role === UserRole.PLAYER ? '🏆 Player' : '🎾 Coach'}
                                <button
                                    onClick={() => handleFilterChange('role', '')}
                                    className={styles.removeTag}
                                >
                  ×
                </button>
              </span>
                        )}
                        {localFilters.level && (
                            <span className={styles.filterTag}>
                Level: {localFilters.level.charAt(0) + localFilters.level.slice(1).toLowerCase()}
                                <button
                                    onClick={() => handleFilterChange('level', '')}
                                    className={styles.removeTag}
                                >
                  ×
                </button>
              </span>
                        )}
                        {localFilters.location && (
                            <span className={styles.filterTag}>
                Location: {localFilters.location}
                                <button
                                    onClick={() => handleFilterChange('location', '')}
                                    className={styles.removeTag}
                                >
                  ×
                </button>
              </span>
                        )}
                    </div>
                </div>
            )}

            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingSpinner}></div>
                    <span>Searching...</span>
                </div>
            )}
        </div>
    );
};