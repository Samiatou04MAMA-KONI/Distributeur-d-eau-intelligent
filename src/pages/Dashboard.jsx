import { useState, useEffect } from 'react';
import API from '../services/api';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import {
  FaCoins,
  FaTint,
  FaChartLine,
  FaCalendarDay,
  FaArrowUp,
} from 'react-icons/fa';
import './Dashboard.css';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const Dashboard = () => {
  const [todayStats, setTodayStats] = useState({
    totalLitres: 0,
    totalVentes: 0,
    totalTransactions: 0,
  });
  const [weeklyStats, setWeeklyStats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await API.get('/dashboard');
        console.log('📊 Dashboard response:', response.data);

        const data = response.data || {};

        // Récupération des valeurs brutes (volume et nombre de transactions)
        const totalLitres = data.today?.totalLitres ?? data.today?.volume ?? 0;
        const totalTransactions = data.today?.totalTransactions ?? data.today?.transactions ?? 0;
        const totalVentes = totalLitres * 50; // 1 litre = 50 FCFA

        setTodayStats({
          totalLitres,
          totalVentes,
          totalTransactions,
        });

        // Données hebdomadaires : on s'assure que c'est un tableau
        setWeeklyStats(Array.isArray(data.weekly) ? data.weekly : []);
        setError(null);
      } catch (err) {
        console.error('❌ Erreur chargement dashboard:', err);
        setError('Impossible de charger les données du tableau de bord.');
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, []);

  // Préparation des données du graphique (évolution des ventes sur 7 jours)
  const chartData = {
    labels: weeklyStats.length > 0
      ? weeklyStats.map((item) => item.date?.slice(5) || '--')
      : ['--', '--', '--', '--', '--', '--', '--'],
    datasets: [
      {
        label: 'Ventes (FCFA)',
        data: weeklyStats.length > 0
          ? weeklyStats.map((item) => (item.volume ?? item.totalLitres ?? 0) * 50)
          : [0, 0, 0, 0, 0, 0, 0],
        backgroundColor: '#2563eb',
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#f1f5f9',
        bodyColor: '#cbd5e1',
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (context) => `${context.parsed.y.toLocaleString()} FCFA`,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: '#e2e8f0', drawBorder: false },
        ticks: {
          font: { size: 12 },
          callback: (value) => value.toLocaleString(),
        },
      },
      x: {
        grid: { display: false },
        ticks: { font: { size: 12 } },
      },
    },
  };

  const today = new Date();
  const dateStr = today.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Tableau de bord</h1>
        </div>
        <div className="loading-state">Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-header">
          <h1 className="dashboard-title">Tableau de bord</h1>
        </div>
        <div className="error-state">{error}</div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* En-tête */}
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Tableau de bord</h1>
          <p className="dashboard-subtitle">
            <FaCalendarDay className="icon-primary" />
            {dateStr}
          </p>
        </div>
      </div>

      {/* Cartes statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <FaCoins />
          </div>
          <div className="stat-content">
            <p className="stat-label">Montant total</p>
            <p className="stat-value">{todayStats.totalVentes.toLocaleString()} FCFA</p>
            <span className="stat-change positive">
              <FaArrowUp /> +12%
            </span>
          </div>
        </div>

        {/* Carte "Pièces de 50F" supprimée */}

        <div className="stat-card">
          <div className="stat-icon orange">
            <FaTint />
          </div>
          <div className="stat-content">
            <p className="stat-label">Litres distribués</p>
            <p className="stat-value">{todayStats.totalLitres} L</p>
            <span className="stat-change neutral">Stable</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <FaChartLine />
          </div>
          <div className="stat-content">
            <p className="stat-label">Transactions</p>
            <p className="stat-value">{todayStats.totalTransactions}</p>
            <span className="stat-change positive">
              <FaArrowUp /> +5%
            </span>
          </div>
        </div>
      </div>

      {/* Graphique */}
      <div className="chart-wrapper">
        <div className="chart-header">
          <h3>Évolution des ventes</h3>
          <span className="chart-badge">7 derniers jours</span>
        </div>
        <div className="chart-body">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;