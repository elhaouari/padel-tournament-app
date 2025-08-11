import { NextRequest, NextResponse } from 'next/server';

const mockUsers = [
    // Same mock data as above
];

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const user = mockUsers.find(u => u.id === id);

    if (!user) {
        return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
        );
    }

    return NextResponse.json(user);
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const userData = await request.json();
    const userIndex = mockUsers.findIndex(u => u.id === id);

    if (userIndex === -1) {
        return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
        );
    }

    mockUsers[userIndex] = {
        ...mockUsers[userIndex],
        ...userData,
        updatedAt: new Date()
    };

    return NextResponse.json(mockUsers[userIndex]);
}