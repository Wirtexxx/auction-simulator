import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUser, clearAuth, isAuthenticated, type StoredUser } from '../lib/authStorage';

export function AppPage() {
  const [user, setUser] = useState<StoredUser | null>(() => {
    if (!isAuthenticated()) {
      return null;
    }
    return getUser();
  });
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/auth');
      return;
    }

    const userData = getUser();
    if (userData) {
      // Use setTimeout to avoid synchronous setState in effect
      setTimeout(() => setUser(userData), 0);
    } else {
      navigate('/auth');
    }
  }, [navigate]);

  const handleLogout = () => {
    clearAuth();
    navigate('/auth');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-900 rounded-lg shadow-xl p-8 max-w-4xl mx-auto border border-gray-800">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-white">Auction Simulator</h2>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-4">User Profile</h2>
            <div className="space-y-3">
              {user.photo_url && (
                <div className="flex items-center">
                  <img
                    src={user.photo_url}
                    alt={user.first_name}
                    className="w-16 h-16 rounded-full mr-4 border-2 border-gray-700"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-400">ID</p>
                  <p className="text-lg font-medium text-white">{user._id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Username</p>
                  <p className="text-lg font-medium text-white">@{user.username}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">First Name</p>
                  <p className="text-lg font-medium text-white">{user.first_name}</p>
                </div>
                {user.last_name && (
                  <div>
                    <p className="text-sm text-gray-400">Last Name</p>
                    <p className="text-lg font-medium text-white">{user.last_name}</p>
                  </div>
                )}
                {user.language_code && (
                  <div>
                    <p className="text-sm text-gray-400">Language</p>
                    <p className="text-lg font-medium text-white">{user.language_code}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-400">Premium</p>
                  <p className="text-lg font-medium text-white">
                    {user.is_premium ? 'Yes' : 'No'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-400">Role</p>
                  <p className="text-lg font-medium text-white">{user.role}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold text-white mb-2">Welcome to the App!</h2>
            <p className="text-gray-400">
              You have successfully authenticated. This is your main application page.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}




