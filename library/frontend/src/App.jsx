
import { AuthProvider } from './AuthContext';
import { StudentAuthProvider } from './StudentAuthContext';
import AppRoutes from './routes';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <StudentAuthProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </StudentAuthProvider>
    </AuthProvider>
  );
}

export default App
