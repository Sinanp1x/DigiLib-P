import { useState, useEffect } from 'react';
import { useStudentAuth } from '../StudentAuthContext';
import { toast } from 'react-hot-toast';
import { Container, Typography, Paper, Box, TextField, Button, MenuItem, List, ListItem, ListItemButton, ListItemText, Chip, Stack, Rating } from '@mui/material';

export default function Community() {
  const [posts, setPosts] = useState([]);
  const [books, setBooks] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [bookSearch, setBookSearch] = useState('');
  const [reviewForm, setReviewForm] = useState({
    reviewText: '',
    rating: 5
  });
  const { student } = useStudentAuth();

  useEffect(() => {
  const institution = JSON.parse(localStorage.getItem('digilib_institution')) || {};
    setPosts(institution.communityPosts || []);
    setBooks(institution.books || []);
  }, []);

  const handleBookSelect = (book) => {
    setSelectedBook(book);
    setBookSearch(book.title);
  };

  const handleReviewSubmit = (e) => {
    e.preventDefault();
    if (!selectedBook) {
      toast.error('Please select a book to review');
      return;
    }

  const institution = JSON.parse(localStorage.getItem('digilib_institution'));
    
    // Check if student has borrowed this book
    const hasHistory = (institution.history || []).some(
      h => h.studentId === student.uniqueStudentId && h.bookId === selectedBook.uniqueBookId
    );

    if (!hasHistory) {
      toast.error('You can only review books you have borrowed');
      return;
    }

    const newPost = {
      postId: `POST-${Date.now()}`,
      studentId: student.uniqueStudentId,
      studentName: student.name,
      bookId: selectedBook.uniqueBookId,
      bookTitle: selectedBook.title,
      reviewText: reviewForm.reviewText,
      rating: parseInt(reviewForm.rating),
      likes: [],
      date: new Date().toISOString()
    };

    const updatedInstitution = {
      ...institution,
      communityPosts: [...(institution.communityPosts || []), newPost]
    };

  localStorage.setItem('digilib_institution', JSON.stringify(updatedInstitution));
    setPosts([...posts, newPost]);
    setReviewForm({ reviewText: '', rating: 5 });
    setSelectedBook(null);
    setBookSearch('');
    toast.success('Review posted successfully!');
  };

  const handleLike = (postId) => {
  const institution = JSON.parse(localStorage.getItem('digilib_institution'));
    const updatedPosts = institution.communityPosts.map(post => {
      if (post.postId === postId) {
        const likes = new Set(post.likes);
        if (likes.has(student.uniqueStudentId)) {
          likes.delete(student.uniqueStudentId);
        } else {
          likes.add(student.uniqueStudentId);
        }
        return { ...post, likes: Array.from(likes) };
      }
      return post;
    });

    institution.communityPosts = updatedPosts;
    localStorage.setItem('institution', JSON.stringify(institution));
    setPosts(updatedPosts);
  };

  const filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
    book.author.toLowerCase().includes(bookSearch.toLowerCase())
  );

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Typography variant="h5" fontWeight={800} color="primary" gutterBottom>
        Community Reviews
      </Typography>

      {/* Write Review */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="subtitle1" fontWeight={700} gutterBottom>
          Write a Review
        </Typography>
        <Box component="form" onSubmit={handleReviewSubmit}>
          <Stack spacing={2}>
            <Box>
              <Typography variant="caption" color="text.secondary">Select Book</Typography>
              <Box sx={{ position: 'relative', mt: 0.5 }}>
                <TextField
                  fullWidth
                  size="small"
                  value={bookSearch}
                  onChange={(e) => setBookSearch(e.target.value)}
                  placeholder="Search for a book..."
                />
                {bookSearch && (
                  <Paper sx={{ position: 'absolute', width: '100%', maxHeight: 240, overflow: 'auto', zIndex: 2 }}>
                    <List dense>
                      {filteredBooks.map(book => (
                        <ListItem key={book.uniqueBookId} disablePadding>
                          <ListItemButton onClick={() => handleBookSelect(book)}>
                            <ListItemText primary={`${book.title}`} secondary={`by ${book.author}`} />
                          </ListItemButton>
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                )}
              </Box>
            </Box>
            <Box>
              <Typography variant="caption" color="text.secondary">Rating</Typography>
              <Rating
                name="review-rating"
                value={Number(reviewForm.rating)}
                onChange={(_, val) => setReviewForm({ ...reviewForm, rating: val || 5 })}
              />
            </Box>
            <TextField
              multiline minRows={4}
              placeholder="Write your review here..."
              value={reviewForm.reviewText}
              onChange={(e) => setReviewForm({ ...reviewForm, reviewText: e.target.value })}
            />
            <Button type="submit" variant="contained">Post Review</Button>
          </Stack>
        </Box>
      </Paper>

      {/* Feed */}
      <Stack spacing={2}>
        {posts.map(post => (
          <Paper key={post.postId} sx={{ p: 2 }}>
            <Box display="flex" alignItems="flex-start" justifyContent="space-between">
              <Box>
                <Typography fontWeight={700}>{post.bookTitle}</Typography>
                <Typography variant="caption" color="text.secondary">
                  Reviewed by {post.studentName} • {new Date(post.date).toLocaleDateString()}
                </Typography>
              </Box>
              <Rating value={Number(post.rating)} readOnly size="small" />
            </Box>
            <Typography variant="body2" sx={{ mt: 1, mb: 1.5 }}>{post.reviewText}</Typography>
            <Button size="small" variant={post.likes.includes(student.uniqueStudentId) ? 'contained' : 'outlined'} onClick={() => handleLike(post.postId)}>
              👍 {post.likes.length} {post.likes.length === 1 ? 'like' : 'likes'}
            </Button>
          </Paper>
        ))}
        {posts.length === 0 && (
          <Typography align="center" color="text.secondary">No reviews yet. Be the first to write one!</Typography>
        )}
      </Stack>
    </Container>
  );
}