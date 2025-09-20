import { Routes, Route } from 'react-router-dom';
import StudentNavbar from '../components/StudentNavbar';
import StudentCatalogue from './StudentCatalogue';
import StudentMyBooks from './StudentMyBooks';
import StudentRequests from './StudentRequests';
import StudentFines from './StudentFines';
import Community from './Community';

function StudentDashboardHome() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold text-primary-blue mb-6">Welcome to Your Library Portal</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Stats</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Books Currently Borrowed:</span>
              <span className="font-semibold text-primary-blue">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Requests:</span>
              <span className="font-semibold text-primary-blue">0</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Outstanding Fines:</span>
              <span className="font-semibold text-red-500">$0.00</span>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <p className="text-gray-500 text-center py-4">No recent activity</p>
        </div>
      </div>
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <div className="min-h-screen bg-bg-light">
      <StudentNavbar />
      <Routes>
        <Route index element={<StudentDashboardHome />} />
        <Route path="/catalogue" element={<StudentCatalogue />} />
        <Route path="/my-books" element={<StudentMyBooks />} />
        <Route path="/requests" element={<StudentRequests />} />
        <Route path="/fines" element={<StudentFines />} />
        <Route path="/community" element={<Community />} />
      </Routes>
    </div>
  );
}