import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Navbar from "./components/Layout/Navbar";
import Footer from "./components/Layout/Footer";
import Dashboard from './pages/Dashboard';
import DailySales from './pages/DailySales';
import Historique from './pages/Historique';
import Login from './pages/Login';
import ProtectedRoute from './components/Layout/ProtectedRoute';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = localStorage.getItem('auth');
    if (auth) {
      try {
        const parsed = JSON.parse(auth);
        if (parsed && parsed.token) { // vérifier le token
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error(error);
      }
    }
  }, []); 

  return (
    <BrowserRouter>
      <div className="app">
        {isAuthenticated && <Navbar setIsAuthenticated={setIsAuthenticated} />}
        <main className="app-main">
          <Routes>
            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/journalier" element={<ProtectedRoute><DailySales /></ProtectedRoute>} />
            <Route path="/historique" element={<ProtectedRoute><Historique /></ProtectedRoute>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        {isAuthenticated && <Footer />}
      </div>
    </BrowserRouter>
  );
}

export default App;