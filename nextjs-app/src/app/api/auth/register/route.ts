import { NextRequest, NextResponse } from 'next/server';

// Mock data storage - in a real app, this would be in a database
const mockUsers: any[] = [
  {
    id: 'user_1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'PLAYER',
    createdAt: '2024-01-15T10:00:00.000Z'
  },
  {
    id: 'user_2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    role: 'COACH',
    createdAt: '2024-01-14T10:00:00.000Z'
  }
];

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();
    
    // Basic validation
    if (!name || !email || !password || !role) {
      return NextResponse.json(
        { error: 'Name, email, password, and role are required' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = mockUsers.find(user => user.email === email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user
    const user = {
      id: `user_${Date.now()}`,
      name,
      email,
      role,
      createdAt: new Date().toISOString()
    };

    mockUsers.push(user);
    
    return NextResponse.json({ user }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}