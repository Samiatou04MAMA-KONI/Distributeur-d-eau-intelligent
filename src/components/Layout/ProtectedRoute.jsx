import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const auth = localStorage.getItem('auth');
  console.log('🔒 auth dans localStorage :', auth);

  let isAuthenticated = false;

  if (auth) {
    try {
      const parsed = JSON.parse(auth);
      console.log('🔒 parsed auth :', parsed);
      if (parsed && parsed.token) {
        isAuthenticated = true;
      }
    } catch (e) {
      console.error('Erreur parsing auth:', e);
    }
  }

  console.log('🔒 isAuthenticated final :', isAuthenticated);

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;