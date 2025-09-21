import { useState, useEffect } from 'react';
import { useStudentAuth } from '../StudentAuthContext';
import { toast } from 'react-hot-toast';
import { Container, Typography, TextField, Grid, Card, CardContent, CardActions, Button, Chip, Box } from '@mui/material';

export default function StudentCatalogue() {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('');
  const { student } = useStudentAuth();

  useEffect(() => {
    const institution = JSON.parse(localStorage.getItem('digilib_institution'));
    setBooks(institution?.books || []);
  }, []);

  const handleRequestBook = (book) => {
    if (book.copiesAvailable === 0) {
      toast.error('No copies available for this book');
      return;
    }

  const institution = JSON.parse(localStorage.getItem('digilib_institution'));
    const existingRequest = institution.bookingRequests?.find(
      req => req.bookId === book.uniqueBookId && req.studentId === student.uniqueStudentId
    );

    if (existingRequest) {
      toast.error('You already have a pending request for this book');
      return;
    }

    const newRequest = {
      requestId: `REQ-${Date.now()}`,
      studentId: student.uniqueStudentId,
      studentName: student.name,
      bookId: book.uniqueBookId,
      bookTitle: book.title,
      requestDate: new Date().toISOString(),
      status: 'pending'
    };

    const updatedInstitution = {
      ...institution,
      bookingRequests: [...(institution.bookingRequests || []), newRequest]
    };

    localStorage.setItem('digilib_institution', JSON.stringify(updatedInstitution));
    toast.success('Book request submitted successfully');
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(filter.toLowerCase()) ||
    book.author.toLowerCase().includes(filter.toLowerCase()) ||
    book.genre.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} gap={2}>
        <Typography variant="h5" fontWeight={700} color="primary">
          Browse Books
        </Typography>
        <TextField
          placeholder="Search by title, author, or genre..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          size="small"
          sx={{ minWidth: 280 }}
        />
      </Box>

      <Grid container spacing={2}>
        {filteredBooks.map((book) => (
          <Grid item xs={12} sm={6} md={4} key={book.uniqueBookId}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600}>{book.title}</Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  by {book.author}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
                  Genre: {book.genre}
                </Typography>
                <Chip
                  label={`${book.copiesAvailable} of ${book.totalCopies} available`}
                  color={book.copiesAvailable > 0 ? 'success' : 'error'}
                  size="small"
                  variant="outlined"
                />
              </CardContent>
              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button
                  onClick={() => handleRequestBook(book)}
                  disabled={book.copiesAvailable === 0}
                  variant="contained"
                >
                  Request Book
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {filteredBooks.length === 0 && (
        <Typography align="center" color="text.secondary" mt={4}>
          No books found matching your search.
        </Typography>
      )}
    </Container>
  );
}