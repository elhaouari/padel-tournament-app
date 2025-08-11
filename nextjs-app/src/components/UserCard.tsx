// Simplified User Card
import { User } from '@/lib/auth';

interface UserCardProps {
  user: User;
  onViewProfile?: (user: User) => void;
  showConnectButton?: boolean;
}

export function UserCard({ user, onViewProfile, showConnectButton = true }: UserCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center space-x-4">
        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
          {user.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg text-gray-900">{user.name}</h3>
          <p className="text-gray-600">{user.email}</p>
          <div className="flex items-center space-x-2 mt-1">
            <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
              user.role === 'COACH' 
                ? 'bg-green-100 text-green-800'
                : 'bg-blue-100 text-blue-800'
            }`}>
              {user.role}
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 flex space-x-2">
        <button
          onClick={() => onViewProfile?.(user)}
          className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md text-sm font-medium transition-colors"
        >
          View Profile
        </button>
        
        {showConnectButton && (
          <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md text-sm font-medium transition-colors">
            Connect
          </button>
        )}
      </div>
    </div>
  );
}