import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Container, Paper, Typography, TextField, Button, Box, Avatar, Stack, Alert, Grid } from '@mui/material';

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
                <TextField name="id" label="Admin ID" value={profile.id} InputProps={{ readOnly: true }} variant="filled" />
                <TextField name="name" label="Full Name" value={profile.name} onChange={handleChange} disabled={!isEditing} variant="filled" />
                <TextField name="role" label="Role" value={profile.role} onChange={handleChange} disabled={!isEditing} variant="filled" />
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