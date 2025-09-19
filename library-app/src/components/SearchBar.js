import React from 'react';
import { motion } from 'framer-motion';

function SearchBar({ value, onChange }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full mb-4"
    >
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by title, author, genre, or language"
        className="p-2 w-full border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-300"
        aria-label="Search books"
      />
    </motion.div>
  );
}

export default SearchBar;