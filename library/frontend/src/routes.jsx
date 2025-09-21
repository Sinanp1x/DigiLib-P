import Catalogue from './pages/Catalogue';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Signup, Login, Dashboard, RequireAuth } from './pages';
import Students from './pages/Students';
import Navbar from './components/Navbar';
import CheckoutBook from './pages/CheckoutBook';
import Transactions from './pages/Transactions';
import History from './pages/History';
import Requests from './pages/Requests';
import StudentLogin from './pages/StudentLogin';
import RequireStudentAuth from './pages/RequireStudentAuth';
import StudentDashboard from './pages/StudentDashboard';
import StudentProfile from './pages/StudentProfile';
import Community from './pages/Community';
import AdminCommunity from './pages/AdminCommunity';
import BarcodeScanner from './pages/BarcodeScanner';
import Profile from './pages/Profile';
import AdminLayout from './components/AdminLayout'; // Import AdminLayout

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
                <Route path="/admin/signup" element={<Signup />} />
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin/*"
          element={
            <RequireAuth>
              <AdminLayout />
            </RequireAuth>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="dashboard/students" element={<Students />} />
          <Route path="dashboard/catalogue" element={<Catalogue />} />
          <Route path="dashboard/checkout" element={<CheckoutBook />} />
          <Route path="dashboard/scan" element={<BarcodeScanner />} />
          <Route path="dashboard/profile" element={<Profile />} />
          <Route path="dashboard/transactions" element={<Transactions />} />
          <Route path="dashboard/history" element={<History />} />
          <Route path="dashboard/requests" element={<Requests />} />
          <Route path="dashboard/community" element={<AdminCommunity />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>

        {/* Student Routes */}
        <Route path="/student-login" element={<StudentLogin />} />
  <Route path="/student-dashboard/*" element={<RequireStudentAuth><StudentDashboard /></RequireStudentAuth>} />
  <Route path="/student-dashboard/profile" element={<RequireStudentAuth><StudentProfile /></RequireStudentAuth>} />
        
        {/* Default Route */}
        <Route path="*" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  );
}
