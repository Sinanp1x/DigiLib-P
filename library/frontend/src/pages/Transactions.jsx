import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Container, Typography, Button, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Chip } from '@mui/material';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [filter, setFilter] = useState('');

  // Helper to refresh transactions from localStorage
  const refreshTransactionsFromStorage = () => {
    const institutionData = JSON.parse(localStorage.getItem('digilib_institution')) || {};
    setTransactions(institutionData.transactions || []);
  };

  useEffect(() => {
    // Initial load
    refreshTransactionsFromStorage();

    // Listen for custom event so other parts of the app can trigger a refresh
    const handler = () => refreshTransactionsFromStorage();
    window.addEventListener('digilib:transactions-updated', handler);
    return () => window.removeEventListener('digilib:transactions-updated', handler);
  }, []);

  const handleExtendDueDate = async (transactionId) => {
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
    // Update local state optimistically so UI updates immediately
    setTransactions(updatedTransactions);
    // Persist and notify listeners
    localStorage.setItem('digilib_institution', JSON.stringify(updatedInstitution));
    // Try to persist to backend; fall back to localStorage
    try {
      await axios.post('/api/institution', updatedInstitution, { baseURL: '' });
      window.dispatchEvent(new Event('digilib:transactions-updated'));
      toast.success('Due date extended and saved to server');
    } catch (err) {
      console.warn('Failed to save institution to server, saved locally', err);
      window.dispatchEvent(new Event('digilib:transactions-updated'));
      toast('Due date extended locally (server not available)', { icon: '⚠️' });
    }
  };

  const handleCheckIn = async (transaction) => {
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
    try {
      await axios.post('/api/institution', updatedInstitution, { baseURL: '' });
      window.dispatchEvent(new Event('digilib:transactions-updated'));
      toast.success('Book checked in and saved to server');
    } catch (err) {
      console.warn('Failed to save institution to server, saved locally', err);
      window.dispatchEvent(new Event('digilib:transactions-updated'));
      toast('Book checked in locally (server not available)', { icon: '⚠️' });
    }
  };

  const isOverdue = (dueDate) => new Date(dueDate) < new Date();

  const filteredTransactions = transactions.filter(t =>
    t.bookTitle.toLowerCase().includes(filter.toLowerCase()) ||
    t.studentName.toLowerCase().includes(filter.toLowerCase()) ||
    t.studentId.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" color="primary" fontWeight={700}>
          Active Transactions
        </Typography>
        <TextField
          variant="outlined"
          placeholder="Search by book, student name, or ID..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          sx={{ width: 400 }}
        />
      </Box>
      <Paper sx={{ borderRadius: 2 }}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Book Title</TableCell>
                <TableCell>Student Name</TableCell>
                <TableCell>Student ID</TableCell>
                <TableCell>Checkout Date</TableCell>
                <TableCell>Due Date</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredTransactions.map((transaction) => (
                <TableRow key={transaction.transactionId} hover>
                  <TableCell>{transaction.bookTitle}</TableCell>
                  <TableCell>{transaction.studentName}</TableCell>
                  <TableCell>{transaction.studentId}</TableCell>
                  <TableCell>{transaction.checkoutDate}</TableCell>
                  <TableCell>
                    <Chip
                      label={transaction.dueDate}
                      color={isOverdue(transaction.dueDate) ? 'error' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                      <Button size="small" variant="outlined" onClick={() => handleExtendDueDate(transaction.transactionId)}>
                        Extend
                      </Button>
                      <Button size="small" variant="contained" color="success" onClick={() => handleCheckIn(transaction)}>
                        Check In
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
      {filteredTransactions.length === 0 && (
        <Typography variant="body1" color="text.secondary" textAlign="center" sx={{ mt: 6 }}>
          {filter ? 'No transactions found matching your search.' : 'No active transactions.'}
        </Typography>
      )}
    </Container>
  );
}
