import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';
import { useAuth } from '../AuthContext';

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
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '0.02em' }}>
          Digi-Lib
        </Typography>

        {/* Desktop Links: Dashboard + Profile Menu */}
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
          <Button color="inherit" onClick={goDashboard} sx={{ fontWeight: 700 }}>Dashboard</Button>
          <Button color="inherit" onClick={handleMenu} sx={{ fontWeight: 700 }}>Profile</Button>
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
      </Toolbar>
    </AppBar>
  );
}
