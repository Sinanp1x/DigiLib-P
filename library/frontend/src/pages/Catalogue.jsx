import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';
import axios from 'axios';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { useDropzone } from 'react-dropzone';

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.genre || !form.author || !form.copies || !form.image) {
      setError('All required fields must be filled and image selected.');
      return;
    }
    setError('');
    setUploading(true);
    const bookId = generateBookId(form.genre, form.author);
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
      title: form.title,
      genre: form.genre,
      author: form.author,
      copies: form.copies,
      series: form.series,
      volume: form.volume,
      imagePath,
    };
    const updatedBooks = [...books, newBook];
    setBooks(updatedBooks);
    const institution = JSON.parse(localStorage.getItem('digilib_institution'));
    institution.books = updatedBooks;
    localStorage.setItem('digilib_institution', JSON.stringify(institution));
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
    doc.autoTable({
      head: [['ID', 'Title', 'Author', 'Genre', 'Copies']],
      body: sortedBooks.map(b => [b.id, b.title, b.author, b.genre, b.copies]),
      startY: 24,
    });
    doc.save('catalogue.pdf');
  };

  return (
    <div className="min-h-screen bg-bg-light py-12">
      <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-2xl border border-border-light">
        <h2 className="text-2xl font-bold mb-6 text-primary-blue">Manage Catalogue</h2>
        <form onSubmit={handleSubmit} className="space-y-4 mb-8">
          <input type="text" name="title" placeholder="Book Title*" value={form.title} onChange={handleChange} className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue transition text-text-dark bg-bg-light" />
          <input type="text" name="genre" list="genre-list" placeholder="Genre*" value={form.genre} onChange={handleGenreChange} className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue transition text-text-dark bg-bg-light" />
          <datalist id="genre-list">
            {genres.map((g) => <option key={g} value={g} />)}
          </datalist>
          <input type="text" name="author" placeholder="Author*" value={form.author} onChange={handleChange} className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue transition text-text-dark bg-bg-light" />
          <input type="number" name="copies" min="1" placeholder="Number of Copies*" value={form.copies} onChange={handleChange} className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue transition text-text-dark bg-bg-light" />
          <input type="text" name="series" placeholder="Series Name (optional)" value={form.series} onChange={handleChange} className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue transition text-text-dark bg-bg-light" />
          <input type="number" name="volume" min="1" placeholder="Volume Number (optional)" value={form.volume} onChange={handleChange} className="w-full px-4 py-2 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-blue transition text-text-dark bg-bg-light" />
          <div {...getRootProps()} className={`w-full px-4 py-6 border-2 border-dashed rounded-lg text-center cursor-pointer ${isDragActive ? 'border-primary-blue bg-bg-light' : 'border-border-light bg-bg-light'}`}>
            <input {...getInputProps()} />
            {form.image ? (
              <span className="text-primary-blue font-semibold">{form.image.name}</span>
            ) : (
              <span className="text-gray-600">Drag & drop book cover image here, or click to select</span>
            )}
          </div>
          {error && <div className="text-red-600 text-sm font-semibold">{error}</div>}
          <button type="submit" disabled={uploading} className="w-full bg-primary-blue text-white py-2 rounded-lg font-bold hover:bg-secondary-blue transition-colors disabled:bg-primary-blue/70 shadow">{uploading ? 'Uploading...' : 'Add Book'}</button>
        </form>
        <div className="mb-8 text-right">
          <button onClick={handleDownloadPDF} className="bg-primary-blue text-white px-6 py-2 rounded-lg font-bold hover:bg-secondary-blue transition-colors shadow">Download Catalogue PDF</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {books.map((book) => (
            <div key={book.id} className="bg-bg-light rounded-xl shadow p-6 flex flex-col items-center border border-border-light">
              {book.imagePath && (
                <img src={`http://localhost:5000${book.imagePath}`} alt={book.title} className="w-24 h-32 object-cover rounded mb-4 border border-border-light" />
              )}
              <div className="font-bold text-lg text-primary-blue mb-2">{book.title}</div>
              <div className="text-sm text-text-dark">Author: {book.author}</div>
              <div className="text-sm text-text-dark">Genre: {book.genre}</div>
              <div className="text-sm text-text-dark">Copies: {book.copies}</div>
              <div className="text-xs text-gray-500 mt-2">ID: {book.id}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
