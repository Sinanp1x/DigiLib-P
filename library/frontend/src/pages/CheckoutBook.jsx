import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function CheckoutBook() {
  const [books, setBooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [bookSearch, setBookSearch] = useState('');
  const [studentSearch, setStudentSearch] = useState('');

  useEffect(() => {
    const institutionData = JSON.parse(localStorage.getItem('institution')) || {};
    setBooks(institutionData.books || []);
    setStudents(institutionData.students || []);
  }, []);

  // Filter books based on search input
  const filteredBooks = books.filter(book => 
    (book.title.toLowerCase().includes(bookSearch.toLowerCase()) ||
     book.genre.toLowerCase().includes(bookSearch.toLowerCase())) &&
    book.copiesAvailable > 0
  );

  // Filter students based on search input
  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
    student.uniqueStudentId.toLowerCase().includes(studentSearch.toLowerCase())
  );

  const handleCheckout = (e) => {
    e.preventDefault();
    if (!selectedBook || !selectedStudent) {
      toast.error('Please select both a book and a student');
      return;
    }

    // Get latest data from localStorage
    const institutionData = JSON.parse(localStorage.getItem('institution'));

    // Create new transaction
    const newTransaction = {
      transactionId: `TXN-${Date.now()}`,
      bookId: selectedBook.uniqueBookId,
      bookTitle: selectedBook.title,
      studentId: selectedStudent.uniqueStudentId,
      studentName: selectedStudent.name,
      checkoutDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: "checkedOut"
    };

    // Update the book's available copies
    const updatedBooks = institutionData.books.map(book => {
      if (book.uniqueBookId === selectedBook.uniqueBookId) {
        return { ...book, copiesAvailable: book.copiesAvailable - 1 };
      }
      return book;
    });

    // Update institution data
    const updatedInstitution = {
      ...institutionData,
      books: updatedBooks,
      transactions: [...(institutionData.transactions || []), newTransaction]
    };

    // Save to localStorage
    localStorage.setItem('institution', JSON.stringify(updatedInstitution));

    // Reset form and show success message
    setSelectedBook(null);
    setSelectedStudent(null);
    setBookSearch('');
    setStudentSearch('');
    toast.success('Book checked out successfully!');
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Check Out Book</h2>
      <form onSubmit={handleCheckout} className="space-y-6">
        {/* Book Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Find Book
          </label>
          <div className="relative">
            <input
              type="text"
              value={bookSearch}
              onChange={(e) => setBookSearch(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Search by title or genre..."
            />
            {bookSearch && (
              <ul className="absolute z-10 w-full bg-white border rounded-b mt-1 max-h-60 overflow-auto">
                {filteredBooks.map(book => (
                  <li
                    key={book.uniqueBookId}
                    onClick={() => {
                      setSelectedBook(book);
                      setBookSearch(book.title);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {book.title} by {book.author} ({book.copiesAvailable} available)
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Student Search */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Find Student
          </label>
          <div className="relative">
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              className="w-full p-2 border rounded"
              placeholder="Search by name or ID..."
            />
            {studentSearch && (
              <ul className="absolute z-10 w-full bg-white border rounded-b mt-1 max-h-60 overflow-auto">
                {filteredStudents.map(student => (
                  <li
                    key={student.uniqueStudentId}
                    onClick={() => {
                      setSelectedStudent(student);
                      setStudentSearch(student.name);
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer"
                  >
                    {student.name} (ID: {student.uniqueStudentId})
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Selected Items Display */}
        {(selectedBook || selectedStudent) && (
          <div className="bg-gray-50 p-4 rounded">
            {selectedBook && (
              <p className="mb-2">Selected Book: {selectedBook.title}</p>
            )}
            {selectedStudent && (
              <p>Selected Student: {selectedStudent.name}</p>
            )}
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          disabled={!selectedBook || !selectedStudent}
        >
          Check Out
        </button>
      </form>
    </div>
  );
}