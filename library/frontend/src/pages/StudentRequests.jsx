import { useState, useEffect } from 'react';
import { useStudentAuth } from '../StudentAuthContext';
import { Container, Typography, Card, CardContent, Chip, Box } from '@mui/material';

export default function StudentRequests() {
  const [requests, setRequests] = useState([]);
  const { student } = useStudentAuth();

  useEffect(() => {
    const institution = JSON.parse(localStorage.getItem('digilib_institution'));
    const studentRequests = (institution?.bookingRequests || [])
      .filter(req => req.studentId === student.uniqueStudentId);
    setRequests(studentRequests);
  }, [student.uniqueStudentId]);

  const getStatusProps = (status) => {
    switch (status) {
      case 'pending':
        return { color: 'warning', variant: 'outlined' };
      case 'approved':
        return { color: 'success', variant: 'filled' };
      case 'rejected':
        return { color: 'error', variant: 'filled' };
      default:
        return { color: 'default', variant: 'outlined' };
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
        My Book Requests
      </Typography>

      {requests.length > 0 ? (
        <Box display="flex" flexDirection="column" gap={2}>
          {requests.map((request) => (
            <Card key={request.requestId}>
              <CardContent>
                <Box display="flex" alignItems="flex-start" justifyContent="space-between" gap={2}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>{request.bookTitle}</Typography>
                    <Typography variant="caption" color="text.secondary">Request ID: {request.requestId}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Requested on: {new Date(request.requestDate).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Chip
                    label={request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                    size="small"
                    {...getStatusProps(request.status)}
                  />
                </Box>
                {request.rejectionReason && (
                  <Box mt={2} p={1.5} bgcolor={(theme) => theme.palette.error[50]} borderRadius={1}>
                    <Typography variant="body2" color="error.main">
                      <strong>Reason for rejection:</strong> {request.rejectionReason}
                    </Typography>
                  </Box>
                )}
              </CardContent>
            </Card>
          ))}
        </Box>
      ) : (
        <Box textAlign="center" py={6}>
          <Typography color="text.secondary">You haven't made any book requests yet.</Typography>
          <Typography variant="body2" color="text.disabled" mt={1}>
            Visit the catalogue to browse and request books.
          </Typography>
        </Box>
      )}
    </Container>
  );
}