import { useState, useEffect } from 'react';
import API from '../services/api';
import { format, parseISO, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, isWithinInterval } from 'date-fns';
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
import './Historique.css'; // suppose le même CSS que DailySales ou spécifique

const Historique = () => {
  // État des transactions et chargement
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filtres
  const [filterType, setFilterType] = useState('day'); // 'day', 'week', 'month', 'year'
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 10; // nombre de lignes par page

  // Récupération des données
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await API.get('/transactions');
        console.log('📊 Historique - transactions reçues:', response.data);

        if (Array.isArray(response.data)) {
          setTransactions(response.data);
        } else {
          console.warn('La réponse n\'est pas un tableau, initialisation à []');
          setTransactions([]);
        }
        setError(null);
      } catch (err) {
        console.error('❌ Erreur chargement historique:', err);
        setError('Impossible de charger l\'historique des transactions.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 30000);

    return () => clearInterval(interval);
  }, []);

  // Détermination de l'intervalle de dates selon le filtre
  const getDateInterval = () => {
    if (!selectedDate) return null;
    const baseDate = parseISO(selectedDate);

    switch (filterType) {
      case 'day':
        return { start: startOfDay(baseDate), end: endOfDay(baseDate) };
      case 'week':
        return { start: startOfWeek(baseDate, { weekStartsOn: 1 }), end: endOfWeek(baseDate, { weekStartsOn: 1 }) };
      case 'month':
        return { start: startOfMonth(baseDate), end: endOfMonth(baseDate) };
      case 'year':
        return { start: startOfYear(baseDate), end: endOfYear(baseDate) };
      default:
        return null;
    }
  };

  // Filtrage des transactions selon l'intervalle
  const filteredTransactions = (() => {
    if (!Array.isArray(transactions)) return [];
    const interval = getDateInterval();
    if (!interval) return [];

    return transactions.filter((t) => {
      // La date peut être un champ 'date' ou 'createdAt'
      const dateStr = t.date || t.createdAt;
      if (!dateStr) return false;
      try {
        const date = parseISO(dateStr);
        return isWithinInterval(date, interval);
      } catch {
        // Si la date est invalide, on ignore la transaction
        return false;
      }
    });
  })();

  // Tri : par date puis heure (si disponible)
  const sortedTransactions = [...filteredTransactions].sort((a, b) => {
    const dateA = a.date || a.createdAt || '';
    const dateB = b.date || b.createdAt || '';
    if (dateA < dateB) return -1;
    if (dateA > dateB) return 1;
    // Si même date, comparer les heures (si existent)
    const heureA = a.heure || '';
    const heureB = b.heure || '';
    return heureA.localeCompare(heureB);
  });

  // Calcul des statistiques à partir du volume
  const totalLitres = sortedTransactions.reduce(
    (acc, t) => acc + (t.volume ?? t.litres ?? 0),
    0
  );
  const totalPieces = totalLitres; // 1 litre = 1 pièce
  const totalVentes = totalLitres * 50; // 1 litre = 50 FCFA
  const nbTransactions = sortedTransactions.length;
  const moyenne = nbTransactions > 0 ? Math.round(totalVentes / nbTransactions) : 0;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(nbTransactions / limit));
  const start = (page - 1) * limit;
  const currentTransactions = sortedTransactions.slice(start, start + limit);

  // Gestion du changement de filtre
  const handleFilterChange = (type) => {
    setFilterType(type);
    setPage(1);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setPage(1);
  };

  // Formatage de l'affichage de la période
  const getPeriodLabel = () => {
    if (!selectedDate) return '';
    const baseDate = parseISO(selectedDate);
    switch (filterType) {
      case 'day':
        return format(baseDate, 'EEEE d MMMM yyyy', { locale: fr });
      case 'week': {
        const start = startOfWeek(baseDate, { weekStartsOn: 1 });
        const end = endOfWeek(baseDate, { weekStartsOn: 1 });
        return `Semaine du ${format(start, 'd MMM', { locale: fr })} au ${format(end, 'd MMM yyyy', { locale: fr })}`;
      }
      case 'month':
        return format(baseDate, 'MMMM yyyy', { locale: fr });
      case 'year':
        return format(baseDate, 'yyyy', { locale: fr });
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="historique-container">
        <div className="historique-header">
          <h1 className="historique-title">Historique des ventes</h1>
        </div>
        <div className="loading-state">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="historique-container">
        <div className="historique-header">
          <h1 className="historique-title">Historique des ventes</h1>
        </div>
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="historique-container">
      {/* En-tête */}
      <div className="historique-header">
        <div>
          <h1 className="historique-title">Historique des ventes</h1>
          <p className="historique-subtitle">
            <FaCalendar className="icon-primary" />
            {getPeriodLabel()}
          </p>
        </div>
        <div className="filter-controls">
          <div className="filter-buttons">
            <button
              className={`filter-btn ${filterType === 'day' ? 'active' : ''}`}
              onClick={() => handleFilterChange('day')}
            >
              Jour
            </button>
            <button
              className={`filter-btn ${filterType === 'week' ? 'active' : ''}`}
              onClick={() => handleFilterChange('week')}
            >
              Semaine
            </button>
            <button
              className={`filter-btn ${filterType === 'month' ? 'active' : ''}`}
              onClick={() => handleFilterChange('month')}
            >
              Mois
            </button>
            <button
              className={`filter-btn ${filterType === 'year' ? 'active' : ''}`}
              onClick={() => handleFilterChange('year')}
            >
              Année
            </button>
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
            <p>Aucune vente enregistrée pour cette période.</p>
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="historique-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Heure</th>
                    <th>Volume (L)</th>
                    <th>Pièces (50F)</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {currentTransactions.map((sale) => {
                    const volume = sale.volume ?? sale.litres ?? 0;
                    const pieces = volume;
                    const montant = volume * 50;
                    const dateStr = sale.date || sale.createdAt || '';
                    const heureStr = sale.heure || '';
                    return (
                      <tr key={sale._id || sale.id}>
                        <td>{dateStr ? format(parseISO(dateStr), 'dd/MM/yyyy') : '--'}</td>
                        <td>{heureStr || '--'}</td>
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

export default Historique;