import { useState, useEffect, useMemo } from 'react';
import API from '../services/api';
import { format, parseISO, isWithinInterval, isValid } from 'date-fns';
import { fr } from 'date-fns/locale';
import {
  FaCalendar,
  FaTint,
  FaMoneyBillWave,
  FaReceipt,
  FaArrowLeft,
  FaArrowRight,
} from 'react-icons/fa';
import './Historique.css';

const Historique = () => {
  // États des filtres
  const [filterType, setFilterType] = useState('jour');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [selectedWeek, setSelectedWeek] = useState(format(new Date(), 'yyyy-\'W\'ww'));
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [selectedYear, setSelectedYear] = useState(format(new Date(), 'yyyy'));

  // Pagination
  const [page, setPage] = useState(1);
  const limit = 6;

  // États pour les données
  const [ventes, setVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chargement des transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await API.get('/transactions');
        setVentes(response.data);
        setError(null);
      } catch (err) {
        console.error('Erreur chargement transactions:', err);
        setError('Impossible de charger les transactions.');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
    const interval = setInterval(fetchTransactions, 30000);
    return () => clearInterval(interval);
  }, []);

  // Fonctions de filtrage
  const filterByDate = (sales, dateStr) => sales.filter(s => s.date === dateStr);
  const filterByWeek = (sales, weekStr) => {
    const [year, week] = weekStr.split('-W').map(Number);
    const firstJan = new Date(year, 0, 1);
    const daysOffset = (firstJan.getDay() + 6) % 7;
    const firstMonday = new Date(firstJan);
    firstMonday.setDate(firstJan.getDate() - daysOffset + (week - 1) * 7);
    const start = new Date(firstMonday);
    const end = new Date(firstMonday);
    end.setDate(end.getDate() + 6);
    return sales.filter(s => {
      const d = parseISO(s.date);
      return isWithinInterval(d, { start, end });
    });
  };
  const filterByMonth = (sales, monthStr) => sales.filter(s => s.date.startsWith(monthStr));
  const filterByYear = (sales, yearStr) => sales.filter(s => s.date.startsWith(yearStr));

  // Filtrage principal
 const filteredSales = useMemo(() => {
  let result;
  switch (filterType) {
    case 'jour':
      result = filterByDate(ventes, selectedDate);
      break;
    case 'semaine':
      result = filterByWeek(ventes, selectedWeek);
      break;
    case 'mois':
      result = filterByMonth(ventes, selectedMonth);
      break;
    case 'annee':
      result = filterByYear(ventes, selectedYear);
      break;
    default:
      result = ventes;
  }
  result.sort((a, b) => b.date.localeCompare(a.date));
  return result;
}, [filterType, selectedDate, selectedWeek, selectedMonth, selectedYear, ventes]);

  // Statistiques : uniquement à partir du volume
  const totalVolume = filteredSales.reduce((acc, s) => acc + (s.volume || 0), 0);
  const totalVentes = totalVolume * 50;          // 1L = 50 FCFA
  const nbTransactions = filteredSales.length;
  const moyenne = nbTransactions > 0 ? Math.round(totalVentes / nbTransactions) : 0;

  // Pagination
  const totalPages = Math.max(1, Math.ceil(nbTransactions / limit));
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * limit;
  const currentSales = filteredSales.slice(startIndex, startIndex + limit);

  // Gestion des changements de filtre
  const handleFilterTypeChange = (type) => {
    setFilterType(type);
    setPage(1);
  };

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setPage(1);
  };
  const handleWeekChange = (e) => {
    setSelectedWeek(e.target.value);
    setPage(1);
  };
  const handleMonthChange = (e) => {
    setSelectedMonth(e.target.value);
    setPage(1);
  };
  const handleYearChange = (e) => {
    setSelectedYear(e.target.value);
    setPage(1);
  };

  // Pagination - génération des numéros de pages
  const getPageNumbers = () => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  };

  // Affichage du libellé du filtre
  const renderFilterLabel = () => {
    switch (filterType) {
      case 'jour':
        return format(parseISO(selectedDate), 'EEEE d MMMM yyyy', { locale: fr });
      case 'semaine':
        return `Semaine ${selectedWeek.split('-W')[1]} ${selectedWeek.split('-W')[0]}`;
      case 'mois':
        return format(parseISO(selectedMonth + '-01'), 'MMMM yyyy', { locale: fr });
      case 'annee':
        return `Année ${selectedYear}`;
      default:
        return '';
    }
  };

  if (loading) {
    return (
      <div className="history-container">
        <div className="history-header">
          <h1 className="history-title">Historique des ventes</h1>
        </div>
        <div className="loading-state">Chargement des ventes...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-container">
        <div className="history-header">
          <h1 className="history-title">Historique des ventes</h1>
        </div>
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="history-container">
      {/* En-tête */}
      <div className="history-header">
        <div>
          <h1 className="history-title">Historique des ventes</h1>
          <p className="history-subtitle">
            <FaCalendar className="icon-primary" />
            {renderFilterLabel() || 'Toutes les ventes'}
          </p>
        </div>
      </div>

      {/* Filtres */}
      <div className="filter-bar">
        <div className="filter-type-group">
          <button
            className={`filter-type-btn ${filterType === 'jour' ? 'active' : ''}`}
            onClick={() => handleFilterTypeChange('jour')}
          >
            Jour
          </button>
          <button
            className={`filter-type-btn ${filterType === 'semaine' ? 'active' : ''}`}
            onClick={() => handleFilterTypeChange('semaine')}
          >
            Semaine
          </button>
          <button
            className={`filter-type-btn ${filterType === 'mois' ? 'active' : ''}`}
            onClick={() => handleFilterTypeChange('mois')}
          >
            Mois
          </button>
          <button
            className={`filter-type-btn ${filterType === 'annee' ? 'active' : ''}`}
            onClick={() => handleFilterTypeChange('annee')}
          >
            Année
          </button>
        </div>
        <div className="filter-controls">
          {filterType === 'jour' && (
            <input
              type="date"
              value={selectedDate}
              onChange={handleDateChange}
              className="filter-input"
            />
          )}
          {filterType === 'semaine' && (
            <input
              type="week"
              value={selectedWeek}
              onChange={handleWeekChange}
              className="filter-input"
            />
          )}
          {filterType === 'mois' && (
            <input
              type="month"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="filter-input"
            />
          )}
          {filterType === 'annee' && (
            <input
              type="number"
              value={selectedYear}
              onChange={handleYearChange}
              className="filter-input year-input"
              min="2020"
              max="2030"
              step="1"
            />
          )}
        </div>
      </div>

      {/* Cartes résumé : Transactions, Volume distribué, Montant total, Moyenne */}
      <div className="summary-cards">
        <div className="summary-card">
          <div className="summary-icon blue"><FaReceipt /></div>
          <div>
            <p className="summary-label">Transactions</p>
            <p className="summary-value">{nbTransactions}</p>
          </div>
        </div>
        <div className="summary-card">
          <div className="summary-icon orange"><FaTint /></div>
          <div>
            <p className="summary-label">Volume distribué</p>
            <p className="summary-value">{totalVolume} L</p>
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
          <span className="table-title">
            <FaReceipt /> Détail des transactions
          </span>
          {nbTransactions > 0 && (
            <span className="table-count">{nbTransactions} transaction(s)</span>
          )}
        </div>
        {nbTransactions === 0 ? (
          <div className="empty-state">
            <p>Aucune vente trouvée pour cette période.</p>
          </div>
        ) : (
          <>
            <div className="table-scroll">
              <table className="sales-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Volume (L)</th>
                    <th>Montant</th>
                  </tr>
                </thead>
                <tbody>
                  {currentSales.map((sale) => {
                    const volume = sale.volume || 0;
                    const montant = volume * 50;
                    return (
                      <tr key={sale._id}>
                        {(() => {
                          const d = parseISO(sale.date);
                          if (!isValid(d)) {
                            return "Date invalide";
                          }
                          return format(d, "dd/MM/yyyy");
                        })()}
                        <td>{volume} L</td>
                        <td className="montant-cell">{montant.toLocaleString()} F</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination-footer">
                <span className="page-info">
                  Page {currentPage} sur {totalPages} ({nbTransactions} résultats)
                </span>
                <div className="pagination-buttons">
                  <button
                    onClick={() => setPage(1)}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    <FaArrowLeft /> Premier
                  </button>
                  <button
                    onClick={() => setPage(p => Math.max(p - 1, 1))}
                    disabled={currentPage === 1}
                    className="pagination-btn"
                  >
                    <FaArrowLeft /> Précédent
                  </button>
                  {getPageNumbers().map(num => (
                    <button
                      key={num}
                      onClick={() => setPage(num)}
                      className={`pagination-btn page-number ${num === currentPage ? 'active' : ''}`}
                    >
                      {num}
                    </button>
                  ))}
                  <button
                    onClick={() => setPage(p => Math.min(p + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Suivant <FaArrowRight />
                  </button>
                  <button
                    onClick={() => setPage(totalPages)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn"
                  >
                    Dernier <FaArrowRight />
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