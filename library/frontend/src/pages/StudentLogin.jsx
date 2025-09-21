import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../StudentAuthContext';
import { toast } from 'react-hot-toast';
import { Box, Paper, Typography, TextField, Button } from '@mui/material';

export default function StudentLogin() {
  const [credentials, setCredentials] = useState({ studentId: '', password: '' });
  const { login } = useStudentAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials.studentId, credentials.password);
      toast.success('Login successful!');
      navigate('/student-dashboard');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center', p: 2 }}>
      <Paper elevation={6} sx={{ maxWidth: 420, width: '100%', p: 5, borderRadius: 4 }}>
        <Typography variant="h4" color="primary" fontWeight={700} textAlign="center" gutterBottom>
          Student Portal Login
        </Typography>
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mb: 3 }}>
          Enter your student ID and password to access your library account
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField id="studentId" name="studentId" type="text" required label="Student ID" placeholder="e.g., STU-JOH-4682" value={credentials.studentId} onChange={handleChange} />
          <TextField id="password" name="password" type="password" required label="Password" value={credentials.password} onChange={handleChange} />
          <Button type="submit" variant="contained" color="primary" size="large" sx={{ py: 1.5, borderRadius: 2, fontWeight: 700 }}>
            Sign in
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}