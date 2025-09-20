import { useState, useEffect } from 'react';
import { useStudentAuth } from '../StudentAuthContext';

export default function StudentRequests() {
  const [requests, setRequests] = useState([]);
  const { student } = useStudentAuth();

  useEffect(() => {
    const institution = JSON.parse(localStorage.getItem('institution'));
    const studentRequests = (institution?.bookingRequests || [])
      .filter(req => req.studentId === student.uniqueStudentId);
    setRequests(studentRequests);
  }, [student.uniqueStudentId]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-primary-blue mb-6">My Book Requests</h1>

      {requests.length > 0 ? (
        <div className="space-y-4">
          {requests.map(request => (
            <div
              key={request.requestId}
              className="bg-white rounded-lg shadow-md p-6"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-2">{request.bookTitle}</h3>
                  <p className="text-sm text-gray-600">Request ID: {request.requestId}</p>
                  <p className="text-sm text-gray-600">
                    Requested on: {new Date(request.requestDate).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
                    request.status
                  )}`}
                >
                  {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                </span>
              </div>
              {request.rejectionReason && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
                  <p className="text-sm">
                    <strong>Reason for rejection:</strong> {request.rejectionReason}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-gray-500">You haven't made any book requests yet.</p>
          <p className="text-sm text-gray-400 mt-2">
            Visit the catalogue to browse and request books.
          </p>
        </div>
      )}
    </div>
  );
}