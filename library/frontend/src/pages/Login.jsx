import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { useAuth } from '../AuthContext';
import { Box, Typography, TextField, Button, Paper } from '@mui/material';

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
  navigate('/admin/dashboard');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Paper elevation={6} sx={{ maxWidth: 400, width: '100%', p: 5, borderRadius: 4, boxShadow: '0 8px 32px rgba(25, 118, 210, 0.12)' }}>
        <Typography variant="h4" color="primary" fontWeight={700} textAlign="center" gutterBottom sx={{ mb: 3, letterSpacing: '0.03em' }}>
          Admin Login
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField type="email" name="adminEmail" label="Admin Email" value={form.adminEmail} onChange={handleChange} required fullWidth variant="outlined" />
          <TextField type="password" name="password" label="Password" value={form.password} onChange={handleChange} required fullWidth variant="outlined" />
          {error && <Typography color="error" fontWeight={600} fontSize={14}>{error}</Typography>}
          <Button type="submit" variant="contained" color="primary" size="large" sx={{ fontWeight: 700, borderRadius: 2, py: 1.5, boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)' }}>
            Login
          </Button>
        </Box>
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Link to="/signup" style={{ color: '#1976d2', textDecoration: 'underline', fontWeight: 500 }}>Signup instead</Link>
        </Box>
      </Paper>
    </Box>
  );
}
