import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Make sure your Login and Signup components are in a 'pages' folder
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/AdminDashboard';
import Catalogue from './pages/Catalogue';
import AdminUsers from './pages/AdminUsers';
import AdminReviews from './pages/AdminReviews';
import CheckInOut from './pages/CheckInOut';
import CheckInOutHistory from './pages/CheckInOutHistory';
import Profile from './pages/Profile';

// These are placeholder components. You will build these out later.
const StudentDashboard = () => <div className="p-8"><h1>Student Dashboard</h1><p>Welcome, Student!</p></div>;

// This is a helper component to protect routes that require a user to be logged in.
const ProtectedRoute = ({ children, role }) => {
  const user = JSON.parse(localStorage.getItem('user'));
  const token = localStorage.getItem('authToken');

  if (!token || !user) {
    // If no token/user, redirect to login
    return <Navigate to="/login" />;
  }

  // If a role is required and the user's role doesn't match, redirect them.
  if (role && user.role !== role) {
    // For simplicity, we redirect to login. You could show an "Access Denied" page.
    return <Navigate to="/login" />;
  }

  return children;
};


function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Protected Admin Route */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute role="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reviews"
          element={<ProtectedRoute role="admin"><AdminReviews /></ProtectedRoute>}
        />
        <Route
          path="/admin/users"
          element={<ProtectedRoute role="admin"><AdminUsers /></ProtectedRoute>}
        />
        <Route
          path="/admin/check-in-out"
          element={<ProtectedRoute role="admin"><CheckInOut /></ProtectedRoute>}
        />
        <Route
          path="/admin/catalogue"
          element={<ProtectedRoute role="admin"><Catalogue /></ProtectedRoute>}
        />
        <Route
          path="/admin/history"
          element={<ProtectedRoute role="admin"><CheckInOutHistory /></ProtectedRoute>}
        />
        
        {/* Protected Student Route */}
        <Route
          path="/student-dashboard"
          element={
            <ProtectedRoute role="student">
              <StudentDashboard />
            </ProtectedRoute>
          }
        />

        {/* Generic Profile Route for both roles */}
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />

        {/* Default route redirects to signup */}
        <Route path="*" element={<Navigate to="/signup" />} />
      </Routes>
    </Router>
  );
}

export default App;
