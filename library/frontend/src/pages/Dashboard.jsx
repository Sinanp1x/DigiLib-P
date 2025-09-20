import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const cards = [
  { title: 'Manage Students', path: '/dashboard/students' },
  { title: 'Manage Catalogue', path: '/dashboard/catalogue' },
  { title: 'Check Out Book', path: '/dashboard/checkout' },
  { title: 'Active Transactions', path: '/dashboard/transactions' },
  { title: 'Book Requests', path: '/dashboard/requests' },
  { title: 'Transaction History', path: '/dashboard/history' },
  { title: 'Community Reviews', path: '/dashboard/community' },
  { title: 'Logout', path: '/login' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleCardClick = (card) => {
    if (card.title === 'Logout') {
      logout();
      navigate('/login');
    } else {
      navigate(card.path);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light py-16">
      <h2 className="text-4xl font-extrabold mb-10 text-center text-primary-blue drop-shadow">Admin Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center px-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl shadow-xl p-10 flex items-center justify-center cursor-pointer hover:bg-bg-light hover:scale-105 transition-transform duration-200 border border-border-light"
            onClick={() => handleCardClick(card)}
          >
            <span className="text-xl font-bold text-primary-blue tracking-wide">{card.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
