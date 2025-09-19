import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';

// NOTE: You will need to add these images to your `src/assets` folder.
// You can find placeholder images online or create your own.
import catalogueImg from '../assets/catalogue.png';
import checkInOutImg from '../assets/document1.png';
import usersImg from '../assets/group.png';
import reviewsImg from '../assets/online-discussion.png';
import checkOutImg from '../assets/document.png';

function AdminDashboard() {
  const cards = [
    {
      title: 'Reviews',
      description: 'View and react to student book reviews.',
      image: reviewsImg,
      link: '/admin/reviews',
    },
    {
      title: 'Users',
      description: 'Manage student accounts and classes.',
      image: usersImg,
      link: '/admin/users',
    },
    {
      title: 'Check In/Out',
      description: 'Scan barcodes and manage book loans.',
      image: checkInOutImg,
      link: '/admin/check-in-out',
    },
    {
      title: 'Catalogue',
      description: 'Add, edit, or remove books from the library.',
      image: catalogueImg,
      link: '/admin/catalogue',
    },
    {
      title: 'Check In/Out History',
      description: 'View the history of book loans.',
      image: checkOutImg,
      link: '/admin/history',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="p-4 sm:p-6"
      >
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {cards.map((card, index) => (
              <Link to={card.link} key={index} className="h-full">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  whileHover={{ scale: 1.05, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
                  className="bg-white p-4 rounded-lg shadow-md h-full flex flex-col"
                >
                  <img src={card.image} alt={card.title} className="w-full h-36 object-contain rounded-md mb-4" />
                  <h3 className="text-lg font-bold text-gray-800">{card.title}</h3>
                  <p className="text-gray-600 mt-1 flex-grow">{card.description}</p>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminDashboard;
