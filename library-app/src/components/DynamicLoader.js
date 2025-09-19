import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

function DynamicLoader({ message = 'Processing...', progress = 0 }) {
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots((prev) => (prev.length < 3 ? prev + '.' : ''));
    }, 500);
    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
    >
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <motion.div
          animate={{ rotate: [0, 10, -10, 0] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
          className="text-4xl mb-4"
        >
          📚
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-bold text-gray-700"
        >
          {message}{dots} ({progress}%)
        </motion.p>
        <motion.div
          className="w-48 h-3 bg-gray-200 rounded-full mt-4 overflow-hidden"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        >
          <div className="h-full bg-blue-600" />
        </motion.div>
      </div>
    </motion.div>
  );
}

export default DynamicLoader;