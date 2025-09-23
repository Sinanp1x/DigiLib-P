import { useMemo } from 'react';
import { Routes, Route, Link as RouterLink } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import StudentCatalogue from './StudentCatalogue';
import StudentMyBooks from './StudentMyBooks';
import StudentRequests from './StudentRequests';
import StudentFines from './StudentFines';
import Community from './Community';
import StudentProfile from './StudentProfile';
import { Box, Container, Grid, Card, CardActionArea, CardContent, Typography, Chip, Divider, List, ListItem, ListItemText, ListItemButton, ListItemIcon } from '@mui/material';
import { Book as BookIcon, LibraryBooks as LibraryBooksIcon, RequestQuote as RequestQuoteIcon, People as PeopleIcon } from '@mui/icons-material';
import { useStudentAuth } from '../StudentAuthContext';

function StudentDashboardHome() {
  const { student } = useStudentAuth();

  const { activeBorrows, pendingRequests, outstandingFine, recentActivity } = useMemo(() => {
    const institution = JSON.parse(localStorage.getItem('digilib_institution')) || {};
    const transactions = (institution.transactions || []).filter(t => t.studentId === student?.uniqueStudentId);
    const requests = (institution.bookingRequests || []).filter(r => r.studentId === student?.uniqueStudentId);

    // Calculate fines
    const FINE_RATE_PER_DAY = 1;
    const today = new Date();
    let fineTotal = 0;
    transactions.forEach(t => {
      const due = new Date(t.dueDate);
      if (due < today) {
        const days = Math.floor((today - due) / (1000 * 60 * 60 * 24));
        fineTotal += days * FINE_RATE_PER_DAY;
      }
    });

    const history = (institution.history || []).filter(h => h.studentId === student?.uniqueStudentId);
    const recent = history
      .slice(-5)
      .reverse()
      .map(h => ({
        primary: `${h.status === 'returned' ? 'Returned' : 'Borrowed'} ${h.bookTitle}`,
        secondary: `${h.checkoutDate}${h.checkinDate ? ` → ${h.checkinDate}` : ''}`,
      }));

    return {
      activeBorrows: transactions.length,
      pendingRequests: requests.filter(r => r.status === 'pending').length,
      outstandingFine: fineTotal,
      recentActivity: recent,
    };
  }, [student?.uniqueStudentId]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" fontWeight={700} color="primary" gutterBottom>
        Welcome to Your Library Portal
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Quick Stats</Typography>
              <Divider sx={{ mb: 2 }} />
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography color="text.secondary">Books Currently Borrowed</Typography>
                    <Chip label={activeBorrows} color="primary" variant="outlined" />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography color="text.secondary">Pending Requests</Typography>
                    <Chip label={pendingRequests} color="primary" variant="outlined" />
                  </Box>
                </Grid>
                <Grid item xs={12}>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Typography color="text.secondary">Outstanding Fines</Typography>
                    <Chip label={`${outstandingFine.toFixed(2)}`} color={outstandingFine > 0 ? 'error' : 'success'} variant="outlined" />
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={3}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Recent Activity</Typography>
              <Divider sx={{ mb: 2 }} />
              {recentActivity.length > 0 ? (
                <List dense>
                  {recentActivity.map((item, idx) => (
                    <ListItem key={idx} disableGutters>
                      <ListItemText primary={item.primary} secondary={item.secondary} />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography color="text.secondary" align="center" sx={{ py: 2 }}>
                  No recent activity
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Typography variant="h6" gutterBottom>Quick Actions</Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Card elevation={3}>
                <CardActionArea component={RouterLink} to="/student-dashboard/catalogue" sx={{ p: 2, textAlign: 'center' }}>
                  <BookIcon fontSize="large" color="primary" />
                  <Typography variant="body2" sx={{ mt: 1 }}>Browse Catalogue</Typography>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card elevation={3}>
                <CardActionArea component={RouterLink} to="/student-dashboard/my-books" sx={{ p: 2, textAlign: 'center' }}>
                  <LibraryBooksIcon fontSize="large" color="primary" />
                  <Typography variant="body2" sx={{ mt: 1 }}>View My Books</Typography>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card elevation={3}>
                <CardActionArea component={RouterLink} to="/student-dashboard/fines" sx={{ p: 2, textAlign: 'center' }}>
                  <RequestQuoteIcon fontSize="large" color="primary" />
                  <Typography variant="body2" sx={{ mt: 1 }}>Check Fines</Typography>
                </CardActionArea>
              </Card>
            </Grid>
            <Grid item xs={6}>
              <Card elevation={3}>
                <CardActionArea component={RouterLink} to="/student-dashboard/community" sx={{ p: 2, textAlign: 'center' }}>
                  <PeopleIcon fontSize="large" color="primary" />
                  <Typography variant="body2" sx={{ mt: 1 }}>Community</Typography>
                </CardActionArea>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      
    </Container>
  );
}

export default function StudentDashboard() {
  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <StudentNavbar />
      <Routes>
        <Route index element={<StudentDashboardHome />} />
        <Route path="/catalogue" element={<StudentCatalogue />} />
        <Route path="/profile" element={<StudentProfile />} />
        <Route path="/my-books" element={<StudentMyBooks />} />
        <Route path="/requests" element={<StudentRequests />} />
        <Route path="/fines" element={<StudentFines />} />
        <Route path="/community" element={<Community />} />
      </Routes>
    </Box>
  );
}