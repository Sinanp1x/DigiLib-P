import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useStudentAuth } from '../StudentAuthContext';
import { validatePassword, hashPassword } from '../utils/auth';
import { Container, Paper, Typography, TextField, Button, Box, Avatar, Stack, Alert, Divider } from '@mui/material';

export default function StudentProfile() {
  const { student } = useStudentAuth();
  const params = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState({ id: '', name: '', role: 'student', avatar: null, avatarPreview: null });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pwdForm, setPwdForm] = useState({ current: '', next: '', confirm: '' });
  const [pwdError, setPwdError] = useState('');
  const [pwdSuccess, setPwdSuccess] = useState('');

  useEffect(() => {
    const id = params.id || (student?.id || 'student');
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
  }, [params.id, student]);

  const handleFile = (e) => {
    const f = e.target.files[0];
    setProfile(prev => ({ ...prev, avatar: f, avatarPreview: URL.createObjectURL(f) }));
  };

  const handleChange = (e) => setProfile(prev => ({ ...prev, [e.target.name]: e.target.value }));
  const handlePwdChange = (e) => setPwdForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

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
      if (res.data?.profile?.avatar) {
        setProfile(prev => ({ ...prev, avatarPreview: `http://localhost:5000${res.data.profile.avatar}` }));
      }
      setSuccess('Profile saved successfully');
      setTimeout(() => navigate('/student-dashboard'), 700);
    } catch (err) {
      setError('Failed to save profile');
      console.error(err);
    }
    setLoading(false);
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    setPwdError('');
    setPwdSuccess('');
    try {
      const inst = JSON.parse(localStorage.getItem('digilib_institution')) || {};
      const students = Array.isArray(inst.students) ? inst.students : [];
      const sid = student?.uniqueStudentId || profile.id;
      const sIdx = students.findIndex(s => s.uniqueStudentId === sid);
      if (sIdx === -1) throw new Error('Student not found');

      const s = students[sIdx];
      if (!validatePassword(pwdForm.current, s.password)) {
        setPwdError('Current password is incorrect');
        return;
      }
      if (!pwdForm.next || pwdForm.next.length < 4) {
        setPwdError('New password must be at least 4 characters');
        return;
      }
      if (pwdForm.next !== pwdForm.confirm) {
        setPwdError('New password and confirm do not match');
        return;
      }
      students[sIdx] = { ...s, password: hashPassword(pwdForm.next) };
      const updated = { ...inst, students };
      localStorage.setItem('digilib_institution', JSON.stringify(updated));
      setPwdSuccess('Password updated successfully');
      setPwdForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwdError('Failed to update password');
      console.error(err);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 3, borderRadius: 3 }}>
        <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
          Student Profile
        </Typography>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField name="id" label="ID" value={profile.id} InputProps={{ readOnly: true }} />
            <TextField name="name" label="Name" value={profile.name} onChange={handleChange} />
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

        <Divider sx={{ my: 3 }} />
        <Typography variant="h6" fontWeight={700} gutterBottom>Change Password</Typography>
        {pwdError && <Alert severity="error" sx={{ mb: 2 }}>{pwdError}</Alert>}
        {pwdSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwdSuccess}</Alert>}
        <Box component="form" onSubmit={handlePasswordUpdate}>
          <Stack spacing={2}>
            <TextField name="current" label="Current Password" type="password" value={pwdForm.current} onChange={handlePwdChange} required />
            <TextField name="next" label="New Password" type="password" value={pwdForm.next} onChange={handlePwdChange} required />
            <TextField name="confirm" label="Confirm New Password" type="password" value={pwdForm.confirm} onChange={handlePwdChange} required />
            <Box>
              <Button type="submit" variant="outlined">Update Password</Button>
            </Box>
          </Stack>
        </Box>
      </Paper>
    </Container>
  );
}
