import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [form, setForm] = useState({
    adminEmail: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const institutionRaw = localStorage.getItem('digilib_institution');
    if (!institutionRaw) {
      setError('No institution found. Please sign up first.');
      return;
    }
    const institution = JSON.parse(institutionRaw);
    if (form.adminEmail !== institution.adminEmail) {
      setError('Email does not match.');
      return;
    }
    if (!bcrypt.compareSync(form.password, institution.password)) {
      setError('Incorrect password.');
      return;
    }
    login(institution);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center">
      <div className="max-w-md w-full p-10 bg-white rounded-2xl shadow-2xl border border-border-light">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-primary-blue drop-shadow">Admin Login</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="email" name="adminEmail" placeholder="Admin Email" value={form.adminEmail} onChange={handleChange} className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue transition text-text-dark bg-bg-light" />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue transition text-text-dark bg-bg-light" />
          {error && <div className="text-red-600 text-sm font-semibold">{error}</div>}
          <button type="submit" className="w-full bg-primary-blue text-white py-3 rounded-lg font-bold hover:bg-secondary-blue transition-colors disabled:bg-primary-blue/70 shadow">Login</button>
        </form>
        <div className="mt-6 text-center">
          <Link to="/signup" className="text-primary-blue hover:underline font-medium">Signup instead</Link>
        </div>
      </div>
    </div>
  );
}
