// src/pages/SplashTransition.js
import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import SplashScreen from '../components/SplashScreen';
import { useAuth } from '../contexts/AuthContext';

function SplashTransition() {
  const location = useLocation();
  const navigate = useNavigate();
  const { auth, db } = useAuth();

  useEffect(() => {
    let timeout;
    const handleNavigation = async () => {
      try {
        // If login credentials are passed, perform login
        if (location.state?.pendingLogin) {
          const { email, password } = location.state.pendingLogin;
          const userCredential = await signInWithEmailAndPassword(auth, email, password);
          const user = userCredential.user;

          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            const role = userDoc.data().role;
            const targetRoute = role === 'admin' ? '/admin' : '/student';
            timeout = setTimeout(() => {
              navigate(targetRoute, { replace: true, state: {} });
            }, 1500);
          } else {
            throw new Error('User data not found');
          }
        } else {
          // Regular splash transition (e.g., from signup or manual navigation)
          timeout = setTimeout(() => {
            navigate(location.state?.to || '/', { replace: true, state: {} });
          }, 1500);
        }
      } catch (error) {
        // On login failure, redirect to login with error after splash
        console.error('Navigation error:', error);
        timeout = setTimeout(() => {
          navigate('/login', { replace: true, state: { error: 'Login failed. Please try again.' } });
        }, 1500);
      }
    };

    handleNavigation();
    return () => clearTimeout(timeout);
  }, [location, navigate, auth, db]);

  return <SplashScreen />;
}

export default SplashTransition;