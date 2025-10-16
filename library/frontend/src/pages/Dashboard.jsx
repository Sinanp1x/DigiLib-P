import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Box, Typography, Grid, Card, CardActionArea, CardContent } from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import ShoppingCartCheckoutIcon from '@mui/icons-material/ShoppingCartCheckout';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import HistoryIcon from '@mui/icons-material/History';
import RequestQuoteIcon from '@mui/icons-material/RequestQuote';
import ForumIcon from '@mui/icons-material/Forum';

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const institution = JSON.parse(localStorage.getItem('digilib_institution')) || {};
  const portalEnabled = !!institution.portalEnabled;
  const cards = [
    { title: 'Manage Students', path: '/admin/dashboard/students', icon: <PeopleIcon color="primary" sx={{ fontSize: 40 }} /> },
    { title: 'Manage Catalogue', path: '/admin/dashboard/catalogue', icon: <MenuBookIcon color="primary" sx={{ fontSize: 40 }} /> },
    { title: 'Check Out Book', path: '/admin/dashboard/checkout', icon: <ShoppingCartCheckoutIcon color="primary" sx={{ fontSize: 40 }} /> },
    { title: 'Active Transactions', path: '/admin/dashboard/transactions', icon: <AutorenewIcon color="primary" sx={{ fontSize: 40 }} /> },
    { title: 'Transaction History', path: '/admin/dashboard/history', icon: <HistoryIcon color="primary" sx={{ fontSize: 40 }} /> },
    ...(portalEnabled ? [
      { title: 'Book Requests', path: '/admin/dashboard/requests', icon: <RequestQuoteIcon color="primary" sx={{ fontSize: 40 }} /> },
      { title: 'Community Reviews', path: '/admin/dashboard/community', icon: <ForumIcon color="primary" sx={{ fontSize: 40 }} /> },
    ] : []),
  ];

  const handleCardClick = (card) => navigate(card.path);

  return (
    <Box sx={{
      minHeight: '100vh',
      bgcolor: 'background.default',
      py: 8,
    }}>
      <Typography variant="h3" color="primary" fontWeight={800} textAlign="center" gutterBottom sx={{ mb: 6, letterSpacing: '0.02em' }}>
        Admin Dashboard
      </Typography>
      <Grid container spacing={4} justifyContent="center" sx={{ maxWidth: '1100px', mx: 'auto' }}>
        {cards.map((card) => (
          <Grid item key={card.title} xs={12} sm={6} md={4} lg={3}>
            <Card>
              <CardActionArea onClick={() => handleCardClick(card)} sx={{ height: '100%' }}>
                <CardContent sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 120, flexDirection: 'column' }}>
                  {card.icon}
                  <Typography variant="h6" color="primary" fontWeight={700} textAlign="center" sx={{ letterSpacing: '0.04em', mt: 1 }}>
                    {card.title}
                  </Typography>
                </CardContent>
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
}
