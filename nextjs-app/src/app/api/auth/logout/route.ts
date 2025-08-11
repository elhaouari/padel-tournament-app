import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        // In a real app, you would invalidate the session/token here
        // For now, just return success
        return NextResponse.json({ 
            message: 'Logged out successfully' 
        });

    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}