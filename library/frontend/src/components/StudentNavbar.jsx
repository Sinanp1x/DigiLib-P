import { Link, useLocation } from 'react-router-dom';
import { useStudentAuth } from '../StudentAuthContext';

export default function StudentNavbar() {
  const { student, logout } = useStudentAuth();
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname.includes(path);
  };

  const navItems = [
    { path: '/student-dashboard', label: 'Dashboard' },
    { path: '/student-dashboard/catalogue', label: 'Browse Books' },
    { path: '/student-dashboard/profile', label: 'Profile' },
    { path: '/student-dashboard/my-books', label: 'My Books' },
    { path: '/student-dashboard/requests', label: 'Book Requests' },
    { path: '/student-dashboard/fines', label: 'My Fines' },
    { path: '/student-dashboard/community', label: 'Community' },
  ];

  return (
    <nav className="bg-white border-b border-border-light px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="inline-block w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center mr-2">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
          </svg>
        </span>
        <span className="font-bold text-2xl tracking-wide text-primary-blue">Student Portal</span>
      </div>
      <div className="flex gap-6 items-center">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`text-sm ${
              isActive(item.path)
                ? 'text-primary-blue font-semibold'
                : 'text-text-dark hover:text-primary-blue'
            } transition`}
          >
            {item.label}
          </Link>
        ))}
        {student && (
          <div className="flex items-center gap-4 ml-6 border-l pl-6">
            <span className="text-sm text-gray-600">
              {student.name}
            </span>
            <button
              onClick={logout}
              className="text-sm text-red-600 hover:text-red-800 transition"
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}