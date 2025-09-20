import { useState, useEffect } from 'react';
import { useStudentAuth } from '../StudentAuthContext';

const FINE_RATE_PER_DAY = 1; // $1 per day

export default function StudentFines() {
  const [fines, setFines] = useState([]);
  const [totalFine, setTotalFine] = useState(0);
  const { student } = useStudentAuth();

  useEffect(() => {
    const institution = JSON.parse(localStorage.getItem('institution'));
    
    // Calculate fines for active transactions
    const activeTransactions = (institution?.transactions || [])
      .filter(t => t.studentId === student.uniqueStudentId);

    const calculatedFines = activeTransactions.map(transaction => {
      const dueDate = new Date(transaction.dueDate);
      const today = new Date();
      
      if (dueDate < today) {
        const daysOverdue = Math.floor((today - dueDate) / (1000 * 60 * 60 * 24));
        const fineAmount = daysOverdue * FINE_RATE_PER_DAY;
        
        return {
          transactionId: transaction.transactionId,
          bookTitle: transaction.bookTitle,
          dueDate: transaction.dueDate,
          daysOverdue,
          amount: fineAmount
        };
      }
      return null;
    }).filter(Boolean);

    // Get existing paid fines from history
    const paidFines = (institution?.history || [])
      .filter(h => h.studentId === student.uniqueStudentId && h.fine)
      .map(h => ({
        ...h.fine,
        paid: true,
        bookTitle: h.bookTitle,
      }));

    const allFines = [...calculatedFines, ...paidFines];
    setFines(allFines);
    
    // Calculate total unpaid fines
    const total = calculatedFines.reduce((sum, fine) => sum + fine.amount, 0);
    setTotalFine(total);
  }, [student.uniqueStudentId]);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-primary-blue">My Fines</h1>
        <div className="bg-white px-6 py-3 rounded-lg shadow-md">
          <span className="text-gray-600">Total Outstanding:</span>
          <span className="ml-2 text-xl font-bold text-red-600">
            ${totalFine.toFixed(2)}
          </span>
        </div>
      </div>

      {fines.length > 0 ? (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Book
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Days Overdue
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {fines.map((fine, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {fine.bookTitle}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fine.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {fine.daysOverdue}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${fine.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        fine.paid
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {fine.paid ? 'Paid' : 'Unpaid'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-500">You don't have any fines</p>
        </div>
      )}

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-blue-800 font-medium mb-2">Fine Policy</h3>
        <p className="text-sm text-blue-600">
          Fines are calculated at a rate of ${FINE_RATE_PER_DAY.toFixed(2)} per day for overdue books.
          Please return books on time to avoid fines. Contact the librarian if you need to extend your due date.
        </p>
      </div>
    </div>
  );
}