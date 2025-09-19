import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Navbar() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <Link to="/admin-dashboard" className="text-xl font-bold text-blue-600">DigiLib</Link>
            <div className="hidden md:flex items-baseline space-x-4">
              <Link to="/admin-dashboard" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
              <Link to="/admin/catalogue" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">Catalogue</Link>
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="text-gray-700 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium">Profile</Link>
              <button onClick={handleLogout} className="bg-red-500 text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-red-600">
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;