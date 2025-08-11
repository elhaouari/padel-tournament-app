import { NextRequest, NextResponse } from 'next/server';

// Mock users data
const mockUsers = [
  {
    id: '1',
    email: 'john@example.com',
    name: 'John Doe',
    role: 'COACH',
    createdAt: '2024-01-15T10:00:00.000Z'
  },
  {
    id: '2',
    email: 'jane@example.com',
    name: 'Jane Smith',
    role: 'PLAYER',
    createdAt: '2024-01-14T10:00:00.000Z'
  },
  {
    id: '3',
    email: 'mike@example.com',
    name: 'Mike Johnson',
    role: 'PLAYER',
    createdAt: '2024-01-13T10:00:00.000Z'
  },
  {
    id: '4',
    email: 'sarah@example.com',
    name: 'Sarah Wilson',
    role: 'COACH',
    createdAt: '2024-01-12T10:00:00.000Z'
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
    const searchLower = search.toLowerCase();
    filteredUsers = filteredUsers.filter(user => 
      user.name.toLowerCase().includes(searchLower) ||
      user.email.toLowerCase().includes(searchLower)
    );
  }

  // Pagination
  const total = filteredUsers.length;
  const startIndex = (page - 1) * limit;
  const users = filteredUsers.slice(startIndex, startIndex + limit);

  return NextResponse.json({
    users,
    total
  });
}