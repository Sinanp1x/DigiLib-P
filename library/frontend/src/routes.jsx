import Catalogue from './pages/Catalogue';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Signup, Login, Dashboard, RequireAuth } from './pages';
import Students from './pages/Students';
import Navbar from './components/Navbar';
import CheckoutBook from './pages/CheckoutBook';
import Transactions from './pages/Transactions';
import History from './pages/History';

export default function AppRoutes() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/dashboard/students" element={<RequireAuth><Students /></RequireAuth>} />
        <Route path="/dashboard/catalogue" element={<RequireAuth><Catalogue /></RequireAuth>} />
        <Route path="/dashboard/checkout" element={<RequireAuth><CheckoutBook /></RequireAuth>} />
        <Route path="/dashboard/transactions" element={<RequireAuth><Transactions /></RequireAuth>} />
        <Route path="/dashboard/history" element={<RequireAuth><History /></RequireAuth>} />
        <Route path="*" element={<Login />} />
      </Routes>
    </Router>
  );
}
