
import React, { useEffect, useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { collection, getDocs, getDoc, query, where, doc, updateDoc, arrayUnion, addDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import SplashScreen from '../components/SplashScreen'; // Use SplashScreen instead of Loader
import 'react-toastify/dist/ReactToastify.css';

function BookOrder() {
  const { db, user } = useAuth();
  const [books, setBooks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentReads, setCurrentReads] = useState([]);
  const [copyCounts, setCopyCounts] = useState({});
  const [availableCopyIds, setAvailableCopyIds] = useState({});
  const [loading, setLoading] = useState(true);
  const [showTopBtn, setShowTopBtn] = useState(false);

  useEffect(() => {
    const fetchBooksAndCurrentReads = async () => {
      try {
        setLoading(true); // Ensure loading is true at the start
        const bookSnap = await getDocs(collection(db, 'books'));
        const bookList = bookSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

        // Fetch copy counts and available copy IDs
        const counts = {};
        const availIds = {};
        await Promise.all(bookList.map(async (book) => {
          const copiesSnap = await getDocs(collection(db, 'books', book.id, 'copies'));
          counts[book.id] = {
            total: copiesSnap.size,
            available: copiesSnap.docs.filter(doc => doc.data().status === 'available').length,
          };
          const availableCopy = copiesSnap.docs.find(doc => doc.data().status === 'available');
          availIds[book.id] = availableCopy ? availableCopy.id : null;
        }));
        setCopyCounts(counts);
        setAvailableCopyIds(availIds);
        setBooks(bookList);

        const userReadsSnap = await getDocs(
          query(
            collection(db, 'userReads'),
            where('userId', '==', user.uid),
            where('status', '==', 'current')
          )
        );

        const current = await Promise.all(userReadsSnap.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const bookRef = await getDoc(doc(db, 'books', data.bookId));
          return {
            id: docSnap.id,
            bookId: data.bookId,
            book: bookRef.exists() ? { id: bookRef.id, ...bookRef.data() } : null,
            dueDate: data.dueDate?.toDate()
          };
        }));

        setCurrentReads(current);
      } catch (error) {
        console.error("Failed to fetch book order data:", error);
        toast.error("Could not load data for the book order page.");
      } finally {
        setLoading(false);
      }
    };

    fetchBooksAndCurrentReads();
  }, [db, user.uid]);

  useEffect(() => {
    const handleScroll = () => {
      setShowTopBtn(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const filteredAndSortedBooks = useMemo(() => books
    .filter(
      (book) =>
        book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
        book.genre.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aIsAvailable = (copyCounts[a.id]?.available || 0) > 0;
      const bIsAvailable = (copyCounts[b.id]?.available || 0) > 0;
      if (aIsAvailable !== bIsAvailable) {
        return aIsAvailable ? -1 : 1;
      }
      return a.title.localeCompare(b.title);
    }), [books, searchQuery, copyCounts]);

  const handleBookAction = async (bookId) => {
    const copyId = availableCopyIds[bookId];
    if (copyId) {
      // Reserve this copy
      await addDoc(collection(db, 'requests'), {
        userId: user.uid,
        bookId,
        copyId,
        type: 'checkin',
        status: 'pending',
        timestamp: new Date()
      });
      toast.success('Check-in request submitted to librarian.');
    } else {
      // All copies borrowed, join waiting list
      await updateDoc(doc(db, 'books', bookId), {
        waitingList: arrayUnion(user.uid),
      });
      toast.info('You were added to the waiting list.');
    }

    const snapshot = await getDocs(collection(db, 'books'));
    setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  if (loading) return <SplashScreen message="Loading Books..." page='catalogue' />; // Use SplashScreen instead of Loader

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6"
    >
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-6 text-gray-800">📚 Book Order</h2>

        <div className="mb-6">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
            placeholder="🔍 Search by title, author, or genre..."
          />
        </div>

        {currentReads.length > 0 && (
          <div className="bg-white p-4 rounded-xl shadow mb-6">
            <h3 className="text-xl font-bold text-blue-700 mb-3">📖 Currently Reading</h3>
            {currentReads.map((entry) => (
              <div key={entry.id} className="flex justify-between items-center flex-wrap gap-4">
                <div>
                  <p className="font-semibold text-gray-800">{entry.book?.title || 'Unknown Book'}</p>
                  <p className="text-sm text-gray-600">
                    Due Date: {entry.dueDate?.toLocaleDateString() || 'Not available'}
                  </p>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      const bookId = entry.book?.id || entry.bookId;
                      if (!bookId) return toast.error('Book ID not found for this entry.');

                      try {
                        await addDoc(collection(db, 'requests'), {
                          userId: user.uid,
                          bookId,
                          type: 'checkout',
                          status: 'pending',
                          timestamp: new Date()
                        });
                        toast.success('Checkout request sent.');
                      } catch (error) {
                        console.error(error);
                        toast.error('Failed to send checkout request.');
                      }
                    }}
                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  >
                    Request Check Out
                  </motion.button>

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={async () => {
                      const bookId = entry.book?.id || entry.bookId;
                      if (!bookId) return toast.error('Book ID is missing.');

                      try {
                        await addDoc(collection(db, 'requests'), {
                          userId: user.uid,
                          bookId,
                          type: 'extend',
                          status: 'pending',
                          timestamp: new Date()
                        });
                        toast.success('Extension request sent.');
                      } catch (error) {
                        console.error(error);
                        toast.error('Failed to send extension request.');
                      }
                    }}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Request Extension
                  </motion.button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Book Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredAndSortedBooks.map((book) => (
            <motion.div
              key={book.id}
              className="bg-white flex flex-col sm:flex-row items-start gap-4 p-4 rounded-xl shadow hover:shadow-shadow-lg transition-shadow"
            >
              <img
                src={book.coverUrl || 'https://via.placeholder.com/120x160?text=No+Cover'}
                alt={book.title}
                className="w-28 h-40 object-cover rounded-lg border border-gray-200"
              />

              <div className="flex flex-col justify-between w-full">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">{book.title}</h3>
                  <p className="text-sm text-gray-600">✍️ Author: {book.author}</p>
                  <p className="text-sm text-gray-600">🏷️ Genre: {book.genre}</p>
                  <p className="text-sm text-gray-600">🈸 Language: {book.language}</p>
                  <p className={`text-sm mt-1 font-semibold ${copyCounts[book.id]?.available ? 'text-green-600' : 'text-red-500'}`}>
                    {copyCounts[book.id]?.available ? '✔️ Available' : '❌ Booked'}
                  </p>
                  <p className="text-xs text-gray-700 mt-1">
                    Copies: {copyCounts[book.id]?.available || 0} / {copyCounts[book.id]?.total || 0}
                  </p>
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleBookAction(book.id)}
                  className={`mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition ${
                    copyCounts[book.id]?.available ? '' : 'bg-opacity-80'
                  }`}
                >
                  {copyCounts[book.id]?.available ? '📘 Book Now' : '🕒 Join Waiting List'}
                </motion.button>
              </div>
            </motion.div>
          ))}
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
      </div>
    </motion.div>
  );
}

export default BookOrder;