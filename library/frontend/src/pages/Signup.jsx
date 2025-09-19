import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { Link } from 'react-router-dom';

export default function Signup() {
  const [form, setForm] = useState({
    institutionName: '',
    adminName: '',
    adminEmail: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.institutionName || !form.adminName || !form.adminEmail || !form.password) {
      setError('All fields are required.');
      return;
    }
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(form.password, salt);
    const institution = {
      institutionName: form.institutionName,
      adminName: form.adminName,
      adminEmail: form.adminEmail,
      password: hashedPassword,
      students: [],
      books: [],
    };
    localStorage.setItem('digilib_institution', JSON.stringify(institution));
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center">
      <div className="max-w-md w-full p-10 bg-white rounded-2xl shadow-2xl border border-border-light">
        <h2 className="text-3xl font-extrabold mb-8 text-center text-primary-blue drop-shadow">Institution Signup</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <input type="text" name="institutionName" placeholder="Institution Name" value={form.institutionName} onChange={handleChange} className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue transition text-text-dark bg-bg-light" />
          <input type="text" name="adminName" placeholder="Admin Name" value={form.adminName} onChange={handleChange} className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue transition text-text-dark bg-bg-light" />
          <input type="email" name="adminEmail" placeholder="Admin Email" value={form.adminEmail} onChange={handleChange} className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue transition text-text-dark bg-bg-light" />
          <input type="password" name="password" placeholder="Password" value={form.password} onChange={handleChange} className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue transition text-text-dark bg-bg-light" />
          {error && <div className="text-red-600 text-sm font-semibold">{error}</div>}
          <button type="submit" className="w-full bg-primary-blue text-white py-3 rounded-lg font-bold hover:bg-secondary-blue transition-colors disabled:bg-primary-blue/70 shadow">Signup</button>
      </form>
        <div className="mt-6 text-center">
          <Link to="/login" className="text-primary-blue hover:underline font-medium">Login instead</Link>
        </div>
      </div>
    </div>
  );
}
