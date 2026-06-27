import { useState, useEffect } from 'react';
import API from '../services/api';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FaCalendar,
  FaCoins,
  FaTint,
  FaMoneyBillWave,
  FaReceipt,
  FaArrowLeft,
  FaArrowRight,
  FaSearch,
} from 'react-icons/fa';
import './DailySales.css';

const DailySales = () => {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [page, setPage] = useState(1);
  const limit = 5;

  const [allVentes, setAllVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await API.get('/transactions');
        console.log('📊 Transactions response:', response.data);

        // Vérifier que response.data est bien un tableau
        if (Array.isArray(response.data)) {
          setAllVentes(response.data);
        } else {
          console.warn('La réponse n\'est pas un tableau, initialisation à []');
          setAllVentes([]);
        }
        setError(null);
      } catch (err) {
        console.error('❌ Erreur chargement transactions:', err);
        setError('Impossible de charger les transactions.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 30000);

    // Nettoyer l'intervalle quand le composant est démonté
    return () => clearInterval(interval);
  }, []);

  // Filtrage par date (sécurité : allVentes doit être un tableau)
  const ventesFiltrees = Array.isArray(allVentes)
    ? allVentes.filter(v => v.date === selectedDate)
    : [];

  // Calcul des statistiques à partir du volume uniquement
  const totalLitres = ventesFiltrees.reduce(
    (acc, sale) => acc + (sale.volume ?? 0),
    0
  );
  const totalPieces = totalLitres;          // 1 pièce = 1 litre
  const totalVentes = totalLitres * 50;     // 1 litre = 50 FCFA
  const nbTransactions = ventesFiltrees.length;
  const moyenne = nbTransactions > 0
    ? Math.round(totalVentes / nbTransactions)
    : 0;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(nbTransactions / limit));
  const start = (page - 1) * limit;
  const currentSales = ventesFiltrees.slice(start, start + limit);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setPage(1);
  };

  const formattedDate = selectedDate
    ? format(new Date(selectedDate), 'EEEE d MMMM yyyy', { locale: fr })
    : '';

  if (loading) {
    return (
      <div className="daily-sales-container">
        <div className="daily-header">
          <h1 className="daily-title">Ventes du jour</h1>
        </div>
        <div className="loading-state">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="daily-sales-container">
        <div className="daily-header">
          <h1 className="daily-title">Ventes du jour</h1>
        </div>
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="daily-sales-container">
      {/* En-tête */}
      <div className="daily-header">
        <div>
          <h1 className="daily-title">Ventes du jour</h1>
          <p className="daily-subtitle">
            <FaCalendar className="icon-primary" />
            {formattedDate}
          </p>
        </div>
        <div className="date-picker-wrapper">
          <FaSearch className="search-icon" />
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            className="date-picker-input"
          />
        </div>
      </div>

      {/* Cartes résumé */}
      <div className="summary-grid">
        <div className="summary-card">
          <div className="summary-icon blue"><FaReceipt /></div>
          <div>
            <p className="summary-label">Transactions</p>
            <p className="summary-value">{nbTransactions}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon green"><FaCoins /></div>
          <div>
            <p className="summary-label">Pièces de 50F</p>
            <p className="summary-value">{totalPieces}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon orange"><FaTint /></div>
          <div>
            <p className="summary-label">Litres distribués</p>
            <p className="summary-value">{totalLitres} L</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon purple"><FaMoneyBillWave /></div>
          <div>
            <p className="summary-label">Montant total</p>
            <p className="summary-value">{totalVentes.toLocaleString()} FCFA</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon pink"><FaMoneyBillWave /></div>
          <div>
            <p className="summary-label">Moyenne / vente</p>
            <p className="summary-value">{moyenne.toLocaleString()} F</p>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="table-wrapper">
        <div className="table-header">
          <span className="table-title"><FaReceipt /> Détail des transactions</span>
          {nbTransactions > 0 && (
            <span className="table-count">{nbTransactions} transaction(s)</span>
          )}
        </div>
        {nbTransactions === 0 ? (
          <div className="empty-state">
            <p>Aucune vente enregistrée pour cette date.</p>
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Volume distribué</th>
                    <th>Pièces (50F)</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSales.map((sale) => {
                    const volume = sale.volume ?? 0;
                    const pieces = volume;
                    const montant = volume * 50;
                    return (
                      <tr key={sale._id || sale.id}>
                        <td>{volume} L</td>
                        <td>{pieces}</td>
                        <td className="montant-cell">{montant.toLocaleString()} F</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="pagination-footer">
                <span className="page-info">Page {page} sur {totalPages}</span>
                <div className="pagination-buttons">
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={page === 1}
                    className="pagination-btn"
                  >
                    <FaArrowLeft /> Précédent
                  </button>
                  <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={page === totalPages}
                    className="pagination-btn"
                  >
                    Suivant <FaArrowRight />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DailySales;