import { NextRequest, NextResponse } from 'next/server';

// Mock users data for search
const mockUsers = [
    {
        id: '1',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'COACH',
        level: 'ADVANCED',
        location: 'New York',
        bio: 'Experienced tennis coach',
        isActive: true
    },
    {
        id: '2',
        email: 'jane@example.com',
        name: 'Jane Smith',
        role: 'PLAYER',
        level: 'INTERMEDIATE',
        location: 'Los Angeles',
        bio: 'Passionate tennis player',
        isActive: true
    },
    {
        id: '3',
        email: 'mike@example.com',
        name: 'Mike Johnson',
        role: 'PLAYER',
        level: 'BEGINNER',
        location: 'Chicago',
        bio: 'New to tennis',
        isActive: true
    }
];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const exclude = searchParams.get('exclude');

    if (!query || query.length < 2) {
        return NextResponse.json([]);
    }

    let results = mockUsers.filter(user => {
        // Exclude specific user if provided
        if (exclude && user.id === exclude) {
            return false;
        }

        // Search in name, email, and bio
        const searchText = query.toLowerCase();
        return user.name.toLowerCase().includes(searchText) ||
               user.email.toLowerCase().includes(searchText) ||
               (user.bio && user.bio.toLowerCase().includes(searchText));
    });

    // Limit results
    results = results.slice(0, 10);

    return NextResponse.json(results);
}