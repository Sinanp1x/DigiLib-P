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

export default function AppRoutes() {
  return (
    <Router>
      <Routes>
        {/* Admin Routes */}
        <Route
          path="/admin/*"
          element={
            <>
              <Navbar />
              <Routes>
                <Route path="/signup" element={<Signup />} />
                <Route path="/login" element={<Login />} />
                <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
                <Route path="/dashboard/students" element={<RequireAuth><Students /></RequireAuth>} />
                <Route path="/dashboard/catalogue" element={<RequireAuth><Catalogue /></RequireAuth>} />
                <Route path="/dashboard/checkout" element={<RequireAuth><CheckoutBook /></RequireAuth>} />
                <Route path="/dashboard/scan" element={<RequireAuth><BarcodeScanner /></RequireAuth>} />
                <Route path="/dashboard/profile" element={<RequireAuth><Profile /></RequireAuth>} />
                <Route path="/dashboard/transactions" element={<RequireAuth><Transactions /></RequireAuth>} />
                <Route path="/dashboard/history" element={<RequireAuth><History /></RequireAuth>} />
                <Route path="/dashboard/requests" element={<RequireAuth><Requests /></RequireAuth>} />
                <Route path="/dashboard/community" element={<RequireAuth><AdminCommunity /></RequireAuth>} />
                <Route path="*" element={<Login />} />
              </Routes>
            </>
          }
        />

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
