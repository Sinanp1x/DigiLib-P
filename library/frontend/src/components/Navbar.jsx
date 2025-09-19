import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <nav className="bg-white border-b border-border-light px-6 py-4 flex justify-between items-center sticky top-0 z-50">
      <div className="flex items-center gap-2">
        <span className="inline-block w-8 h-8 bg-primary-blue rounded-full flex items-center justify-center mr-2">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" /></svg>
        </span>
        <span className="font-bold text-2xl tracking-wide text-primary-blue">Digi-Lib</span>
      </div>
      <div className="flex gap-6 text-lg">
        <Link to="/dashboard" className="text-text-dark hover:text-primary-blue transition">Dashboard</Link>
        <Link to="/dashboard/students" className="text-text-dark hover:text-primary-blue transition">Students</Link>
        <Link to="/dashboard/catalogue" className="text-text-dark hover:text-primary-blue transition">Catalogue</Link>
        <Link to="/login" className="text-text-dark hover:text-primary-blue transition">Logout</Link>
      </div>
    </nav>
  );
}
