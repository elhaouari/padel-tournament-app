'use client';

import { Inter } from 'next/font/google';
import { initializeServices } from '@/modules/user/services';
import supabase from '@/lib/supabase';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

// Initialize user module services immediately for client-side
// Real Prisma operations will be handled via API routes
initializeServices({
    supabaseClient: supabase,
    mockMode: true // Use mock services on client-side
});

export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode;
}) {

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