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
    <div className="max-w-md mx-auto mt-16 p-10 bg-white rounded-2xl shadow-2xl border border-blue-100">
      <h2 className="text-3xl font-extrabold mb-8 text-center text-blue-700 drop-shadow">Admin Login</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        <input type="email" name="adminEmail" placeholder="Admin Email" value={form.adminEmail} onChange={handleChange} className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
        <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full px-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition" />
        {error && <div className="text-red-600 text-sm font-semibold">{error}</div>}
        <button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-blue-400 text-white py-3 rounded-lg font-bold hover:from-blue-700 hover:to-blue-500 transition shadow">Login</button>
      </form>
      <div className="mt-6 text-center">
        <Link to="/signup" className="text-blue-600 hover:underline font-medium">Signup instead</Link>
      </div>
    </div>
  );
}
