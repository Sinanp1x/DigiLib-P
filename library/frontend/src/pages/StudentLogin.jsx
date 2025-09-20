import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStudentAuth } from '../StudentAuthContext';
import { toast } from 'react-hot-toast';

export default function StudentLogin() {
  const [credentials, setCredentials] = useState({ studentId: '', password: '' });
  const { login } = useStudentAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(credentials.studentId, credentials.password);
      toast.success('Login successful!');
      navigate('/student-dashboard');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-bg-light flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-2xl border border-border-light">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-primary-blue">
            Student Portal Login
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your student ID and password to access your library account
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="studentId" className="sr-only">
                Student ID
              </label>
              <input
                id="studentId"
                name="studentId"
                type="text"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-border-light placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-blue focus:border-primary-blue focus:z-10 sm:text-sm"
                placeholder="Student ID (e.g., STU-JOH-4682)"
                value={credentials.studentId}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-border-light placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary-blue focus:border-primary-blue focus:z-10 sm:text-sm"
                placeholder="Password"
                value={credentials.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-blue hover:bg-secondary-blue focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-blue"
            >
              Sign in
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}