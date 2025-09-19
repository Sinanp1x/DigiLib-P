import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { collection, query, orderBy, limit, getDocs, getDoc, doc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import reviewsImg from '../assets/online-discussion.png';
import bookorderImg from '../assets/food-menu.png';
import myreadsImg from '../assets/reading.png';
import SplashScreen from '../components/SplashScreen'; // adjust path if needed

function StudentDashboard() {
  const { db } = useAuth();
  const [topReviews, setTopReviews] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();
  const [showSplash, setShowSplash] = useState(location.state?.showSplash === true);

  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        // Remove splash state from history so it doesn't show again on reload or navigation
        navigate('.', { replace: true, state: {} });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [showSplash, navigate]);

  useEffect(() => {
    if (!db) return;
    const fetchTopReviews = async () => {
      const q = query(collection(db, 'reviews'), orderBy('likes', 'desc'), limit(5));
      const snapshot = await getDocs(q);
      const reviews = await Promise.all(
        snapshot.docs.map(async (reviewDoc) => {
          const data = reviewDoc.data();
          const bookDoc = await getDoc(doc(db, 'books', data.bookId));
          const userDoc = await getDoc(doc(db, 'users', data.userId));
          return {
            id: reviewDoc.id,
            ...data,
            bookTitle: bookDoc.exists() ? bookDoc.data().title : 'Unknown',
            reviewerName: userDoc.exists() ? userDoc.data().name : 'Anonymous',
          };
        })
      );
      setTopReviews(reviews);
    };
    fetchTopReviews();
  }, [db]);

  const cards = [
    {
      title: '📚 Book Order',
      description: 'Search and book available books or join a waiting list.',
      image: bookorderImg,
      link: '/book-order',
    },
    {
      title: '📖 My Reads',
      description: 'View your current and past reads, mark books as completed.',
      image: myreadsImg,
      link: '/my-reads',
    },
    {
      title: '🗣️ Reviews',
      description: 'Join the community to share and read book reviews.',
      image: reviewsImg,
      link: '/reviews',
    }
  ];

  if (showSplash) return <SplashScreen />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-extrabold mb-8 text-gray-800">🎓 Student Dashboard</h2>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {cards.map((card, index) => (
            <Link to={card.link} key={index}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ scale: 1.05 }}
                className="bg-white p-5 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
              >
                <img
                  src={card.image}
                  alt={card.title}
                  className="w-full h-36 object-contain rounded-md mb-4"
                />
                <h3 className="text-lg font-bold text-blue-700">{card.title}</h3>
                <p className="text-gray-600 text-sm mt-1">{card.description}</p>
              </motion.div>
            </Link>
          ))}
        </div>

        {/* Top Reviews */}
        <h3 className="text-2xl font-bold mb-4 text-gray-800">🏆 Top-Rated Reviews</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topReviews.map((review, index) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.2 }}
              className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <h4 className="text-md font-semibold text-gray-800">{review.bookTitle}</h4>
              <p className="text-sm text-gray-600">👤 {review.reviewerName}</p>
              <p className="text-sm text-gray-500 italic mt-1 line-clamp-2">{review.reviewText}</p>
              <div className="mt-2 flex items-center justify-between text-sm text-blue-600">
                <span>❤️ {review.likes?.length || 0} Likes</span>
                <Link to="/reviews" className="hover:underline" aria-label="View all reviews">
                  View Full Review →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default StudentDashboard;
