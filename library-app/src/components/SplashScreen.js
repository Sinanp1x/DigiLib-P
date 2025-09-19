import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import logo from '../assets/logo.png'; // Adjust path as needed

function SplashScreen({ message = 'Loading...', page = 'default' }) {
  const [currentMessage, setCurrentMessage] = useState(message);

  // Define page-specific message sets
  const messageSets = {
    catalogue: [
      message,
      'Fetching Catalogue...',
      'Loading Books...',
      'Preparing Book List...',
      'Retrieving Library Data...'
    ],
    dashboard: [
      message,
      'Initializing Dashboard...',
      'Loading Admin Tools...',
      'Preparing Reports...',
      'Setting Up Controls...'
    ],
    profile: [
      message,
      'Loading Profile...',
      'Fetching User Data...',
      'Preparing Preferences...',
      'Updating Account Info...'
    ],
    default: [
      message,
      'Loading Library App...',
      'Initializing App...',
      'Preparing Interface...',
      'Connecting to Library...'
    ],
    reviews: [
      message,
      'Loading Reviews...',
      'Fetching Reviews...',
      'Retrieving Book Reviews...'
    ],
    users: [
      message,
      'Loading Users...',
      'Fetching User Data...',
      'Retrieving User Profiles...'
    ],
    'check-in-out': [
      message,
      'Loading Check In/Out History...',
      'Fetching Requests...',
      'Preparing Check In/Out Data...'
    ]
  };

  // Select messages based on page prop
  const messages = messageSets[page.toLowerCase()] || messageSets.default;

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessage(messages[Math.floor(Math.random() * messages.length)]);
    }, 1500);
    return () => clearInterval(interval);
  }, [messages]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-white"
    >
      <div className="text-center">
        <motion.img
          src={logo}
          alt="Logo"
          className="w-24 h-24 mx-auto mb-4"
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
        <motion.p
          key={currentMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-xl font-bold text-gray-700"
        >
          {currentMessage}
        </motion.p>
      </div>
    </motion.div>
  );
}

export default SplashScreen;