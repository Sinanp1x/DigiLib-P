import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import SplashScreen from '../components/SplashScreen'; // Import SplashScreen
import 'react-toastify/dist/ReactToastify.css';

function Reviews() {
  const { db, user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [books, setBooks] = useState([]);
  const [reviewText, setReviewText] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    const snapshot = await getDocs(collection(db, 'reviews'));
    const reviewsData = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        const bookDoc = await getDoc(doc(db, 'books', data.bookId));
        const userDoc = await getDoc(doc(db, 'users', data.userId));
        return {
          id: docSnap.id,
          ...data,
          bookTitle: bookDoc.exists() ? bookDoc.data().title : 'Unknown',
          reviewerName: userDoc.exists() ? userDoc.data().name : 'Anonymous',
        };
      })
    );
    setReviews(reviewsData);
  };

  const fetchBooks = async () => {
    const snapshot = await getDocs(collection(db, 'books'));
    setBooks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true); // Ensure loading is true at the start
        await Promise.all([fetchBooks(), fetchReviews()]);
      } catch (error) {
        console.error("Failed to fetch reviews and books:", error);
        toast.error("Could not load data for the reviews page.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [db]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!selectedBook || !reviewText.trim()) {
      toast.warn('Please select a book and write a review.');
      return;
    }

    try {
      await addDoc(collection(db, 'reviews'), {
        bookId: selectedBook,
        userId: user.uid,
        reviewText: reviewText.trim(),
        likes: [],
        timestamp: new Date(),
      });

      toast.success('Review submitted successfully!');
      setReviewText('');
      setSelectedBook('');
      fetchReviews();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit review.');
    }
  };

  const handleLike = async (reviewId, liked) => {
    const reviewRef = doc(db, 'reviews', reviewId);
    try {
      if (liked) {
        await updateDoc(reviewRef, { likes: arrayRemove(user.uid) });
        toast.info('Like removed');
      } else {
        await updateDoc(reviewRef, { likes: arrayUnion(user.uid) });
        toast.success('Review liked');
      }
      fetchReviews();
    } catch (err) {
      console.error(err);
      toast.error('Failed to update like.');
    }
  };

  if (loading) return <SplashScreen page='reviews'/>;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 p-4 sm:p-6"
    >
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Book Reviews</h2>

        <form onSubmit={handleSubmitReview} className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="mb-4">
            <label htmlFor="book" className="block text-sm font-medium text-gray-700">Select Book</label>
            <select
              id="book"
              value={selectedBook}
              onChange={(e) => setSelectedBook(e.target.value)}
              className="w-full p-2 border rounded mt-1"
            >
              <option value="">Choose a book</option>
              {books.map((book) => (
                <option key={book.id} value={book.id}>{book.title}</option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="review" className="block text-sm font-medium text-gray-700">Review</label>
            <textarea
              id="review"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="w-full p-2 border rounded mt-1"
              rows="4"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="bg-blue-600 text-white p-2 rounded hover:bg-blue-700"
          >
            Submit Review
          </motion.button>
        </form>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {reviews.length === 0 && (
            <p className="text-gray-600 col-span-full text-center">No reviews available.</p>
          )}
          {reviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <h4 className="text-md font-semibold text-gray-800">{review.bookTitle}</h4>
              <p className="text-sm text-gray-600">By {review.reviewerName}</p>
              <p className="text-sm text-gray-600 mb-2">{review.reviewText}</p>

              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => handleLike(review.id, review.likes.includes(user.uid))}
                className={`p-1 rounded ${review.likes.includes(user.uid) ? 'text-red-500' : 'text-gray-500'}`}
              >
                ♥ {review.likes.length}
              </motion.button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default Reviews;