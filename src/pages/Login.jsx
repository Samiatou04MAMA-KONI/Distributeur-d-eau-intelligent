import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import API from '../services/api'; // ← IMPORTANT
import {
  FaUser,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaWater,
} from 'react-icons/fa';
import './Login.css';

const Login = ({ setIsAuthenticated }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const auth = localStorage.getItem('auth');
  if (auth) {
    try {
      const parsed = JSON.parse(auth);
      if (parsed && parsed.token) {
        return <Navigate to="/" replace />;
      }
    } catch (error) {
      console.error(error);
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await API.post('/auth/login', { email, password });
      console.log('🔑 Réponse login:', response.data);

      if (response.data && response.data.token) {
        localStorage.setItem('auth', JSON.stringify({
          user: response.data.user,
          token: response.data.token,
        }));
        setIsAuthenticated(true); // déclenche le rendu
        navigate('/'); // redirection
      } else {
        setError('Identifiant ou mot de passe incorrect.');
      }
    } catch (err) {
      console.error('❌ Erreur de connexion:', err);
      if (err.response && err.response.status === 401) {
        setError('Identifiant ou mot de passe incorrect.');
      } else {
        setError('Erreur de connexion au serveur. Veuillez réessayer.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-brand">
          <span className="login-icon"><FaWater /></span>
          <h1 className="login-title">Ghislain Tako</h1>
          <p className="login-subtitle">Supervision du distributeur d’eau intelligent</p>
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          {error && <div className="login-error">{error}</div>}

          <div className="input-group">
            <div className="input-icon"><FaUser /></div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <div className="input-icon"><FaLock /></div>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="toggle-password"
              onClick={() => setShowPassword(!showPassword)}
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;