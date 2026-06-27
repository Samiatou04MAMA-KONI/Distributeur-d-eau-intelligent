
import { FaExclamationTriangle, FaTimes } from 'react-icons/fa';
import './LogoutModal.css';

const LogoutModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  // Empêcher la propagation du clic à l'arrière-plan
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      <div className="modal-container">
        <button className="modal-close" onClick={onClose} aria-label="Fermer">
          <FaTimes />
        </button>

        <div className="modal-icon">
          <FaExclamationTriangle />
        </div>

        <h2 className="modal-title">Déconnexion</h2>
        <p className="modal-message">Êtes-vous sûr de vouloir vous déconnecter ?</p>

        <div className="modal-actions">
          <button className="modal-btn cancel" onClick={onClose}>
            Annuler
          </button>
          <button className="modal-btn confirm" onClick={onConfirm}>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;