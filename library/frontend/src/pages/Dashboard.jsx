import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const cards = [
  { title: 'Manage Students', path: '/dashboard/students' },
  { title: 'Manage Catalogue', path: '/dashboard/catalogue' },
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
    <div className="mt-16">
      <h2 className="text-4xl font-extrabold mb-10 text-center text-blue-700 drop-shadow">Admin Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-center px-4">
        {cards.map((card) => (
          <div
            key={card.title}
            className="bg-white rounded-2xl shadow-xl p-10 flex items-center justify-center cursor-pointer hover:bg-blue-100 hover:scale-105 transition-transform duration-200 border border-blue-100"
            onClick={() => handleCardClick(card)}
          >
            <span className="text-xl font-bold text-blue-700 tracking-wide">{card.title}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
