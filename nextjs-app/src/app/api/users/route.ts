import { NextRequest, NextResponse } from 'next/server';

// Mock users data for testing
const mockUsers = [
    {
        id: '1',
        email: 'john@example.com',
        name: 'John Doe',
        role: 'COACH',
        level: 'ADVANCED',
        location: 'New York',
        bio: 'Experienced tennis coach with 10+ years',
        isActive: true,
        createdAt: new Date('2023-01-01'),
        updatedAt: new Date('2023-01-01')
    },
    {
        id: '2',
        email: 'jane@example.com',
        name: 'Jane Smith',
        role: 'PLAYER',
        level: 'INTERMEDIATE',
        location: 'Los Angeles',
        bio: 'Passionate tennis player looking to improve',
        isActive: true,
        createdAt: new Date('2023-01-02'),
        updatedAt: new Date('2023-01-02')
    }
];

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const role = searchParams.get('role');
    const search = searchParams.get('search');

    let filteredUsers = [...mockUsers];

    // Apply filters
    if (role) {
        filteredUsers = filteredUsers.filter(user => user.role === role);
    }

    if (search) {
        filteredUsers = filteredUsers.filter(user =>
            user.name.toLowerCase().includes(search.toLowerCase()) ||
            user.email.toLowerCase().includes(search.toLowerCase())
        );
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(startIndex, startIndex + limit);

    return NextResponse.json({
        users: paginatedUsers,
        total: filteredUsers.length,
        page,
        limit
    });
}

export async function POST(request: NextRequest) {
    const userData = await request.json();

    const newUser = {
        id: String(mockUsers.length + 1),
        ...userData,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
    };

    mockUsers.push(newUser);

    return NextResponse.json(newUser, { status: 201 });
}