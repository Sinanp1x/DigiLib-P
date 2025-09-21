import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Container, Grid, Card, CardContent, Typography, Button, Box } from '@mui/material';

export default function Requests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const institution = JSON.parse(localStorage.getItem('digilib_institution'));
    const pendingRequests = (institution?.bookingRequests || []).filter((req) => req.status === 'pending');
    setRequests(pendingRequests);
  }, []);

  const handleRequest = (request, approved, reason = '') => {
    const institution = JSON.parse(localStorage.getItem('digilib_institution')) || {};

    if (approved) {
      const newTransaction = {
        transactionId: `TXN-${Date.now()}`,
        bookId: request.bookId,
        bookTitle: request.bookTitle,
        studentId: request.studentId,
        studentName: request.studentName,
        checkoutDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'checkedOut',
      };

      const updatedBooks = (institution.books || []).map((book) => {
        if (book.uniqueBookId === request.bookId) {
          if ((book.copiesAvailable || 0) === 0) {
            toast.error('No copies available');
            throw new Error('No copies available');
          }
          return { ...book, copiesAvailable: (book.copiesAvailable || 0) - 1 };
        }
        return book;
      });

      institution.books = updatedBooks;
      institution.transactions = [...(institution.transactions || []), newTransaction];
    }

    institution.bookingRequests = (institution.bookingRequests || []).map((req) => {
      if (req.requestId === request.requestId) {
        return { ...req, status: approved ? 'approved' : 'rejected', ...(reason && { rejectionReason: reason }) };
      }
      return req;
    });

    localStorage.setItem('digilib_institution', JSON.stringify(institution));
    setRequests((prev) => prev.filter((req) => req.requestId !== request.requestId));
    toast.success(approved ? 'Request approved and book checked out' : 'Request rejected');
  };

  const handleReject = (request) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason !== null) handleRequest(request, false, reason);
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h4" color="primary" fontWeight={700} sx={{ mb: 4 }}>
        Pending Book Requests
      </Typography>
      {requests.length > 0 ? (
        <Grid container spacing={3}>
          {requests.map((request) => (
            <Grid item key={request.requestId} xs={12} md={6}>
              <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)' }}>
                <CardContent>
                  <Typography variant="h6" color="primary" fontWeight={700} gutterBottom>
                    {request.bookTitle}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">Book ID: {request.bookId}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Requested by: {request.studentName} ({request.studentId})
                  </Typography>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Request Date: {new Date(request.requestDate).toLocaleDateString()}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                    <Button variant="contained" color="success" onClick={() => handleRequest(request, true)}>
                      Approve
                    </Button>
                    <Button variant="outlined" color="error" onClick={() => handleReject(request)}>
                      Reject
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Typography variant="body2" color="text.secondary" textAlign="center">
          No pending requests
        </Typography>
      )}
    </Container>
  );
}