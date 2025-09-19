import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import SplashScreen from '../components/SplashScreen'; // Import SplashScreen

function Profile() {
  const navigate = useNavigate();

  // Get user info directly from localStorage
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = async () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };


  // Since we get data from localStorage, it's synchronous.
  // We don't need a loading state unless we were fetching more details.
  if (!user) {
    // This case should ideally be handled by ProtectedRoute, but as a fallback:
    return <SplashScreen message='No user found...' page='profile' />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6"
    >
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-800 border-b pb-2">👤 Profile Overview</h2>

        {user && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-xl shadow-xl flex flex-col sm:flex-row sm:justify-between items-center gap-6"
          >
            {/* Profile Image */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <img
                  src={
                    user.role === 'admin'
                      ? require('../assets/Admin_pic.png')
                      : require('../assets/user.png') // Placeholder for student
                  }
                  alt="Profile"
                  className="h-28 w-28 rounded-full object-cover border-4 border-blue-500"
                />
                {user.role === 'admin' && (
                  <span className="absolute bottom-0 right-0 bg-yellow-400 text-white text-xs px-2 py-1 rounded-full shadow">
                    Admin
                  </span>
                )}
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1 text-center sm:text-left">
              <p className="text-lg font-semibold text-gray-700">
                👤 Username: <span className="italic">{user.username}</span>
              </p>
              <p className="text-md text-gray-600 mt-1">
                Role: <span className="italic capitalize">{user.role}</span>
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-3 justify-center sm:justify-start">
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleLogout}
                  className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
                >
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

export default Profile;
