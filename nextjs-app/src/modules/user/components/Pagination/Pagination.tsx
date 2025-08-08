'use client';

import React from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    loading?: boolean;
}

export const Pagination: React.FC<PaginationProps> = ({
                                                          currentPage,
                                                          totalPages,
                                                          totalItems,
                                                          itemsPerPage,
                                                          onPageChange,
                                                          loading = false
                                                      }) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const getPageNumbers = () => {
        const pages: (number | string)[] = [];
        const showEllipsis = totalPages > 7;

        if (!showEllipsis) {
            // Show all pages if 7 or fewer
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            // Always show first page
            pages.push(1);

            if (currentPage <= 4) {
                // Show pages 2, 3, 4, 5, ..., last
                for (let i = 2; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                // Show 1, ..., last-4, last-3, last-2, last-1, last
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                // Show 1, ..., current-1, current, current+1, ..., last
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages;
    };

    const handlePageClick = (page: number) => {
        if (page !== currentPage && !loading) {
            onPageChange(page);
        }
    };

    const handlePrevious = () => {
        if (currentPage > 1 && !loading) {
            onPageChange(currentPage - 1);
        }
    };

    const handleNext = () => {
        if (currentPage < totalPages && !loading) {
            onPageChange(currentPage + 1);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.info}>
        <span className={styles.infoText}>
          Showing {startItem}-{endItem} of {totalItems} users
        </span>
            </div>

            <div className={styles.pagination}>
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1 || loading}
                    className={`${styles.pageButton} ${styles.navButton}`}
                    aria-label="Previous page"
                >
                    <span className={styles.navIcon}>←</span>
                    <span className={styles.navText}>Previous</span>
                </button>

                <div className={styles.pageNumbers}>
                    {getPageNumbers().map((page, index) => (
                        <React.Fragment key={index}>
                            {page === '...' ? (
                                <span className={styles.ellipsis}>...</span>
                            ) : (
                                <button
                                    onClick={() => handlePageClick(page as number)}
                                    disabled={loading}
                                    className={`${styles.pageButton} ${
                                        page === currentPage ? styles.activePage : styles.inactivePage
                                    }`}
                                    aria-label={`Go to page ${page}`}
                                    aria-current={page === currentPage ? 'page' : undefined}
                                >
                                    {page}
                                </button>
                            )}
                        </React.Fragment>
                    ))}
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages || loading}
                    className={`${styles.pageButton} ${styles.navButton}`}
                    aria-label="Next page"
                >
                    <span className={styles.navText}>Next</span>
                    <span className={styles.navIcon}>→</span>
                </button>
            </div>

            {loading && (
                <div className={styles.loadingOverlay}>
                    <div className={styles.loadingSpinner}></div>
                </div>
            )}
        </div>
    );
};