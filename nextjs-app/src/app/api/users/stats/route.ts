import { NextRequest, NextResponse } from 'next/server';

// Mock stats data
const mockStats = {
    totalUsers: 25,
    totalPlayers: 18,
    totalCoaches: 7,
    usersByRole: {
        PLAYER: 18,
        COACH: 7
    },
    usersByLevel: {
        BEGINNER: 8,
        INTERMEDIATE: 10,
        ADVANCED: 5,
        PROFESSIONAL: 2
    },
    recentUsers: [
        {
            id: '1',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'COACH',
            createdAt: new Date('2024-01-15')
        },
        {
            id: '2', 
            name: 'Jane Smith',
            email: 'jane@example.com',
            role: 'PLAYER',
            createdAt: new Date('2024-01-14')
        }
    ]
};

export async function GET(request: NextRequest) {
    return NextResponse.json(mockStats);
}