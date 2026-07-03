import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const auth = localStorage.getItem('auth');

  let isAuthenticated = false;

  if (auth) {
    try {
      const parsed = JSON.parse(auth);
      if (parsed && parsed.token) {
        isAuthenticated = true;
      }
    } catch (e) {
      console.error('Erreur parsing auth:', e);
    }
  }

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;