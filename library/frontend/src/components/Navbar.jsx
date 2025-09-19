import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-4 flex justify-between items-center shadow-lg sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="inline-block w-8 h-8 bg-white rounded-full flex items-center justify-center mr-2">
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
        </span>
        <span className="font-bold text-2xl tracking-wide">Digi-Lib</span>
      </div>
      <div className="flex gap-6 text-lg">
        <Link to="/dashboard" className="hover:text-yellow-300 transition">Dashboard</Link>
        <Link to="/dashboard/students" className="hover:text-yellow-300 transition">Students</Link>
        <Link to="/dashboard/catalogue" className="hover:text-yellow-300 transition">Catalogue</Link>
        <Link to="/login" className="hover:text-yellow-300 transition">Logout</Link>
      </div>
    </nav>
  );
}
