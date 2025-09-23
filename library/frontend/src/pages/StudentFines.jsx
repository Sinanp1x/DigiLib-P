import { useState, useEffect } from 'react';
import { useStudentAuth } from '../StudentAuthContext';
import { Container, Typography, Paper, Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip } from '@mui/material';

const FINE_RATE_PER_DAY = 1; // $1 per day

export default function StudentFines() {
  const [fines, setFines] = useState([]);
  const [totalFine, setTotalFine] = useState(0);
  const { student } = useStudentAuth();

  useEffect(() => {
    const load = () => {
      const institution = JSON.parse(localStorage.getItem('digilib_institution'));
      const activeTransactions = (institution?.transactions || [])
        .filter(t => t.studentId === student.uniqueStudentId);

      const calculatedFines = activeTransactions.map(transaction => {
      const dueDate = new Date(transaction.dueDate);
      const today = new Date();
      
      if (dueDate < today) {
        const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        const fineAmount = daysOverdue * FINE_RATE_PER_DAY;
        
        return {
          transactionId: transaction.transactionId,
          bookTitle: transaction.bookTitle,
          dueDate: transaction.dueDate,
          daysOverdue,
          amount: fineAmount
        };
      }
      return null;
    }).filter(Boolean);

      const paidFines = (institution?.history || [])
        .filter(h => h.studentId === student.uniqueStudentId && h.fine)
        .map(h => ({
          ...h.fine,
          paid: true,
          bookTitle: h.bookTitle,
        }));

      const allFines = [...calculatedFines, ...paidFines];
      setFines(allFines);

      const total = calculatedFines.reduce((sum, fine) => sum + fine.amount, 0);
      setTotalFine(total);
    };

    load();
    const handler = () => load();
    window.addEventListener('digilib:transactions-updated', handler);
    return () => window.removeEventListener('digilib:transactions-updated', handler);
  }, [student.uniqueStudentId]);

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3}>
        <Typography variant="h5" fontWeight={700} color="primary">My Fines</Typography>
        <Paper elevation={2} sx={{ px: 2.5, py: 1.5, borderRadius: 2 }}>
          <Typography variant="body2" color="text.secondary" component="span">Total Outstanding:</Typography>
          <Typography variant="h6" color="error.main" component="span" ml={1}>
            ${totalFine.toFixed(2)}
          </Typography>
        </Paper>
      </Box>

      {fines.length > 0 ? (
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Book</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell>Days Overdue</TableCell>
                <TableCell>Amount</TableCell>
                <TableCell>Status</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {fines.map((fine, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>{fine.bookTitle}</Typography>
                  </TableCell>
                  <TableCell>{fine.dueDate}</TableCell>
                  <TableCell>{fine.daysOverdue}</TableCell>
                  <TableCell>${fine.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Chip
                      label={fine.paid ? 'Paid' : 'Unpaid'}
                      color={fine.paid ? 'success' : 'error'}
                      size="small"
                      variant={fine.paid ? 'outlined' : 'filled'}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : (
        <Paper sx={{ textAlign: 'center', py: 4, borderRadius: 2 }}>
          <Typography color="text.secondary">You don't have any fines</Typography>
        </Paper>
      )}

      <Paper sx={{ mt: 3, p: 2, bgcolor: 'info.50', border: (theme) => `1px solid ${theme.palette.info.light}` }}>
        <Typography color="info.dark" fontWeight={600} gutterBottom>Fine Policy</Typography>
        <Typography variant="body2" color="info.main">
          Fines are calculated at a rate of ${FINE_RATE_PER_DAY.toFixed(2)} per day for overdue books.
          Please return books on time to avoid fines. Contact the librarian if you need to extend your due date.
        </Typography>
      </Paper>
    </Container>
  );
}