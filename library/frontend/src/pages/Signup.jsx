import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import { Container, Box, Typography, TextField, Button, Link } from '@mui/material';

export default function Signup() {

  const [selected, setSelected] = useState("school");
  const [departmentName, setDepartmentName] = useState('');

  const [form, setForm] = useState({
    institutionName: '',
    institutionType: '',
    adminName: '',
    adminEmail: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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
    try {
      const payload = {
        institutionName: form.institutionName,
        institutionType: selected,
        adminName: form.adminName,
        adminEmail: form.adminEmail,
        password: form.password,
        departmentName: selected !== 'school' ? departmentName : undefined
      };
      await axios.post('/api/auth/signup', payload);
      setSuccess('Registration successful! Please check your email for the license key to activate your account.');
      setError('');
      // Don't navigate immediately - user needs to activate license first
    } catch (err) {
      setError(err.response?.data?.message || 'Signup failed');
      setSuccess('');
    }
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: 4,
          borderRadius: 2,
          boxShadow: 3,
          backgroundColor: 'background.paper',
        }}
      >
        <Typography component="h1" variant="h5" sx={{ mb: 3 }}>
          Institution Signup
        </Typography>
        <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="institutionName"
            label="Institution Name"
            name="institutionName"
            autoComplete="organization"
            autoFocus
            value={form.institutionName}
            onChange={handleChange}
          />
          <select 
            margin="normal"
            required
            fullWidth
            name="institutionType" 
            id="institutionType"
            autoComplete="typeofOrganization"
            autoFocus
            value={selected}
            onChange={(e) => {
              setSelected(e.target.value);
              setDepartmentName('');
            }}
          >
            <option value="school">School</option>
            <option value="College">University/College</option>
          </select>
          {selected !== 'school' && (
          <TextField
            margin='normal'
            required
            fullWidth
            id="departmentName"
            label="Department Name"
            name="departmentName"
            autoComplete="department"
            value={departmentName}
            onChange={e => setDepartmentName(e.target.value)}
          />
          )}
          <TextField
            margin="normal"
            required
            fullWidth
            id="adminName"
            label="Admin Name"
            name="adminName"
            autoComplete="name"
            value={form.adminName}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="adminEmail"
            label="Admin Email"
            name="adminEmail"
            autoComplete="email"
            value={form.adminEmail}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="new-password"
            value={form.password}
            onChange={handleChange}
          />
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 1, mb: 2 }}>
              {error}
            </Typography>
          )}
          {success && (
            <Typography color="success" variant="body2" sx={{ mt: 1, mb: 2 }}>
              {success}
            </Typography>
          )}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Signup
          </Button>
          <Link component={RouterLink} to="/login" variant="body2">
            {"Login instead"}
          </Link>
        </Box>
      </Box>
    </Container>
  );
}

