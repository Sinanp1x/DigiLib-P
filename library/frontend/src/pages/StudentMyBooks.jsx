import { useState, useEffect } from 'react';
import { useStudentAuth } from '../StudentAuthContext';
import { Container, Typography, Grid, Card, CardContent, Chip, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';

export default function StudentMyBooks() {
  const [transactions, setTransactions] = useState([]);
  const [history, setHistory] = useState([]);
  const { student } = useStudentAuth();

  useEffect(() => {
    const institution = JSON.parse(localStorage.getItem('digilib_institution'));
    
    const activeTransactions = (institution?.transactions || [])
      .filter(t => t.studentId === student.uniqueStudentId);
    
    const transactionHistory = (institution?.history || [])
      .filter(h => h.studentId === student.uniqueStudentId);
    
    setTransactions(activeTransactions);
    setHistory(transactionHistory);
  }, [student.uniqueStudentId]);

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={700} color="primary" gutterBottom>
        My Library Books
      </Typography>

      {/* Active Borrows */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Currently Borrowed Books
        </Typography>
        {transactions.length > 0 ? (
          <Grid container spacing={2}>
            {transactions.map((transaction) => {
              const overdue = isOverdue(transaction.dueDate);
              return (
                <Grid item xs={12} md={6} key={transaction.transactionId}>
                  <Card variant="outlined" sx={{ borderColor: overdue ? 'error.light' : 'divider' }}>
                    <CardContent>
                      <Typography variant="subtitle1" fontWeight={600} gutterBottom>
                        {transaction.bookTitle}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Book ID: {transaction.bookId}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Checked Out: {transaction.checkoutDate}
                      </Typography>
                      <Box mt={1}>
                        <Chip
                          label={`Due: ${transaction.dueDate}${overdue ? ' (OVERDUE)' : ''}`}
                          color={overdue ? 'error' : 'default'}
                          variant={overdue ? 'filled' : 'outlined'}
                          size="small"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Typography color="text.secondary">No books currently borrowed</Typography>
        )}
      </Box>

      {/* History */}
      <Box>
        <Typography variant="h6" gutterBottom>
          Borrowing History
        </Typography>
        {history.length > 0 ? (
          <TableContainer component={Paper}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Book Title</TableCell>
                  <TableCell>Check-out Date</TableCell>
                  <TableCell>Check-in Date</TableCell>
                  <TableCell>Status</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map((item, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{item.bookTitle}</Typography>
                      <Typography variant="caption" color="text.secondary">{item.bookId}</Typography>
                    </TableCell>
                    <TableCell>{item.checkoutDate}</TableCell>
                    <TableCell>{item.checkinDate}</TableCell>
                    <TableCell>
                      <Chip label={item.status} color={item.status === 'returned' ? 'success' : 'default'} size="small" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Typography color="text.secondary">No borrowing history available</Typography>
        )}
      </Box>
    </Container>
  );
}