import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import {
  FaCar, FaUsers, FaShoppingCart, FaBell, FaChartLine, FaTachometerAlt,
  FaFireAlt, FaArrowUp, FaArrowDown, FaCircle, FaCheckCircle,
  FaClock, FaExclamationTriangle, FaEye, FaRedo,
} from 'react-icons/fa';
import '../css/AdminDashboard.css';

/* ── tiny helpers ── */
const fmt = (n) => Number(n || 0).toLocaleString();
const timeAgo = (dateStr) => {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  useEffect(() => { fetchStats(); }, []);

  const fetchStats = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const response = await api.get('/admin/dashboard');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const statCards = [
    {
      key: 'vehicles',
      label: 'Total Vehicles',
      value: stats?.totalVehicles,
      icon: <FaCar />,
      accent: '#e8001d',
      trend: +12,
      sub: 'In inventory',
    },
    {
      key: 'users',
      label: 'Registered Users',
      value: stats?.totalUsers,
      icon: <FaUsers />,
      accent: '#3b82f6',
      trend: +8,
      sub: 'Active accounts',
    },
    {
      key: 'orders',
      label: 'Reservations',
      value: stats?.totalOrders,
      icon: <FaShoppingCart />,
      accent: '#f5c400',
      trend: +23,
      sub: 'This month',
    },
    {
      key: 'notifications',
      label: 'Notifications',
      value: stats?.unreadNotifications,
      icon: <FaBell />,
      accent: '#10b981',
      trend: -5,
      sub: 'Unread alerts',
    },
  ];

  const activityIcon = (action = '') => {
    const a = action.toLowerCase();
    if (a.includes('reserv') || a.includes('order')) return { icon: <FaShoppingCart />, color: '#f5c400' };
    if (a.includes('user') || a.includes('register')) return { icon: <FaUsers />, color: '#3b82f6' };
    if (a.includes('vehicle') || a.includes('car') || a.includes('add')) return { icon: <FaCar />, color: '#e8001d' };
    if (a.includes('cancel') || a.includes('delete')) return { icon: <FaExclamationTriangle />, color: '#ef4444' };
    if (a.includes('complet') || a.includes('approv')) return { icon: <FaCheckCircle />, color: '#10b981' };
    return { icon: <FaCircle />, color: 'rgba(255,255,255,0.3)' };
  };

  const filtered = !stats?.recentActivity ? [] :
    activeFilter === 'all' ? stats.recentActivity :
    stats.recentActivity.filter(a => {
      const t = (a.action || '').toLowerCase();
      if (activeFilter === 'reservations') return t.includes('reserv') || t.includes('order');
      if (activeFilter === 'users') return t.includes('user') || t.includes('register');
      if (activeFilter === 'vehicles') return t.includes('vehicle') || t.includes('car');
      return true;
    });

  if (loading) return (
    <div className="ad-loader-wrap">
      <div className="ad-loader-inner">
        <div className="ad-spinner" />
        <span className="ad-loader-text">Loading Dashboard</span>
      </div>
    </div>
  );

  return (
    <div className="ad-root">
      {/* ── Header ── */}
      <div className="ad-header">
        <div className="ad-header-left">
          <div className="ad-header-eyebrow">
            <span className="ad-eyebrow-dot" />
            Admin Control Center
          </div>
          <h1 className="ad-title">
            Dashboard
            <span className="ad-title-accent"> Overview</span>
          </h1>
          <p className="ad-subtitle">Real-time metrics and activity feed</p>
        </div>
        <div className="ad-header-right">
          <div className="ad-live-badge">
            <span className="ad-live-dot" />
            Live
          </div>
          <button
            className={`ad-refresh-btn ${refreshing ? 'spinning' : ''}`}
            onClick={() => fetchStats(true)}
            title="Refresh data"
          >
            <FaRedo />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="ad-stats-grid">
        {statCards.map((card, i) => (
          <div className="ad-stat-card" key={card.key} style={{ '--accent': card.accent, '--delay': `${i * 0.08}s` }}>
            <div className="ad-stat-top">
              <div className="ad-stat-icon-wrap">
                <div className="ad-stat-icon">{card.icon}</div>
                <div className="ad-stat-icon-glow" />
              </div>
              <div className={`ad-trend ${card.trend > 0 ? 'up' : 'down'}`}>
                {card.trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
                {Math.abs(card.trend)}%
              </div>
            </div>
            <div className="ad-stat-value">{fmt(card.value)}</div>
            <div className="ad-stat-label">{card.label}</div>
            <div className="ad-stat-sub">{card.sub}</div>
            <div className="ad-stat-bar">
              <div className="ad-stat-bar-fill" style={{ width: `${Math.min(100, (card.value || 0) % 100 + 20)}%` }} />
            </div>
            <div className="ad-stat-corner-accent" />
          </div>
        ))}
      </div>

      {/* ── Bottom Grid: Activity + Quick Stats ── */}
      <div className="ad-bottom-grid">

        {/* Activity Feed */}
        <div className="ad-panel ad-activity-panel">
          <div className="ad-panel-header">
            <div className="ad-panel-title">
              <FaFireAlt className="ad-panel-icon" />
              Recent Activity
              {filtered.length > 0 && (
                <span className="ad-count-badge">{filtered.length}</span>
              )}
            </div>
            <div className="ad-filters">
              {['all', 'reservations', 'users', 'vehicles'].map(f => (
                <button
                  key={f}
                  className={`ad-filter-btn ${activeFilter === f ? 'active' : ''}`}
                  onClick={() => setActiveFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="ad-activity-list">
            {filtered.length > 0 ? filtered.map((activity, i) => {
              const { icon, color } = activityIcon(activity.action);
              return (
                <div className="ad-activity-item" key={activity.id} style={{ '--i': i }}>
                  <div className="ad-activity-icon-wrap" style={{ '--acolor': color }}>
                    {icon}
                  </div>
                  <div className="ad-activity-body">
                    <p className="ad-activity-action">{activity.action}</p>
                    <span className="ad-activity-user">
                      <FaUsers style={{ fontSize: 9 }} />
                      {activity.user_name || 'System'}
                    </span>
                  </div>
                  <div className="ad-activity-time">
                    <FaClock style={{ fontSize: 9 }} />
                    {timeAgo(activity.created_at)}
                  </div>
                </div>
              );
            }) : (
              <div className="ad-empty">
                <FaEye className="ad-empty-icon" />
                <p>No activity to display</p>
                <span>Activity will appear here as actions are performed</span>
              </div>
            )}
          </div>
        </div>

        {/* Right column: quick stats */}
        <div className="ad-right-col">

          {/* Performance meter */}
          <div className="ad-panel ad-perf-panel">
            <div className="ad-panel-header">
              <div className="ad-panel-title">
                <FaTachometerAlt className="ad-panel-icon" />
                Performance
              </div>
            </div>
            <div className="ad-gauge-wrap">
              <svg viewBox="0 0 120 70" className="ad-gauge-svg">
                <path d="M10,65 A55,55 0 0,1 110,65" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="10" strokeLinecap="round" />
                <path d="M10,65 A55,55 0 0,1 110,65" fill="none" stroke="url(#gaugeGrad)" strokeWidth="10" strokeLinecap="round"
                  strokeDasharray="173" strokeDashoffset="52" className="ad-gauge-fill" />
                <defs>
                  <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#e8001d" />
                    <stop offset="100%" stopColor="#f5c400" />
                  </linearGradient>
                </defs>
                <text x="60" y="60" textAnchor="middle" fill="#fff" fontSize="16" fontFamily="'Bebas Neue',sans-serif" letterSpacing="1">87%</text>
              </svg>
              <div className="ad-gauge-label">System Health</div>
            </div>
            <div className="ad-perf-metrics">
              {[
                { label: 'Uptime', val: '99.9%', color: '#10b981' },
                { label: 'Response', val: '120ms', color: '#3b82f6' },
                { label: 'Load', val: '23%', color: '#f5c400' },
              ].map(m => (
                <div className="ad-perf-metric" key={m.label}>
                  <span className="ad-perf-dot" style={{ background: m.color }} />
                  <span className="ad-perf-metric-label">{m.label}</span>
                  <span className="ad-perf-metric-val" style={{ color: m.color }}>{m.val}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick summary */}
          <div className="ad-panel ad-summary-panel">
            <div className="ad-panel-header">
              <div className="ad-panel-title">
                <FaChartLine className="ad-panel-icon" />
                Quick Summary
              </div>
            </div>
            <div className="ad-summary-list">
              {[
                { label: 'Available Vehicles', val: stats?.availableVehicles ?? '—', accent: '#e8001d' },
                { label: 'Active Reservations', val: stats?.activeReservations ?? '—', accent: '#f5c400' },
                { label: 'New Users Today', val: stats?.newUsersToday ?? '—', accent: '#3b82f6' },
                { label: 'Revenue This Month', val: stats?.monthlyRevenue ? `₱${fmt(stats.monthlyRevenue)}` : '—', accent: '#10b981' },
              ].map(s => (
                <div className="ad-summary-row" key={s.label} style={{ '--rowaccent': s.accent }}>
                  <span className="ad-summary-label">{s.label}</span>
                  <span className="ad-summary-val">{s.val}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;