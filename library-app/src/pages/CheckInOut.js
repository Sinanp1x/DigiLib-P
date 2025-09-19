import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { BrowserMultiFormatReader } from '@zxing/library';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SplashScreen from '../components/SplashScreen';
import DynamicLoader from '../components/DynamicLoader';

// Helper to get the auth token from localStorage
const getAuthToken = () => localStorage.getItem('authToken');

function CheckInOut() {
  const [scannedBook, setScannedBook] = useState(null);
  const [studentId, setStudentId] = useState('');
  const [readings, setReadings] = useState([]);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef(null);

  const refreshReadings = useCallback(async () => {
    try {
      const token = getAuthToken();
      const response = await fetch('http://127.0.0.1:5000/api/readings/active', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Failed to fetch active readings.');
      const data = await response.json();
      setReadings(data);
    } catch (err) {
      console.error('Error refreshing readings:', err);
      toast.error('Failed to load active bookings');
    }
  }, []);

  useEffect(() => {
    setIsLoading(true);
    refreshReadings().finally(() => setIsLoading(false));
  }, [refreshReadings]);

  useEffect(() => {
    const codeReader = new BrowserMultiFormatReader();
    const setupCamera = async () => {
      try {
        const result = await codeReader.decodeFromVideoDevice(undefined, videoRef.current);
        const barcode = result.getText();
        toast.info(`Scanned barcode: ${barcode}`);
        
        const token = getAuthToken();
        const response = await fetch(`http://127.0.0.1:5000/api/books/by-barcode/${barcode}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const bookData = await response.json();
        if (!response.ok) {
          throw new Error(bookData.error || 'Failed to find book.');
        }
        setScannedBook(bookData);
        setIsCameraActive(false); // Turn off camera after successful scan
      } catch (err) {
        if (err.name !== 'NotFoundException') { // Ignore "not found" errors which happen during scanning
          console.error('Barcode scan failed:', err);
          toast.error(err.message || 'Barcode scan failed.');
          setIsCameraActive(false);
        }
      }
    };

    if (isCameraActive && videoRef.current) {
      setupCamera();
    }

    return () => {
      codeReader.reset();
    };
  }, [isCameraActive]);

  const toggleCamera = () => {
    setScannedBook(null); // Clear previous scan
    setIsCameraActive(!isCameraActive);
  };

  const handleCheckIn = async () => {
    if (!studentId || !scannedBook) {
      toast.warn('Please scan a book and enter a Student ID.');
      return;
    }
    setIsProcessing(true);
    try {
      const token = getAuthToken();
      const response = await fetch('http://127.0.0.1:5000/api/check-in', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ studentId, bookId: scannedBook.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Check-in failed.');

      setScannedBook(null);
      setStudentId('');
      toast.success('Book checked in successfully');
      await refreshReadings();
    } catch (err) {
      console.error('Error checking in:', err);
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!scannedBook) {
      toast.warn('Please scan a book to check it out.');
      return;
    }
    setIsProcessing(true);
    try {
      const token = getAuthToken();
      const response = await fetch('http://127.0.0.1:5000/api/check-out', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bookId: scannedBook.id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Check-out failed.');

      setScannedBook(null);
      toast.success('Book checked out successfully');
      await refreshReadings();
    } catch (err) {
      console.error('Error checking out:', err);
      toast.error(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) return <SplashScreen message="Loading Check In/Out Requests..." page="check-in-out" />;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gray-100 p-4 sm:p-6"
    >
      <ToastContainer />
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-4 mb-6 items-center">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Check In/Out</h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={toggleCamera}
            className={`bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-700 transition-colors mb-4 ${
              isCameraActive ? 'bg-red-600 hover:bg-red-700' : ''
            }`}
            disabled={isProcessing}
          >
            {isCameraActive ? 'Stop Camera' : 'Start Camera'}
          </motion.button>
        </div>

        {isCameraActive && <video ref={videoRef} className="w-full h-64 rounded shadow" />}

        {scannedBook && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white p-4 rounded-lg shadow-md mt-4"
          >
            <h3 className="text-lg font-bold">{scannedBook.title}</h3>
            <p className="text-sm text-gray-600">Author: {scannedBook.author}</p>
            <p className="text-sm text-gray-600">Status: <span className={scannedBook.status === 'available' ? 'text-green-600' : 'text-red-600'}>{scannedBook.status}</span></p>
            
            {scannedBook.status === 'available' && (
              <div className="mt-4">
                <input
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter Student ID to Check In"
                  className="mt-2 p-2 border rounded w-full"
                />
                <motion.button
                  onClick={handleCheckIn}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Processing...' : 'Check In (Loan to Student)'}
                </motion.button>
              </div>
            )}

            {scannedBook.status === 'borrowed' && (
              <motion.button
                onClick={handleCheckOut}
                className="mt-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Check Out (Return Book)'}
              </motion.button>
            )}
          </motion.div>
        )}

        <h3 className="text-xl font-bold mt-10 mb-4">📚 Active Bookings</h3>
        <div className="grid gap-4">
          {readings.length === 0 && (
            <p className="text-gray-600 text-center">No active bookings found.</p>
          )}
          {readings.map((reading, i) => (
            <motion.div
              key={reading.id}
              className="bg-white p-4 rounded-lg shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <p><strong>Book:</strong> {reading.book.title}</p>
              <p><strong>User:</strong> {reading.user.username} ({reading.user.student_id})</p>
              <p><strong>Due:</strong> {new Date(reading.due_date).toLocaleDateString()}</p>
            </motion.div>
          ))}
        </div>
      </div>
      {isProcessing && <DynamicLoader message="Processing Action" progress={0} />}
    </motion.div>
  );
}

export default CheckInOut;