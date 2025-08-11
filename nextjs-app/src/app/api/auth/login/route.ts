import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { email, password } = await request.json();
        
        // Basic validation
        if (!email || !password) {
            return NextResponse.json(
                { error: 'Email and password are required' },
                { status: 400 }
            );
        }

        // Mock authentication (in a real app, verify against database)
        // For now, just return success for any credentials
        const mockUser = {
            id: `user_${Date.now()}`,
            name: 'Test User',
            email: email,
            role: 'PLAYER',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        return NextResponse.json({ 
            user: mockUser,
            message: 'Login successful' 
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}