import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../StudentAuthContext';
import { AppBar, Toolbar, Typography, Box, Button, IconButton, Menu, MenuItem, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { useState } from 'react';

export default function StudentNavbar() {
  const { student, logout } = useStudentAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e) => setAnchorEl(e.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const isActive = (path) => location.pathname.startsWith(path);

  return (
    <AppBar position="sticky" color="primary" sx={{ boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>Student Portal</Typography>
        <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
          <Button color="inherit" component={RouterLink} to="/student-dashboard" sx={{ fontWeight: isActive('/student-dashboard') ? 800 : 700 }}>
            Dashboard
          </Button>
          <Button color="inherit" onClick={handleOpen} sx={{ fontWeight: 700 }}>Profile</Button>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose} keepMounted>
            <MenuItem component={RouterLink} to="/student-dashboard/profile" onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={() => { handleClose(); logout(); navigate('/student/login'); }}>Sign Out</MenuItem>
          </Menu>
        </Box>

        <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
          <IconButton color="inherit" onClick={handleOpen}>
            <MenuIcon />
          </IconButton>
          <Menu anchorEl={anchorEl} open={open} onClose={handleClose} keepMounted>
            <MenuItem component={RouterLink} to="/student-dashboard/profile" onClick={handleClose}>Profile</MenuItem>
            <MenuItem onClick={() => { handleClose(); logout(); navigate('/student/login'); }}>Sign Out</MenuItem>
          </Menu>
        </Box>
      </Toolbar>
    </AppBar>
  );
}