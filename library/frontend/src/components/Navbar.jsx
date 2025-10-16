import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useAuth } from '../AuthContext';
import pixLogo from '../assets/pix_logo1.png';
import digilibltrpd from '../assets/letterpad.png';

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleMenu = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const goDashboard = () => navigate('/admin/dashboard');
  const goProfile = () => { handleClose(); navigate('/admin/dashboard/profile'); };
  const handleLogout = () => { handleClose(); logout(); navigate('/admin/login'); };

  return (
    <AppBar position="sticky" color="primary" sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <Toolbar sx={{ alignItems: 'center', minHeight: { xs: 56, sm: 64 }, justifyContent: 'space-between' }}>
        {/* Left: Title */}
        <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <img
            src={digilibltrpd}
            alt="DigiLib"
            style={{
              height: 40,
              objectFit: 'contain',
              marginTop: 0,
              marginBottom: 0,
              verticalAlign: 'middle',
            }}
          />
        </Box>
        {/* Center: Logo */}
        <Box
          sx={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: 48,
          }}
        >
          <img
            src={pixLogo}
            alt="Logo"
            style={{
              height: 40,
              objectFit: 'contain',
              marginTop: 0,
              marginBottom: 0,
              verticalAlign: 'middle',
            }}
          />
        </Box>
        {/* Right: Links */}
        <Box sx={{ flex: 1, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          {/* Desktop Links: Dashboard + Profile Menu */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
            <Button color="inherit" onClick={goDashboard} sx={{ fontWeight: 700, color: '#3C467B' }}>Dashboard</Button>
            <Button color="inherit" onClick={handleMenu} sx={{ fontWeight: 700, color: '#3C467B' }}>Profile</Button>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose} keepMounted>
              <MenuItem onClick={goProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
          {/* Mobile Menu: hamburger with Dashboard + Profile + Logout */}
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton color="inherit" onClick={handleMenu}>
              <MenuIcon />
            </IconButton>
            <Menu anchorEl={anchorEl} open={open} onClose={handleClose} keepMounted>
              <MenuItem onClick={goProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
