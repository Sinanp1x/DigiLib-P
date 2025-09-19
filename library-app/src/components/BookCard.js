import React from 'react';
import { motion } from 'framer-motion';
import bookImage from '../assets/book.png'; // Placeholder image for book cover

function BookCard({ book, onRemove }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ scale: 1.05, boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' }}
      className="bg-white rounded-lg shadow-md relative flex items-start w-full"
      role="region"
      aria-label={`Book: ${book.title}`}
    >
      {/* Book image on the left */}
      <img
        src={book.coverUrl || bookImage}
        alt={book.title}
        className="w-24 h-32 object-cover rounded-md mt-1 ml-1 mb-1 mr-1 flex-shrink-0"
      />
      {/* Book details on the right */}
      <div className="flex-1 flex flex-col justify-start overflow-hidden mt-0.5">
        <h3 className="text-md font-semibold text-gray-800 break-words max-w-[12rem] leading-tight line-clamp-2">{book.title}</h3>
        {book.seriesTitle && (
          <p className="text-xs text-blue-700">Series: {book.seriesTitle} {book.volumeNumber ? `(Vol. ${book.volumeNumber})` : ''}</p>
        )}
        <p className="text-sm text-gray-600 mt-2">Author: {book.author}</p>
        <p className="text-sm text-gray-600">Genre: {book.genre}</p>
        <p className="text-sm text-gray-600">Language: {book.language}</p>
      </div>
      <div className="absolute top-2 right-2 group">
        <button
          className="text-gray-600 hover:text-gray-800"
          aria-label="Book actions"
          aria-haspopup="true"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
            />

          </svg>
        </button>
        <div className="hidden group-hover:block absolute right-0 bg-white shadow-md rounded z-10 min-w-[120px]">
          <button
            onClick={() => onRemove(book.id)}
            className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
            aria-label={`Remove book: ${book.title}`}
          >
            Remove
          </button>
        </div>
      </div>
      <span className="text-xs text-gray-500 absolute top-2 left-2 bg-gray-200 px-2 py-1 rounded">
        #{book.serial}
      </span>
    </motion.div>
  );
}

export default BookCard;