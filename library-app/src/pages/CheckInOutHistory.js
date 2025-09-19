import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
// import { collection, getDocs, getDoc, doc } from 'firebase/firestore';
// import { useAuth } from '../contexts/AuthContext';
import SplashScreen from '../components/SplashScreen';
import { toast } from 'react-toastify';


function CheckInOutHistory() {
  // const { db } = useAuth(); // Temporarily removed
  const [history, setHistory] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterStudentId, setFilterStudentId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
  const fetchHistory = async () => {
    try {
      setLoading(true);
    // TODO: Replace with API call to fetch history
    // const snapshot = await getDocs(collection(db, 'userReads'));
    // const historyData = await Promise.all(
    //   snapshot.docs.map(async (docSnap) => {
    //     const data = docSnap.data();
    //     const bookDoc = await getDoc(doc(db, 'books', data.bookId));
    //     const userDoc = await getDoc(doc(db, 'users', data.userId));
    //     return {
    //       id: docSnap.id,
    //       ...data,
    //       bookTitle: bookDoc.exists() ? bookDoc.data().title : 'Unknown',
    //       studentName: userDoc.exists() ? userDoc.data().name : 'Unknown',
    //       studentId: userDoc.exists() ? userDoc.data().studentId : '',
    //       fine: calculateFine(data),
    //     };
    //   })
    // );
    // setHistory(historyData);
    toast.info("History is temporarily disabled pending API integration.");
    setHistory([]);
    } catch (error) {
      console.error("Failed to fetch check-in/out history:", error);
      toast.error("Could not load data for the check-in/out history page.");
    } finally {
      setLoading(false);
    }
  };
  fetchHistory();

  }, []); // Removed `db` from dependencies

  const calculateFine = (read) => {
    const dueDate = read.extensionDate || read.dueDate;
    const daysOverdue = Math.max(0, Math.floor((new Date() - new Date(dueDate)) / (1000 * 3600 * 24)));
    return daysOverdue * 1; // $1/day
  };

  const filteredHistory = history.filter(
    (record) =>
      (!filterDate || new Date(record.startDate).toLocaleDateString() === new Date(filterDate).toLocaleDateString()) &&
      (!filterStudentId || record.studentId === filterStudentId)
  );

  if (loading) return <SplashScreen message='Loading Check In/Out-History...' page='check-in-out'/>;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 p-4 sm:p-6"
    >
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Check In/Out History</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className="p-2 border rounded"
            aria-label="Filter by date"
          />
          <input
            type="text"
            value={filterStudentId}
            onChange={(e) => setFilterStudentId(e.target.value)}
            placeholder="Filter by Student ID"
            className="p-2 border rounded"
            aria-label="Filter by student ID"
          />
        </div>
        <div className="grid grid-cols-1 gap-4">
          {filteredHistory.map((record, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              key={record.id}
              className="bg-white p-4 rounded-lg shadow-md"
            >
              <p className="text-sm text-gray-600">Book: {record.bookTitle}</p>
              <p className="text-sm text-gray-600">Student: {record.studentName}</p>
              <p className="text-sm text-gray-600">Status: {record.status}</p>
              <p className="text-sm text-gray-600">Start: {new Date(record.startDate).toLocaleDateString()}</p>
              <p className="text-sm text-gray-600">Due: {new Date(record.dueDate).toLocaleDateString()}</p>
              {record.fine > 0 && <p className="text-sm text-red-600">Fine: ${record.fine}</p>}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

export default CheckInOutHistory;