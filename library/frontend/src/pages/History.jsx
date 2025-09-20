import { useState, useEffect } from 'react';
import { Parser } from 'json2csv';

export default function History() {
  const [history, setHistory] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const institutionData = JSON.parse(localStorage.getItem('institution')) || {};
    setHistory(institutionData.history || []);
  }, []);

  const handleSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedHistory = [...history].sort((a, b) => {
    if (!sortConfig.key) return 0;

    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'ascending' ? 1 : -1;
    }
    return 0;
  });

  const filteredHistory = sortedHistory.filter(item =>
    Object.values(item).some(
      value => value.toString().toLowerCase().includes(filter.toLowerCase())
    )
  );

  const exportToCSV = () => {
    try {
      const fields = ['studentName', 'studentId', 'bookTitle', 'bookId', 'checkoutDate', 'checkinDate', 'status'];
      const json2csvParser = new Parser({ fields });
      const csv = json2csvParser.parse(filteredHistory);
      
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', 'transaction_history.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Transaction History</h2>
        <div className="space-x-4">
          <input
            type="text"
            placeholder="Filter records..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="p-2 border rounded"
          />
          <button
            onClick={exportToCSV}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          >
            Export to CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white">
          <thead>
            <tr>
              {['Student Name', 'Student ID', 'Book Title', 'Book ID', 'Check-out Date', 'Check-in Date', 'Status'].map((header, index) => (
                <th
                  key={index}
                  onClick={() => handleSort(header.toLowerCase().replace(' ', ''))}
                  className="px-6 py-3 border-b border-gray-200 bg-gray-50 text-left text-xs leading-4 font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                >
                  {header}
                  {sortConfig.key === header.toLowerCase().replace(' ', '') && (
                    <span>{sortConfig.direction === 'ascending' ? ' ↑' : ' ↓'}</span>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {filteredHistory.map((item, index) => (
              <tr key={index}>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {item.studentName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {item.studentId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {item.bookTitle}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {item.bookId}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {item.checkoutDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {item.checkinDate}
                </td>
                <td className="px-6 py-4 whitespace-nowrap border-b border-gray-200">
                  {item.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredHistory.length === 0 && (
          <p className="text-center py-4 text-gray-500">No transaction history found</p>
        )}
      </div>
    </div>
  );
}