import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import bcrypt from 'bcryptjs';
import { Container, Box, Typography, TextField, Button, Link } from '@mui/material';

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

