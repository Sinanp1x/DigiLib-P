import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function Requests() {
  const [requests, setRequests] = useState([]);

  useEffect(() => {
    const institution = JSON.parse(localStorage.getItem('institution'));
    const pendingRequests = (institution?.bookingRequests || [])
      .filter(req => req.status === 'pending');
    setRequests(pendingRequests);
  }, []);

  const handleRequest = (request, approved, reason = '') => {
    const institution = JSON.parse(localStorage.getItem('institution'));
    
    if (approved) {
      // Create new transaction
      const newTransaction = {
        transactionId: `TXN-${Date.now()}`,
        bookId: request.bookId,
        bookTitle: request.bookTitle,
        studentId: request.studentId,
        studentName: request.studentName,
        checkoutDate: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: "checkedOut"
      };

      // Update book availability
      const updatedBooks = institution.books.map(book => {
        if (book.uniqueBookId === request.bookId) {
          if (book.copiesAvailable === 0) {
            throw new Error('No copies available');
          }
          return { ...book, copiesAvailable: book.copiesAvailable - 1 };
        }
        return book;
      });

      // Update institution data
      institution.books = updatedBooks;
      institution.transactions = [...(institution.transactions || []), newTransaction];
    }

    // Update request status
    institution.bookingRequests = institution.bookingRequests.map(req => {
      if (req.requestId === request.requestId) {
        return {
          ...req,
          status: approved ? 'approved' : 'rejected',
          ...(reason && { rejectionReason: reason })
        };
      }
      return req;
    });

    localStorage.setItem('institution', JSON.stringify(institution));
    
    // Update local state
    setRequests(requests.filter(req => req.requestId !== request.requestId));
    
    toast.success(
      approved ? 'Request approved and book checked out' : 'Request rejected'
    );
  };

  const handleReject = (request) => {
    const reason = window.prompt('Please provide a reason for rejection:');
    if (reason !== null) {
      handleRequest(request, false, reason);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h2 className="text-2xl font-bold text-primary-blue mb-6">Pending Book Requests</h2>

      {requests.length > 0 ? (
        <div className="grid grid-cols-1 gap-4">
          {requests.map(request => (
            <div
              key={request.requestId}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-semibold">{request.bookTitle}</h3>
                  <p className="text-sm text-gray-600">Book ID: {request.bookId}</p>
                  <p className="text-sm text-gray-600">
                    Requested by: {request.studentName} ({request.studentId})
                  </p>
                  <p className="text-sm text-gray-600">
                    Request Date: {new Date(request.requestDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center justify-end space-x-4">
                  <button
                    onClick={() => handleRequest(request, true)}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(request)}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                  >
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">No pending requests</p>
      )}
    </div>
  );
}