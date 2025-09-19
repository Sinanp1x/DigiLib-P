import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { collection, query, where, getDocs, getDoc, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SplashScreen from '../components/SplashScreen';

function MyReads() {
  const { db, user } = useAuth();
  const [currentReads, setCurrentReads] = useState([]);
  const [pastReads, setPastReads] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReads = async () => {
      try {
        setLoading(true);
      const currentQuery = query(collection(db, 'userReads'), where('userId', '==', user.uid), where('status', '==', 'current'));
      const pastQuery = query(collection(db, 'userReads'), where('userId', '==', user.uid), where('status', '==', 'completed'));
      const currentSnapshot = await getDocs(currentQuery);
      const pastSnapshot = await getDocs(pastQuery);

      const current = await Promise.all(
        currentSnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const bookDoc = await getDoc(doc(db, 'books', data.bookId));
          return {
            id: docSnap.id,
            ...data,
            bookTitle: bookDoc.exists() ? bookDoc.data().title : 'Unknown'
          };
        })
      );

      const past = await Promise.all(
        pastSnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const bookDoc = await getDoc(doc(db, 'books', data.bookId));
          return {
            id: docSnap.id,
            ...data,
            bookTitle: bookDoc.exists() ? bookDoc.data().title : 'Unknown'
          };
        })
      );

      setCurrentReads(current);
      setPastReads(past);
      } catch (error) {
        console.error("Failed to fetch reads:", error);
        toast.error("Could not load data for the reads page.");
      } finally {
        setLoading(false);
      }
    };
    fetchReads();
  }, [db, user]);

  const markAsCompleted = async (readId, bookId) => {
    try {
      await updateDoc(doc(db, 'userReads', readId), {
        status: 'completed',
        completionDate: new Date(),
      });
      await updateDoc(doc(db, 'books', bookId), { available: true });
      toast.success('Marked as completed');

      // Refresh reads
      const currentQuery = query(collection(db, 'userReads'), where('userId', '==', user.uid), where('status', '==', 'current'));
      const pastQuery = query(collection(db, 'userReads'), where('userId', '==', user.uid), where('status', '==', 'completed'));
      const currentSnapshot = await getDocs(currentQuery);
      const pastSnapshot = await getDocs(pastQuery);

      const current = await Promise.all(
        currentSnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const bookDoc = await getDoc(doc(db, 'books', data.bookId));
          return {
            id: docSnap.id,
            ...data,
            bookTitle: bookDoc.exists() ? bookDoc.data().title : 'Unknown'
          };
        })
      );

      const past = await Promise.all(
        pastSnapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          const bookDoc = await getDoc(doc(db, 'books', data.bookId));
          return {
            id: docSnap.id,
            ...data,
            bookTitle: bookDoc.exists() ? bookDoc.data().title : 'Unknown'
          };
        })
      );

      setCurrentReads(current);
      setPastReads(past);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update read');
    }
  };

  if (loading) return <SplashScreen page='default' />;
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 p-4 sm:p-6"
    >
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">My Reads</h2>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Current Reads</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {currentReads.map((read, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              key={read.id}
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <h4 className="text-md font-semibold text-gray-800">{read.bookTitle}</h4>
              <p className="text-sm text-gray-600">Started: {new Date(read.startDate).toLocaleDateString()}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => markAsCompleted(read.id, read.bookId)}
                className="bg-green-600 text-white p-2 rounded mt-2 hover:bg-green-700"
                aria-label={`Mark ${read.bookTitle} as completed`}
              >
                Mark as Completed
              </motion.button>
            </motion.div>
          ))}
        </div>
        <h3 className="text-xl font-semibold mb-4 text-gray-800">Past Reads</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {pastReads.map((read, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              key={read.id}
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <h4 className="text-md font-semibold text-gray-800">{read.bookTitle}</h4>
              <p className="text-sm text-gray-600">Completed: {new Date(read.completionDate).toLocaleDateString()}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default MyReads;
