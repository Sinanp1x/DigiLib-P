import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const institutionData = JSON.parse(localStorage.getItem('institution')) || {};
    setTransactions(institutionData.transactions || []);
  }, []);

  const handleExtendDueDate = (transactionId) => {
    const days = window.prompt('Enter number of days to extend:', '7');
    if (!days || isNaN(days)) return;

    const institutionData = JSON.parse(localStorage.getItem('institution'));
    const updatedTransactions = institutionData.transactions.map(transaction => {
      if (transaction.transactionId === transactionId) {
        const currentDueDate = new Date(transaction.dueDate);
        const newDueDate = new Date(currentDueDate.getTime() + parseInt(days) * 24 * 60 * 60 * 1000);
        return {
          ...transaction,
          dueDate: newDueDate.toISOString().split('T')[0]
        };
      }
      return transaction;
    });

    const updatedInstitution = {
      ...institutionData,
      transactions: updatedTransactions
    };

    localStorage.setItem('institution', JSON.stringify(updatedInstitution));
    setTransactions(updatedTransactions);
    toast.success('Due date extended successfully!');
  };

  const handleCheckIn = (transaction) => {
    const institutionData = JSON.parse(localStorage.getItem('institution'));

    // Create history entry
    const historyEntry = {
      ...transaction,
      checkinDate: new Date().toISOString().split('T')[0],
      status: 'returned'
    };

    // Update book availability
    const updatedBooks = institutionData.books.map(book => {
      if (book.uniqueBookId === transaction.bookId) {
        return { ...book, copiesAvailable: book.copiesAvailable + 1 };
      }
      return book;
    });

    // Remove from active transactions and add to history
    const updatedTransactions = institutionData.transactions.filter(
      t => t.transactionId !== transaction.transactionId
    );

    const updatedInstitution = {
      ...institutionData,
      books: updatedBooks,
      transactions: updatedTransactions,
      history: [...(institutionData.history || []), historyEntry]
    };

    localStorage.setItem('institution', JSON.stringify(updatedInstitution));
    setTransactions(updatedTransactions);
    toast.success('Book checked in successfully!');
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4">Active Transactions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {transactions.map(transaction => (
          <div
            key={transaction.transactionId}
            className={`border rounded-lg p-4 ${
              isOverdue(transaction.dueDate) ? 'border-red-500' : 'border-gray-200'
            }`}
          >
            <h3 className="font-bold text-lg mb-2">{transaction.bookTitle}</h3>
            <p>Student: {transaction.studentName}</p>
            <p>Student ID: {transaction.studentId}</p>
            <p>Checked Out: {transaction.checkoutDate}</p>
            <p className={`font-semibold ${
              isOverdue(transaction.dueDate) ? 'text-red-500' : ''
            }`}>
              Due Date: {transaction.dueDate}
              {isOverdue(transaction.dueDate) && ' (OVERDUE)'}
            </p>
            
            <div className="mt-4 space-x-2">
              <button
                onClick={() => handleExtendDueDate(transaction.transactionId)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Extend Due Date
              </button>
              <button
                onClick={() => handleCheckIn(transaction)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Check In
              </button>
            </div>
          </div>
        ))}
      </div>
      {transactions.length === 0 && (
        <p className="text-gray-500 text-center mt-4">No active transactions</p>
      )}
    </div>
  );
}