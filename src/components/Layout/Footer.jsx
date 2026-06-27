// Footer.jsx - Version minimaliste avec liens vers les pages principales

import { Link } from 'react-router-dom';
import { FaWater } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Ligne supérieure : marque + description + liens */}
        <div className="footer-top">
          <div className="footer-brand">
            <span className="brand-icon">
              <FaWater />
            </span>
            <span className="brand-name">Ghislain TAKO</span>
          </div>
          <p className="brand-description">
            Supervision intelligente pour le distributeur d'eau connecté.
            Suivez vos ventes, analyses et performances en temps réel.
          </p>
          <nav className="footer-nav">
            <Link to="/" className="nav-link">Dashboard</Link>
            <span className="nav-separator">•</span>
            <Link to="/journalier" className="nav-link">Ventes par jour</Link>
            <span className="nav-separator">•</span>
            <Link to="/historique" className="nav-link">Historique</Link>
          </nav>
        </div>

        {/* Ligne inférieure : copyright */}
        <div className="footer-bottom">
          <span className="copyright">
            &copy; {currentYear} <span className="brand-highlight">Ghislain TAKO</span>
            — Tous droits réservés.
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;