import { useState, useEffect } from 'react';
import { useStudentAuth } from '../StudentAuthContext';

export default function StudentMyBooks() {
  const [transactions, setTransactions] = useState([]);
  const [history, setHistory] = useState([]);
  const { student } = useStudentAuth();

  useEffect(() => {
    const institution = JSON.parse(localStorage.getItem('institution'));
    
    // Get active transactions
    const activeTransactions = (institution?.transactions || [])
      .filter(t => t.studentId === student.uniqueStudentId);
    
    // Get history
    const transactionHistory = (institution?.history || [])
      .filter(h => h.studentId === student.uniqueStudentId);
    
    setTransactions(activeTransactions);
    setHistory(transactionHistory);
  }, [student.uniqueStudentId]);

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="max-w-6xl mx-auto p-8">
      <h1 className="text-2xl font-bold text-primary-blue mb-6">My Library Books</h1>

      {/* Active Borrows */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Currently Borrowed Books</h2>
        {transactions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {transactions.map(transaction => (
              <div
                key={transaction.transactionId}
                className={`p-4 rounded-lg shadow ${
                  isOverdue(transaction.dueDate)
                    ? 'bg-red-50 border border-red-200'
                    : 'bg-white'
                }`}
              >
                <h3 className="font-semibold text-lg mb-2">{transaction.bookTitle}</h3>
                <p className="text-sm text-gray-600">Book ID: {transaction.bookId}</p>
                <p className="text-sm text-gray-600">Checked Out: {transaction.checkoutDate}</p>
                <p className={`text-sm font-medium ${
                  isOverdue(transaction.dueDate) ? 'text-red-600' : 'text-gray-600'
                }`}>
                  Due: {transaction.dueDate}
                  {isOverdue(transaction.dueDate) && ' (OVERDUE)'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No books currently borrowed</p>
        )}
      </section>

      {/* History */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Borrowing History</h2>
        {history.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Book Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-out Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {history.map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {item.bookTitle}
                        </div>
                        <div className="text-sm text-gray-500">
                          {item.bookId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.checkoutDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {item.checkinDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No borrowing history available</p>
        )}
      </section>
    </div>
  );
}