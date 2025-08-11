import { NextRequest, NextResponse } from 'next/server';

// Mock data storage (in a real app, this would be in a database)
const mockUsers: any[] = [];

export async function POST(request: NextRequest) {
    try {
        const userData = await request.json();
        
        // Basic validation
        if (!userData.email || !userData.password || !userData.name || !userData.role) {
            return NextResponse.json(
                { error: 'Missing required fields: email, password, name, role' },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = mockUsers.find(user => user.email === userData.email);
        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 409 }
            );
        }

        // Create new user
        const newUser = {
            id: `user_${Date.now()}`,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            level: userData.level || null,
            location: userData.location || null,
            phone: userData.phone || null,
            bio: userData.bio || null,
            avatar: null,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
            // Role-specific fields
            ...(userData.role === 'COACH' && {
                hourlyRate: userData.hourlyRate || null,
                certifications: userData.certifications || [],
                specialties: userData.specialties || []
            }),
            ...(userData.role === 'PLAYER' && {
                experience: userData.experience || null
            })
        };

        // Store user (in real app, save to database)
        mockUsers.push(newUser);

        // Return user data (without password)
        const { ...userResponse } = newUser;
        
        return NextResponse.json(userResponse, { status: 201 });

    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}