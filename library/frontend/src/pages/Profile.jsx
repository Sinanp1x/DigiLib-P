import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Profile() {
  const { admin } = useAuth();
  const params = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ id: '', name: '', role: '', avatar: null, avatarPreview: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // If id provided in route use it, otherwise use admin id or 'admin'
    const id = params.id || (admin?.id || 'admin');
    setProfile(p => ({ ...p, id }));
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/profile/${id}`, { baseURL: 'http://localhost:5000' });
        setProfile(prev => ({ ...prev, ...res.data }));
        if (res.data.avatar) setProfile(prev => ({ ...prev, avatarPreview: `http://localhost:5000${res.data.avatar}` }));
      } catch (err) {
        // ignore 404
      }
    };
    fetchProfile();
  }, [params.id, admin]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    setProfile(prev => ({ ...prev, avatar: f, avatarPreview: URL.createObjectURL(f) }));
  };

  const handleChange = (e) => setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('id', profile.id);
      data.append('name', profile.name);
      data.append('role', profile.role);
      if (profile.avatar) data.append('file', profile.avatar);
      const res = await axios.post('/api/profile', data, { baseURL: 'http://localhost:5000' });
      // Update preview to backend URL if avatar was saved
      if (res.data?.profile?.avatar) {
        setProfile(prev => ({ ...prev, avatarPreview: `http://localhost:5000${res.data.profile.avatar}` }));
      }
      setSuccess('Profile saved successfully');
      setTimeout(() => navigate('/dashboard'), 700);
    } catch (err) {
      setError('Failed to save profile');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-bg-light py-12">
      <div className="max-w-2xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-border-light">
        <h2 className="text-2xl font-bold mb-6 text-primary-blue">Profile</h2>
        {error && <div className="text-red-600 mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1">ID</label>
            <input name="id" value={profile.id} readOnly className="w-full px-3 py-2 border border-border-light rounded bg-bg-light" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Name</label>
            <input name="name" value={profile.name} onChange={handleChange} className="w-full px-3 py-2 border border-border-light rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Role</label>
            <input name="role" value={profile.role} onChange={handleChange} className="w-full px-3 py-2 border border-border-light rounded" />
          </div>
          <div>
            <label className="block text-sm font-semibold mb-1">Avatar</label>
            <input type="file" accept="image/*" onChange={handleFile} />
            {profile.avatarPreview && <img src={profile.avatarPreview} alt="avatar" className="w-24 h-24 object-cover rounded mt-2" />}
          </div>
          <div>
            <button type="submit" disabled={loading} className="bg-primary-blue text-white px-6 py-2 rounded">{loading ? 'Saving...' : 'Save Profile'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
