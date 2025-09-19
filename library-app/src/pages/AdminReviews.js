import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import SplashScreen from '../components/SplashScreen';
import {
  // collection,
  // getDocs,
  // doc,
  // updateDoc,
  // arrayUnion,
  // arrayRemove,
  // getDoc
} from 'firebase/firestore';
// import { useAuth } from '../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Helper to get the auth token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

function AdminReviews() {
  // const { db, user } = useAuth(); // Temporarily removed
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://127.0.0.1:5000/api/reviews', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch reviews.');
      }
      const data = await response.json();
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      toast.error('Failed to load reviews.');
    }
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        await fetchReviews();
      } catch (error) {
        console.error('Error fetching all data:', error);
        toast.error('Could not load data for the reviews page.');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [fetchReviews]);

  const handleLike = async (reviewId, liked) => {
    try {
      const token = getAuthToken();
      const response = await fetch(`http://127.0.0.1:5000/api/reviews/${reviewId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update like.');
      }

      // Update the specific review in the local state
      setReviews(prevReviews =>
        prevReviews.map(review =>
          review.id === reviewId ? data.review : review
        )
      );

      toast.success(data.message);
    } catch (err) {
      console.error('Error updating like:', err);
      toast.error(err.message || 'Failed to update like.');
    }
  };

  if (loading) return <SplashScreen message="Loading Reviews..." page='reviews' />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 p-4 sm:p-6"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Manage Reviews</h2>

        {reviews.length === 0 ? (
          <p className="text-center text-gray-500">No reviews available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((review, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                key={review.id}
                className="bg-white p-4 rounded-lg shadow-md"
              >
                <h4 className="text-md font-semibold text-gray-800">{review.bookTitle}</h4>
                <p className="text-sm text-gray-600">By {review.reviewerName}</p>
                <p className="text-sm text-gray-600 mb-2">{review.reviewText}</p>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => handleLike(review.id, review.likes?.includes(JSON.parse(localStorage.getItem('user'))?.id))}
                  className={`p-1 rounded ${review.likes?.includes(JSON.parse(localStorage.getItem('user'))?.id) ? 'text-red-500' : 'text-gray-500'}`}
                  aria-label={review.likes?.includes(JSON.parse(localStorage.getItem('user'))?.id) ? 'Unlike review' : 'Like review'}
                >
                  ♥ {review.likes.length || 0}
                </motion.button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

export default AdminReviews;
