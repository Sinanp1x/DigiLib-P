import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Container, Grid, Card, CardContent, Typography, Button, Chip, Box } from '@mui/material';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const institutionData = JSON.parse(localStorage.getItem('digilib_institution')) || {};
    setTransactions(institutionData.transactions || []);
  }, []);

  const handleExtendDueDate = (transactionId) => {
    const days = window.prompt('Enter number of days to extend:', '7');
    if (!days || isNaN(days)) return;

    const institutionData = JSON.parse(localStorage.getItem('digilib_institution'));
    const updatedTransactions = (institutionData.transactions || []).map((transaction) => {
      if (transaction.transactionId === transactionId) {
        const currentDueDate = new Date(transaction.dueDate);
        const newDueDate = new Date(currentDueDate.getTime() + parseInt(days, 10) * 24 * 60 * 60 * 1000);
        return { ...transaction, dueDate: newDueDate.toISOString().split('T')[0] };
      }
      return transaction;
    });

    const updatedInstitution = { ...institutionData, transactions: updatedTransactions };
    localStorage.setItem('digilib_institution', JSON.stringify(updatedInstitution));
    setTransactions(updatedTransactions);
    toast.success('Due date extended successfully!');
  };

  const handleCheckIn = (transaction) => {
    const institutionData = JSON.parse(localStorage.getItem('digilib_institution'));

    const historyEntry = {
      ...transaction,
      checkinDate: new Date().toISOString().split('T')[0],
      status: 'returned',
    };

    const updatedBooks = (institutionData.books || []).map((book) => {
      if (book.uniqueBookId === transaction.bookId) {
        return { ...book, copiesAvailable: (book.copiesAvailable || 0) + 1 };
      }
      return book;
    });

    const updatedTransactions = (institutionData.transactions || []).filter(
      (t) => t.transactionId !== transaction.transactionId
    );

    const updatedInstitution = {
      ...institutionData,
      books: updatedBooks,
      transactions: updatedTransactions,
      history: [...(institutionData.history || []), historyEntry],
    };

    localStorage.setItem('digilib_institution', JSON.stringify(updatedInstitution));
    setTransactions(updatedTransactions);
    toast.success('Book checked in successfully!');
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h4" color="primary" fontWeight={700} sx={{ mb: 4 }}>
        Active Transactions
      </Typography>
      <Grid container spacing={3}>
        {transactions.map((transaction) => (
          <Grid item key={transaction.transactionId} xs={12} sm={6} md={4}>
            <Card sx={{ borderRadius: 3, boxShadow: '0 4px 24px rgba(25, 118, 210, 0.10)' }}>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="h6" color="primary" fontWeight={700}>
                    {transaction.bookTitle}
                  </Typography>
                  {isOverdue(transaction.dueDate) && <Chip label="OVERDUE" color="error" size="small" />}
                </Box>
                <Typography variant="body2" color="text.secondary">Student: {transaction.studentName}</Typography>
                <Typography variant="body2" color="text.secondary">Student ID: {transaction.studentId}</Typography>
                <Typography variant="body2" color="text.secondary">Checked Out: {transaction.checkoutDate}</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600, color: isOverdue(transaction.dueDate) ? 'error.main' : 'text.primary', mt: 0.5 }}>
                  Due Date: {transaction.dueDate}
                </Typography>
                <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                  <Button variant="contained" onClick={() => handleExtendDueDate(transaction.transactionId)}>
                    Extend Due Date
                  </Button>
                  <Button variant="outlined" color="success" onClick={() => handleCheckIn(transaction)}>
                    Check In
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
      {transactions.length === 0 && (
        <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 4 }}>
          No active transactions
        </Typography>
      )}
    </Container>
  );
}