import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { useStudentAuth } from '../StudentAuthContext';
import { validatePassword, hashPassword } from '../utils/auth';
import { Container, Paper, Typography, TextField, Button, Box, Avatar, Stack, Alert, Divider, Grid } from '@mui/material';

const BACKEND_URL = (typeof import.meta !== 'undefined' && import.meta.env)
  ? (import.meta.env.VITE_BACKEND_URL || (import.meta.env.DEV ? '' : 'http://localhost:5000'))
  : 'http://localhost:5000';

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
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const id = params.id || (student?.id || 'student');
    setProfile(p => ({ ...p, id }));
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`/api/profile/${id}`, { baseURL: BACKEND_URL });
        const inst = JSON.parse(localStorage.getItem('digilib_institution')) || {};
        const studentLocal = (inst.students || []).find(s => s.uniqueStudentId === id) || {};
        const merged = {
          id,
          name: res.data.name || studentLocal.name || '',
          role: res.data.role || studentLocal.role || 'student',
          avatar: res.data.avatar || null,
        };
        setProfile(prev => ({ ...prev, ...merged }));
        if (res.data.avatar) setProfile(prev => ({ ...prev, avatarPreview: `${BACKEND_URL}${res.data.avatar}` }));
      } catch (err) {
        const inst = JSON.parse(localStorage.getItem('digilib_institution')) || {};
        const studentLocal = (inst.students || []).find(s => s.uniqueStudentId === id) || {};
        setProfile(prev => ({ ...prev, name: studentLocal.name || '' }));
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
    // allow calling handleSubmit() without an event (manual save button)
    if (e && e.preventDefault) e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      data.append('id', profile.id);
      data.append('name', profile.name);
      data.append('role', profile.role);
      if (profile.avatar) data.append('file', profile.avatar);
      const res = await axios.post('/api/profile', data, { baseURL: BACKEND_URL });
      if (res.data?.profile?.avatar) {
        setProfile(prev => ({ ...prev, avatarPreview: `${BACKEND_URL}${res.data.profile.avatar}` }));
      }
      // Also persist name and avatar path to local students list for offline consistency
      try {
        const inst = JSON.parse(localStorage.getItem('digilib_institution')) || {};
        const students = Array.isArray(inst.students) ? inst.students : [];
        const idx = students.findIndex(s => s.uniqueStudentId === profile.id);
        if (idx !== -1) {
          const updated = { ...students[idx], name: profile.name };
          if (res.data?.profile?.avatar) {
            // store the backend-relative avatar path so other parts can construct the full URL
            updated.avatar = res.data.profile.avatar;
          }
          students[idx] = updated;
        }
        inst.students = students;
        localStorage.setItem('digilib_institution', JSON.stringify(inst));
      } catch (e) {}
      setSuccess('Profile saved successfully');
      setIsEditing(false); // to exit editing mode
      setTimeout(() => setSuccess(''), 3000);
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
    <Container maxWidth="md" sx={{ py: 6 }}>
      <Paper elevation={3} sx={{ p: 4, borderRadius: 4 }}>
        <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
          Student Profile
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
                  <Typography variant="caption" color="text.secondary">Student ID</Typography>
                  <Typography sx={{ mb: 1 }}>{profile.id}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary">Full Name</Typography>
                  {isEditing ? (
                    <TextField
                      name="name"
                      value={profile.name}
                      onChange={handleChange}
                      fullWidth
                      onKeyDown={(e) => {
                        // Prevent Enter from submitting the form so users have time to edit
                        if (e.key === 'Enter') e.preventDefault();
                      }}
                    />
                  ) : (
                    <Typography sx={{ mb: 1 }}>{profile.name}</Typography>
                  )}
                </Box>
                <Box sx={{ display: 'flex', gap: 2, pt: 2 }}>
                  {isEditing ? (
                    <>
                      <Button
                        variant="contained"
                        disabled={loading}
                        onClick={() => handleSubmit()}
                      >
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

        <Divider sx={{ my: 4 }} />
        <Typography variant="h6" fontWeight={700} gutterBottom>Change Password</Typography>
        {pwdError && <Alert severity="error" sx={{ mb: 2 }}>{pwdError}</Alert>}
        {pwdSuccess && <Alert severity="success" sx={{ mb: 2 }}>{pwdSuccess}</Alert>}
        <Box component="form" onSubmit={handlePasswordUpdate} sx={{ maxWidth: 400 }}>
          <Stack spacing={2} sx={{ mt: 2 }}>
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