import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Container, Paper, Typography, TextField, Button, Box, Avatar, Stack, Alert } from '@mui/material';

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
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
          Profile
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField name="id" label="ID" value={profile.id} InputProps={{ readOnly: true }} />
            <TextField name="name" label="Name" value={profile.name} onChange={handleChange} />
            <TextField name="role" label="Role" value={profile.role} onChange={handleChange} />
            <Box>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>Avatar</Typography>
              <Stack direction="row" spacing={2} alignItems="center">
                <Button variant="outlined" component="label">
                  Choose File
                  <input type="file" hidden accept="image/*" onChange={handleFile} />
                </Button>
                {profile.avatarPreview && (
                  <Avatar src={profile.avatarPreview} alt="avatar" sx={{ width: 64, height: 64 }} />
                )}
              </Stack>
            </Box>
            <Box>
              <Button type="submit" variant="contained" disabled={loading}>
                {loading ? 'Saving...' : 'Save Profile'}
              </Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
