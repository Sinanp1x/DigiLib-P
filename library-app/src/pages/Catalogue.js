import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import BookCard from '../components/BookCard';
import SearchBar from '../components/SearchBar';
import SplashScreen from '../components/SplashScreen';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper to get the auth token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

function Catalogue() {
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [showTopBtn, setShowTopBtn] = useState(false);

  // Fetch books from the new Python backend
  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('http://127.0.0.1:5000/api/books');
      if (!response.ok) {
        throw new Error('Failed to fetch books from the server.');
      }
      const data = await response.json();
      setBooks(data);
    } catch (error) {
      console.error('Error fetching books:', error);
      toast.error('Failed to load catalogue');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  // Remove book
  const handleRemoveBook = async (bookId) => {
    if (window.confirm('Are you sure you want to remove this book?')) {
      try {
        const token = getAuthToken();
        if (!token) {
          toast.error('You are not authenticated.');
          return;
        }

        const response = await fetch(`http://127.0.0.1:5000/api/books/${bookId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.message || 'Failed to delete book');
        }

        setBooks(books.filter(book => book.id !== bookId));
        toast.success('Book removed successfully');
      } catch (error) {
        console.error('Error removing book:', error);
        toast.error(error.message || 'Failed to remove book');
      }
    }
  };

  // Filter and sort books
  const filteredBooks = useMemo(() =>
    books.filter((book) => {
      const query = searchQuery.toLowerCase();
      return (
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query) ||
        (book.genre && book.genre.toLowerCase().includes(query)) ||
        (book.language && book.language.toLowerCase().includes(query))
      );
    }), [books, searchQuery]);

  const sortedBooks = useMemo(() => {
    const languageOrder = [
      'malayalam',
      'english',
      'arabic',
      'kannada',
      'urdu',
      'hindi'
    ];

    const languagePriority = (lang) => {
      if (!lang) return languageOrder.length;
      const normalized = lang.trim().toLowerCase();
      const index = languageOrder.indexOf(normalized);
      return index !== -1 ? index : languageOrder.length + normalized.charCodeAt(0);
    };

    return [...filteredBooks].sort((a, b) => {
      const genreA = a.genre?.toLowerCase() || '';
      const genreB = b.genre?.toLowerCase() || '';
      if (genreA < genreB) return -1;
      if (genreA > genreB) return 1;

      const langA = languagePriority(a.language);
      const langB = languagePriority(b.language);
      if (langA !== langB) return langA - langB;

      return a.title.localeCompare(b.title);
    });
  }, [filteredBooks]);

  const booksWithSerial = useMemo(() =>
    sortedBooks.map((book, idx) => ({
      ...book,
      serial: idx + 1,
    })), [sortedBooks]);

  // Scroll to top button
  useEffect(() => {
    const handleScroll = () => setShowTopBtn(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (loading) return <SplashScreen message="Loading Catalogue..." page='catalogue'/>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 p-4 sm:p-6"
    >
      <div className="max-w-7xl mx-auto pb-12">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Catalogue</h2>
        {/* NOTE: The UploadForm component will be added back in a future step */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
          {booksWithSerial.length === 0 && (
            <p className="text-gray-600 col-span-full text-center">No books found.</p>
          )}
          {booksWithSerial.map((book) => ( 
            <BookCard
              key={book.id}
              book={book}
              onRemove={handleRemoveBook}
            />
          ))}
        </div>
      </div>
      {showTopBtn && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 bg-blue-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          ⬆ Back to Top
        </motion.button>
      )}
    </motion.div>
  );
}

export default Catalogue;