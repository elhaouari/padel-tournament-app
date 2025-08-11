'use client';

import { Inter } from 'next/font/google';
import { useEffect } from 'react';
import { initializeServices } from '@/modules/user/services';
import { prisma } from '@/lib/prisma';
import supabase from '@/lib/supabase';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {
    useEffect(() => {
        // Initialize user module services
        initializeServices({
            prismaClient: prisma,
            supabaseClient: supabase
        });
    }, []);

    return (
        <html lang="en">
        <body className={inter.className}>
        <div className="min-h-screen bg-gray-50">
            {children}
        </div>
        </body>
        </html>
    );
}