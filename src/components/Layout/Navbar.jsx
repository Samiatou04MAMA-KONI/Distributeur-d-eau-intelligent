// Navbar.jsx – Version avec menu hamburger responsive
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaWater,
  FaChartBar,
  FaCalendarDay,
  FaFolderOpen,
  FaSignOutAlt,
  FaUser,
  FaBars,
  FaTimes,
} from 'react-icons/fa';
import LogoutModal from '../../pages/LogoutModal';
import './Navbar.css';

const Navbar = ({ setIsAuthenticated }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Référence pour le menu mobile (afin de détecter les clics à l'extérieur)
  const mobileMenuRef = useRef(null);
  const toggleButtonRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  let userName = 'Admin';
  try {
    const auth = localStorage.getItem('auth');
    if (auth) {
      const parsed = JSON.parse(auth);
      if (parsed?.user) userName = parsed.user;
    }
  } catch (error) {
    console.error(error);
  }

  const handleLogout = () => {
    localStorage.removeItem('auth');
    setIsAuthenticated(false);
    navigate('/login');
  };

  const openLogoutModal = () => setIsLogoutModalOpen(true);
  const closeLogoutModal = () => setIsLogoutModalOpen(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen((prev) => !prev);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Fermer le menu lorsqu'on clique à l'extérieur du menu (sauf sur le bouton toggle)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target) &&
        toggleButtonRef.current &&
        !toggleButtonRef.current.contains(event.target)
      ) {
        closeMobileMenu();
      }
    };

    if (isMobileMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMobileMenuOpen]);

  // Désactiver le défilement du body lorsque le menu est ouvert (mobile)
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/" className="navbar-brand" onClick={closeMobileMenu}>
            <span className="brand-icon"><FaWater /></span>
            <span className="brand-text">Ghislain TAKO</span>
          </Link>

          {/* Menu desktop (affiché uniquement sur grand écran) */}
          <ul className="navbar-menu desktop-menu">
            <li className="navbar-item">
              <Link to="/" className={`navbar-link ${isActive('/') ? 'active' : ''}`}>
                <span className="link-icon"><FaChartBar /></span>
                Dashboard
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/journalier" className={`navbar-link ${isActive('/journalier') ? 'active' : ''}`}>
                <span className="link-icon"><FaCalendarDay /></span>
                Ventes par Jour
              </Link>
            </li>
            <li className="navbar-item">
              <Link to="/historique" className={`navbar-link ${isActive('/historique') ? 'active' : ''}`}>
                <span className="link-icon"><FaFolderOpen /></span>
                Historique
              </Link>
            </li>
          </ul>

          <div className="navbar-user desktop-user">
            <span className="user-avatar"><FaUser /></span>
            <span className="user-name">{userName}</span>
            <button
              className="logout-btn"
              onClick={openLogoutModal}
              title="Déconnexion"
            >
              <FaSignOutAlt />
            </button>
          </div>

          {/* Bouton hamburger (visible uniquement sur tablette/mobile) */}
          <button
            ref={toggleButtonRef}
            className="navbar-toggle"
            onClick={toggleMobileMenu}
            aria-label={isMobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Menu mobile (affiché en overlay latéral ou plein écran selon la taille) */}
        <div
          ref={mobileMenuRef}
          className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}
          aria-hidden={!isMobileMenuOpen}
        >
          <div className="mobile-menu-header">
            <span className="mobile-brand"><FaWater /> Ghislain TAKO</span>
            <button
              className="mobile-close-btn"
              onClick={closeMobileMenu}
              aria-label="Fermer le menu"
            >
              <FaTimes />
            </button>
          </div>

          <ul className="mobile-menu-list">
            <li className="mobile-menu-item">
              <Link
                to="/"
                className={`mobile-link ${isActive('/') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="link-icon"><FaChartBar /></span>
                Dashboard
              </Link>
            </li>
            <li className="mobile-menu-item">
              <Link
                to="/journalier"
                className={`mobile-link ${isActive('/journalier') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="link-icon"><FaCalendarDay /></span>
                Ventes par Jour
              </Link>
            </li>
            <li className="mobile-menu-item">
              <Link
                to="/historique"
                className={`mobile-link ${isActive('/historique') ? 'active' : ''}`}
                onClick={closeMobileMenu}
              >
                <span className="link-icon"><FaFolderOpen /></span>
                Historique
              </Link>
            </li>
          </ul>

          <div className="mobile-user-section">
            <div className="mobile-user-info">
              <span className="mobile-user-avatar"><FaUser /></span>
              <span className="mobile-user-name">{userName}</span>
            </div>
            <button
              className="mobile-logout-btn"
              onClick={() => {
                closeMobileMenu();
                openLogoutModal();
              }}
            >
              <FaSignOutAlt /> Déconnexion
            </button>
          </div>
        </div>

        {/* Overlay (fond sombre) lorsque le menu mobile est ouvert */}
        {isMobileMenuOpen && (
          <div className="mobile-overlay" onClick={closeMobileMenu} />
        )}
      </nav>

      <LogoutModal
        isOpen={isLogoutModalOpen}
        onClose={closeLogoutModal}
        onConfirm={() => {
          closeLogoutModal();
          handleLogout();
        }}
      />
    </>
  );
};

export default Navbar;