import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { Container, Box, Typography, TextField, Paper, List, ListItem, ListItemButton, ListItemText, Button, Dialog, DialogTitle, DialogContent, DialogActions, Card, CardContent, CardMedia, Grid } from '@mui/material';

export default function CheckoutBook() {
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [bookSearch, setBookSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [showBookSuggestions, setShowBookSuggestions] = useState(false);
  const [showStudentSuggestions, setShowStudentSuggestions] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const videoRef = useRef(null);
  const [scanError, setScanError] = useState('');
  const [manualValue, setManualValue] = useState('');

  useEffect(() => {
    const institutionData = JSON.parse(localStorage.getItem('digilib_institution')) || {};
    setBooks(institutionData.books || []);
    setStudents(institutionData.students || []);
  }, []);

  const handleScanned = handleScannedFactory(setBookSearch, books, setSelectedBook, setScanOpen);
  useScanner(scanOpen, handleScanned, videoRef, setScanError);

  // Filter books based on search input
  const filteredBooks = books.filter(book => 
    (book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
     book.genre.toLowerCase().includes(bookSearch.toLowerCase())) &&
    book.copiesAvailable > 0
  );

  // Filter students based on search input
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.uniqueStudentId.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!selectedBook || !selectedStudent) {
      toast.error('Please select both a book and a student');
      return;
    }

    // Get latest data from localStorage
    const institutionData = JSON.parse(localStorage.getItem('digilib_institution'));

    // Create new transaction
    const newTransaction = {
      transactionId: `TXN-${Date.now()}`,
      bookId: selectedBook.uniqueBookId,
      bookTitle: selectedBook.title,
      studentId: selectedStudent.uniqueStudentId,
      studentName: selectedStudent.name,
      checkoutDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "checkedOut"
    };

    // Update the book's available copies
    const updatedBooks = institutionData.books.map(book => {
      if (book.uniqueBookId === selectedBook.uniqueBookId) {
        return { ...book, copiesAvailable: book.copiesAvailable - 1 };
      }
      return book;
    });

    // Update institution data
    const updatedInstitution = {
      ...institutionData,
      books: updatedBooks,
      transactions: [...(institutionData.transactions || []), newTransaction]
    };

    // Save to localStorage
  localStorage.setItem('digilib_institution', JSON.stringify(updatedInstitution));

      // Notify other parts of the app that transactions changed
      window.dispatchEvent(new Event('digilib:transactions-updated'));

    // Reset form and show success message
    setSelectedBook(null);
    setSelectedStudent(null);
    setBookSearch('');
    setStudentSearch('');
    toast.success('Book checked out successfully!');
  };

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Typography variant="h4" color="primary" fontWeight={700} sx={{ mb: 3 }}>
        Check Out Book
      </Typography>

      <Card sx={{ p: 2 }}>
        <Box component="form" onSubmit={handleCheckout} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Find Book</Typography>
              <TextField
                fullWidth
                value={bookSearch}
                onChange={(e) => { setBookSearch(e.target.value); setShowBookSuggestions(true); setSelectedBook(null); }}
                onFocus={() => setShowBookSuggestions(true)}
                onBlur={() => setTimeout(() => setShowBookSuggestions(false), 150)}
                placeholder="Search by title or genre..."
              />
              <Box sx={{ mt: 1 }}>
                <Button variant="outlined" size="small" onClick={() => setScanOpen(true)}>Scan Barcode</Button>
              </Box>
              {bookSearch && showBookSuggestions && (
                <Paper sx={{ position: 'absolute', zIndex: 10, width: '100%', maxHeight: 240, overflow: 'auto' }}>
                  <List>
                    {filteredBooks.map((book) => (
                      <ListItem key={book.uniqueBookId} disablePadding>
                        <ListItemButton onClick={() => { setSelectedBook(book); setBookSearch(book.title); setShowBookSuggestions(false); }}>
                          <ListItemText primary={`${book.title} by ${book.author}`} secondary={`${book.copiesAvailable} available`} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>

            <Grid item xs={12} md={6}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>Find Student</Typography>
              <TextField
                fullWidth
                value={studentSearch}
                onChange={(e) => { setStudentSearch(e.target.value); setShowStudentSuggestions(true); setSelectedStudent(null); }}
                onFocus={() => setShowStudentSuggestions(true)}
                onBlur={() => setTimeout(() => setShowStudentSuggestions(false), 150)}
                placeholder="Search by name or ID..."
              />
              {studentSearch && showStudentSuggestions && (
                <Paper sx={{ position: 'absolute', zIndex: 10, width: '100%', maxHeight: 240, overflow: 'auto' }}>
                  <List>
                    {filteredStudents.map((student) => (
                      <ListItem key={student.uniqueStudentId} disablePadding>
                        <ListItemButton onClick={() => { setSelectedStudent(student); setStudentSearch(student.name); setShowStudentSuggestions(false); }}>
                          <ListItemText primary={student.name} secondary={`ID: ${student.uniqueStudentId}`} />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              )}
            </Grid>
          </Grid>

          {(selectedBook || selectedStudent) && (
            <Card variant="outlined" sx={{ display: 'flex', gap: 2, p: 1, alignItems: 'center' }}>
              {selectedBook && (
                <CardMedia
                  component="img"
                  image={selectedBook.imagePath ? selectedBook.imagePath : ''}
                  alt={selectedBook.title}
                  sx={{ width: 96, height: 120, objectFit: 'cover', bgcolor: '#f5f7fa', borderRadius: 1 }}
                />
              )}
              <CardContent sx={{ flex: 1 }}>
                {selectedBook && <Typography variant="subtitle1">Selected Book: <strong>{selectedBook.title}</strong></Typography>}
                {selectedStudent && <Typography variant="body2">Selected Student: <strong>{selectedStudent.name}</strong></Typography>}
                <Typography variant="caption" color="text.secondary">Checkout Date: {new Date().toISOString().split('T')[0]}</Typography>
              </CardContent>
            </Card>
          )}

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" size="large" disabled={!selectedBook || !selectedStudent}>
              Check Out
            </Button>
          </Box>
        </Box>
      </Card>

      {/* Scanner Dialog */}
      <Dialog open={scanOpen} onClose={() => setScanOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Scan Book Barcode</DialogTitle>
        <DialogContent>
          {scanError && <Typography color="error" variant="body2" sx={{ mb: 1 }}>{scanError}</Typography>}
          <video ref={videoRef} style={{ width: '100%', borderRadius: 8, border: '1px solid #eee' }} />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
            <TextField size="small" fullWidth placeholder="Manual entry" value={manualValue} onChange={(e) => setManualValue(e.target.value)} />
            <Button onClick={() => handleScanned(manualValue)} variant="contained">Use</Button>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setScanOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}

// Scanner side-effects
function useScanner(open, onDetected, videoRef, setError) {
  useEffect(() => {
    if (!open) return;
    let stream;
    let codeReader;
    const start = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', true);
          await videoRef.current.play();
        }
        try {
          const ZXing = await import('@zxing/library');
          codeReader = new ZXing.BrowserMultiFormatReader();
          codeReader.decodeFromVideoDevice(null, videoRef.current, (result, err) => {
            if (result) {
              onDetected(result.getText());
              codeReader.reset();
            }
          });
        } catch (e) {
          // optional dependency not installed; manual entry available
        }
      } catch (err) {
        setError('Unable to access camera. Please allow camera access or use manual entry.');
      }
    };
    start();
    return () => {
      if (stream) stream.getTracks().forEach(t => t.stop());
      if (codeReader) codeReader.reset();
    };
  }, [open]);
}

function handleScannedFactory(setBookSearch, books, setSelectedBook, setScanOpen) {
  return (text) => {
    if (!text) return;
    const match = books.find(b => b.uniqueBookId === text || b.id === text);
    if (match) {
      setSelectedBook(match);
      setBookSearch(match.title);
      setScanOpen(false);
    }
  };
}