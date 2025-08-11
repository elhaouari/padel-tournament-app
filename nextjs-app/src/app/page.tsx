import Link from 'next/link';

export default function HomePage() {
  return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Welcome to User Management App</h1>
          <p className="text-xl text-gray-600 mb-8">
            A complete user management system built with Next.js and your modular architecture
          </p>

          <div className="flex gap-4 justify-center">
            <Link href="/users" className="btn-primary">
              Browse Users
            </Link>
            <Link href="/auth/register" className="btn-secondary">
              Sign Up
            </Link>
          </div>
        </div>

        <div className="mt-12 grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">User Directory</h3>
            <p className="text-gray-600">Browse and connect with users, coaches, and players</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Profile Management</h3>
            <p className="text-gray-600">Complete profile editing with real-time validation</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-xl font-semibold mb-3">Advanced Search</h3>
            <p className="text-gray-600">Filter by role, level, location with URL sync</p>
          </div>
        </div>
      </div>
  );
}