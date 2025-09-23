import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Container, Paper, Typography, TextField, Button, Box, Avatar, Stack, Alert, Grid } from '@mui/material';

const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env)
  ? (import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? '' : 'http://localhost:5000'))
  : 'http://localhost:5000';

export default function Profile() {
  const { admin } = useAuth();
  const params = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ id: '', name: '', role: '', avatar: null, avatarPreview: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    // If id provided in route use it, otherwise use admin id or 'admin'
    const id = params.id || (admin?.id || 'admin');
    setProfile(p => ({ ...p, id }));
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/profile/${id}`, { baseURL: BACKEND_URL });
        const inst = JSON.parse(localStorage.getItem('digilib_institution')) || {};
        const merged = {
          id,
          name: res.data.name || inst.adminName || '',
          role: res.data.role || inst.role || '',
          avatar: res.data.avatar || null,
        };
        setProfile(prev => ({ ...prev, ...merged }));
        if (res.data.avatar) setProfile(prev => ({ ...prev, avatarPreview: `${BACKEND_URL}${res.data.avatar}` }));
      } catch (err) {
        // If no server profile, fall back to localStorage admin data
        const inst = JSON.parse(localStorage.getItem('digilib_institution')) || {};
        const fallbackName = inst.adminName || admin?.name || '';
        setProfile(prev => ({ ...prev, name: fallbackName }));
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
      const res = await axios.post('/api/profile', data, { baseURL: BACKEND_URL });
      // Update preview to backend URL if avatar was saved
      if (res.data?.profile?.avatar) {
        setProfile(prev => ({ ...prev, avatarPreview: `${BACKEND_URL}${res.data.profile.avatar}` }));
      }
      // Also update local institution admin name so UI is consistent even without server
      try {
        const inst = JSON.parse(localStorage.getItem('digilib_institution')) || {};
        inst.adminName = profile.name;
        localStorage.setItem('digilib_institution', JSON.stringify(inst));
      } catch (e) {}
      setSuccess('Profile saved successfully');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Failed to save profile');
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
          Admin Profile
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 3 }}>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
              <Avatar src={profile.avatarPreview} alt="avatar" sx={{ width: 150, height: 150, mb: 2 }} />
              <Button variant="outlined" component="label" disabled={!isEditing}>
                Change Avatar
                <input type="file" hidden accept="image/*" onChange={handleFile} />
              </Button>
            </Grid>
            <Grid item xs={12} md={8}>
              <Stack spacing={3}>
                <Box>
                  <Typography variant="caption" color="text.secondary">Admin ID</Typography>
                  <Typography sx={{ mb: 1 }}>{profile.id}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Full Name</Typography>
                  {isEditing ? (
                    <TextField name="name" value={profile.name} onChange={handleChange} fullWidth />
                  ) : (
                    <Typography sx={{ mb: 1 }}>{profile.name}</Typography>
                  )}
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Role</Typography>
                  {isEditing ? (
                    <TextField name="role" value={profile.role} onChange={handleChange} fullWidth />
                  ) : (
                    <Typography sx={{ mb: 1 }}>{profile.role}</Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                  {isEditing ? (
                    <>
                      <Button type="submit" variant="contained" disabled={loading}>
                        {loading ? 'Saving...' : 'Save Changes'}
                      </Button>
                      <Button variant="outlined" color="secondary" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <Button variant="contained" onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  )}
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}