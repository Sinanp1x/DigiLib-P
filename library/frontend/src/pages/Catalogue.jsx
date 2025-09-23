import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { useDropzone } from 'react-dropzone';
import { Container, Box, Typography, TextField, Button, Grid, Card, CardContent, CardMedia, FormControlLabel, Checkbox, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DownloadIcon from '@mui/icons-material/Download';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Add from '@mui/icons-material/Add';
import Remove from '@mui/icons-material/Remove';

function generateBookId(genre, author) {
  const g = genre.slice(0, 3).toUpperCase();
  const a = author.slice(0, 3).toUpperCase();
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `BK-${g}-${a}-${rand}`;
}

export default function Catalogue() {
  const { admin } = useAuth();
  const [form, setForm] = useState({
    title: '',
    genre: '',
    author: '',
    copies: 1,
    series: '',
    volume: '',
    image: null,
  });
  const [genres, setGenres] = useState(() => {
    return JSON.parse(localStorage.getItem('digilib_genres')) || [];
  });
  const [books, setBooks] = useState(() => {
    const institution = JSON.parse(localStorage.getItem('digilib_institution'));
    return institution?.books || [];
  });
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [showAddBooks, setShowAddBooks] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ id: '', title: '', genre: '', author: '', copies: 1 });

  useEffect(() => {
    localStorage.setItem('digilib_genres', JSON.stringify(genres));
  }, [genres]);

  const onDrop = (acceptedFiles) => {
    setForm({ ...form, image: acceptedFiles[0] });
  };
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': [] } });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenreChange = (e) => {
    const value = e.target.value;
    setForm({ ...form, genre: value });
    if (value && !genres.includes(value)) {
      setGenres([...genres, value]);
    }
  };

  const openEdit = (book) => {
    setEditForm({ id: book.id, title: book.title, genre: book.genre, author: book.author, copies: Number(book.totalCopies || book.copies || 1) });
    setEditOpen(true);
  };

  const saveEdit = () => {
    const idx = books.findIndex(b => b.id === editForm.id);
    if (idx === -1) { setEditOpen(false); return; }
    const old = books[idx];
    const delta = Number(editForm.copies) - Number(old.totalCopies ?? old.copies ?? 0);
    const updated = {
      ...old,
      title: editForm.title,
      genre: editForm.genre,
      author: editForm.author,
      totalCopies: Number(editForm.copies),
      copies: Number(editForm.copies),
      copiesAvailable: Math.max(0, Number(old.copiesAvailable ?? old.copies ?? 0) + delta),
    };
    const updatedBooks = [...books];
    updatedBooks[idx] = updated;
    setBooks(updatedBooks);
    const institution = JSON.parse(localStorage.getItem('digilib_institution')) || {};
    institution.books = updatedBooks;
    localStorage.setItem('digilib_institution', JSON.stringify(institution));
    setEditOpen(false);
  };

  const deleteBook = (bookId) => {
    if (!window.confirm('Delete this book? This will not remove existing transactions/history.')) return;
    const updatedBooks = books.filter(b => b.id !== bookId);
    setBooks(updatedBooks);
    const institution = JSON.parse(localStorage.getItem('digilib_institution')) || {};
    institution.books = updatedBooks;
    localStorage.setItem('digilib_institution', JSON.stringify(institution));
  };

  const generateBarcode = async (bookId) => {
    try {
      const res = await axios.post('/api/generate-barcode',
        { bookId },
        { baseURL: 'http://localhost:5000' }
      );
      return res.data.barcodePath;
    } catch (err) {
      console.error('Failed to generate barcode:', err);
      setError('Failed to generate barcode. Please check the backend server.');
      return null;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.genre || !form.author || !form.copies || !form.image) {
      setError('All required fields must be filled and image selected.');
      return;
    }
    setError('');
    setUploading(true);
    const bookId = generateBookId(form.genre, form.author);

    // Generate barcode
    const barcodePath = await generateBarcode(bookId);
    if (!barcodePath) {
      setUploading(false);
      return;
    }

    // Upload image to backend
    const data = new FormData();
    data.append('file', form.image);
    data.append('bookId', bookId);
    let imagePath = '';
    try {
      const res = await axios.post('/api/upload', data, { baseURL: 'http://localhost:5000' });
      imagePath = res.data.imagePath;
    } catch (err) {
      setError('Image upload failed.');
      setUploading(false);
      return;
    }

    // Create book object
    const newBook = {
      id: bookId,
      uniqueBookId: bookId,
      title: form.title,
      genre: form.genre,
      author: form.author,
      // Track both total and available for compatibility
      totalCopies: Number(form.copies),
      copies: Number(form.copies),
      copiesAvailable: Number(form.copies),
      series: form.series,
      volume: form.volume,
      imagePath,
      barcodePath,
    };
    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    const existing = JSON.parse(localStorage.getItem('digilib_institution')) || { books: [] };
    existing.books = updatedBooks;
    localStorage.setItem('digilib_institution', JSON.stringify(existing));
    setForm({ title: '', genre: '', author: '', copies: 1, series: '', volume: '', image: null });
    setUploading(false);
  };

  const handleDownloadPDF = () => {
    const sortedBooks = [...books].sort((a, b) => {
      if (a.genre !== b.genre) return a.genre.localeCompare(b.genre);
      return a.author.localeCompare(b.author);
    });
    const doc = new jsPDF();
    doc.text('Library Catalogue', 14, 16);
    autoTable(doc, {
      head: [['ID', 'Title', 'Author', 'Genre', 'Copies', 'Barcode']],
      body: sortedBooks.map(b => [b.id, b.title, b.author, b.genre, b.copies, b.barcodePath ? `http://localhost:5000${b.barcodePath}` : '']),
      startY: 24,
    });
    doc.save('catalogue.pdf');
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Box sx={{
        p: 5,
        bgcolor: 'background.paper',
        borderRadius: 4,
        boxShadow: '0 8px 32px rgba(25, 118, 210, 0.12)',
        border: '1px solid #e3e8ee',
        minHeight: '80vh',
        position: 'relative',
      }}>
        <Typography variant="h3" component="h1" color="primary" gutterBottom sx={{ fontWeight: 700, textAlign: 'center', mb: 2, letterSpacing: '0.03em' }}>
          Manage Catalogue
        </Typography>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
          <Button
            variant={showAddBooks ? "outlined" : "contained"}
            onClick={() => setShowAddBooks(!showAddBooks)}
            startIcon={showAddBooks ? <Remove /> : <Add />}
          >
            {showAddBooks ? 'Hide Form' : 'Add New Book'}
          </Button>
    </Box>
  {showAddBooks ? (
  <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2, mb: 6 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Book Title*" name="title" value={form.title} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Genre*"
                name="genre"
                value={form.genre}
                onChange={handleGenreChange}
                required
                InputProps={{
                  list: 'genre-list',
                }}
              />
              <datalist id="genre-list">
                {genres.map((g) => (
                  <option key={g} value={g} />
                ))}
              </datalist>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Author*" name="author" value={form.author} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Number of Copies*" name="copies" type="number" inputProps={{ min: 1 }} value={form.copies} onChange={handleChange} required />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Series Name (optional)" name="series" value={form.series} onChange={handleChange} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Volume Number (optional)" name="volume" type="number" inputProps={{ min: 1 }} value={form.volume} onChange={handleChange} />
            </Grid>
            <Grid item xs={12}>
              <Box
                {...getRootProps()}
                sx={{
                  border: '2.5px dashed',
                  borderColor: isDragActive ? 'primary.main' : 'grey.400',
                  borderRadius: 2,
                  p: 5,
                  textAlign: 'center',
                  cursor: 'pointer',
                  bgcolor: isDragActive ? 'primary.light' : '#f4f6f8',
                  transition: 'all 0.3s',
                  boxShadow: isDragActive ? '0 4px 24px rgba(25, 118, 210, 0.18)' : 'none',
                }}
              >
                <input {...getInputProps()} />
                <CloudUploadIcon color="action" sx={{ fontSize: 40 }} />
                {form.image ? (
                  <Typography variant="subtitle1" color="primary" sx={{ mt: 1 }}>{form.image.name}</Typography>
                ) : (
                  <Typography variant="subtitle1" color="text.secondary" sx={{ mt: 1 }}>Drag & drop book cover image here, or click to select</Typography>
                )}
              </Box>
            </Grid>
          </Grid>
          {error && (
            <Typography color="error" variant="body2" sx={{ mt: 2 }}>
              {error}
            </Typography>
          )}
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            disabled={uploading}
            startIcon={uploading ? null : <CloudUploadIcon />}
            sx={{ mt: 4, py: 1.5, fontSize: '1.1rem', fontWeight: 600, borderRadius: 2, boxShadow: '0 2px 8px rgba(25, 118, 210, 0.08)', transition: 'background 0.2s' }}
          >
            {uploading ? 'Uploading...' : 'Add Book'}
          </Button>
    </Box>
  ) : null}

  <Box sx={{ mb: 6, textAlign: 'right' }}>
          <Button
            variant="contained"
            color="secondary"
            onClick={handleDownloadPDF}
            startIcon={<DownloadIcon />}
          >
            Download Catalogue PDF
          </Button>
        </Box>

        <Typography variant="h4" component="h2" color="primary" sx={{ mb: 4, fontWeight: 600, textAlign: 'center', letterSpacing: '0.02em' }}>
          Current Books
        </Typography>
        <Grid container spacing={4}>
          {books.map((book) => (
            <Grid item key={book.id} xs={12} sm={6} md={4} lg={3}>
              <Card sx={{ display: 'flex', flexDirection: 'row', borderRadius: 3, boxShadow: '0 4px 24px rgba(25,118,210,0.10)', overflow: 'hidden' }}>
                {book.imagePath && (
                  <CardMedia
                    component="img"
                    image={`http://localhost:5000${book.imagePath}`}
                    alt={book.title}
                    sx={{ width: 180, objectFit: 'cover', bgcolor: '#f4f6f8' }}
                  />
                )}
                <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
                  <CardContent sx={{ flex: '1 0 auto' }}>
                    <Typography variant="h6" color="primary" sx={{ fontWeight: 700 }}>
                      {book.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary"><strong>Author:</strong> {book.author}</Typography>
                    <Typography variant="body2" color="text.secondary"><strong>Genre:</strong> {book.genre}</Typography>
                    <Typography variant="body2" color="text.secondary"><strong>Copies:</strong> {book.copies}</Typography>
                    <Typography variant="caption" color="text.disabled"><strong>ID:</strong> {book.id}</Typography>
                  </CardContent>
                  <Box sx={{ display: 'flex', gap: 1, p: 2, pt: 0, alignItems: 'center' }}>
                    {book.barcodePath && (
                      <Button
                        variant="outlined"
                        color="primary"
                        href={`http://localhost:5000${book.barcodePath}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        startIcon={<VisibilityIcon />}
                        sx={{ borderRadius: 2, fontWeight: 600 }}
                      >
                        View Barcode
                      </Button>
                    )}
                    <Button variant="contained" onClick={() => openEdit(book)}>Edit</Button>
                    <Button variant="outlined" color="error" onClick={() => deleteBook(book.id)}>Delete</Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit Book</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
              <TextField label="Title" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} fullWidth />
              <TextField label="Author" value={editForm.author} onChange={(e) => setEditForm({ ...editForm, author: e.target.value })} fullWidth />
              <TextField label="Genre" value={editForm.genre} onChange={(e) => setEditForm({ ...editForm, genre: e.target.value })} fullWidth />
              <TextField label="Total Copies" type="number" inputProps={{ min: 0 }} value={editForm.copies} onChange={(e) => setEditForm({ ...editForm, copies: e.target.value })} fullWidth />
              <TextField label="ID" value={editForm.id} InputProps={{ readOnly: true }} fullWidth />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button variant="contained" onClick={saveEdit}>Save</Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Container>
  );
}
