import { useState, useEffect } from 'react';
import { useStudentAuth } from '../StudentAuthContext';
import { toast } from 'react-hot-toast';

export default function StudentCatalogue() {
  const [books, setBooks] = useState([]);
  const [filter, setFilter] = useState('');
  const { student } = useStudentAuth();

  useEffect(() => {
    const institution = JSON.parse(localStorage.getItem('institution'));
    setBooks(institution?.books || []);
  }, []);

  const handleRequestBook = (book) => {
    if (book.copiesAvailable === 0) {
      toast.error('No copies available for this book');
      return;
    }

    const institution = JSON.parse(localStorage.getItem('institution'));
    const existingRequest = institution.bookingRequests?.find(
      req => req.bookId === book.uniqueBookId && req.studentId === student.uniqueStudentId
    );

    if (existingRequest) {
      toast.error('You already have a pending request for this book');
      return;
    }

    const newRequest = {
      requestId: `REQ-${Date.now()}`,
      studentId: student.uniqueStudentId,
      studentName: student.name,
      bookId: book.uniqueBookId,
      bookTitle: book.title,
      requestDate: new Date().toISOString(),
      status: 'pending'
    };

    const updatedInstitution = {
      ...institution,
      bookingRequests: [...(institution.bookingRequests || []), newRequest]
    };

    localStorage.setItem('institution', JSON.stringify(updatedInstitution));
    toast.success('Book request submitted successfully');
  };

  const filteredBooks = books.filter(book => 
    book.title.toLowerCase().includes(filter.toLowerCase()) ||
    book.author.toLowerCase().includes(filter.toLowerCase()) ||
    book.genre.toLowerCase().includes(filter.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-blue">Browse Books</h1>
        <input
          type="text"
          placeholder="Search by title, author, or genre..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="px-4 py-2 border rounded-lg w-80 focus:outline-none focus:ring-2 focus:ring-primary-blue"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBooks.map(book => (
          <div key={book.uniqueBookId} className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{book.title}</h3>
              <p className="text-gray-600 mb-1">by {book.author}</p>
              <p className="text-sm text-gray-500 mb-3">Genre: {book.genre}</p>
              <div className="flex justify-between items-center">
                <span className={`text-sm ${book.copiesAvailable > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {book.copiesAvailable} of {book.totalCopies} available
                </span>
                <button
                  onClick={() => handleRequestBook(book)}
                  disabled={book.copiesAvailable === 0}
                  className={`px-4 py-2 rounded-lg text-white ${
                    book.copiesAvailable > 0
                      ? 'bg-primary-blue hover:bg-secondary-blue'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  Request Book
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <p className="text-center text-gray-500 mt-8">No books found matching your search.</p>
      )}
    </div>
  );
}