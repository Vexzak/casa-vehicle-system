import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaBell, FaUser, FaTachometerAlt, FaCar,
  FaEnvelope, FaClipboardList, FaSignOutAlt, FaHome, FaChevronDown, FaHeart, FaCalendarAlt,
} from 'react-icons/fa';
import api from '../utils/api';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on route change
  useEffect(() => { setUserMenuOpen(false); }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const NavLink = ({ to, icon, children }) => (
    <Link to={to} className={`nb-link ${isActive(to) ? 'nb-link-active' : ''}`}>
      {icon && <span className="nb-link-icon">{icon}</span>}
      {children}
      {isActive(to) && <span className="nb-link-active-bar" />}
    </Link>
  );

  return (
    <nav className={`nb-root ${scrolled ? 'nb-scrolled' : ''}`}>
      {/* Top speed-line accent */}
      <div className="nb-top-bar" />

      <div className="nb-inner">
        {/* ── Brand ── */}
        <Link to="/" className="nb-brand">
          <div className="nb-emblem">🏎️</div>
          <div className="nb-brand-text">
            ESSAK<span className="nb-brand-accent">MARKET</span>
          </div>
        </Link>

        {/* ── Nav links ── */}
        <div className="nb-links">
          <NavLink to="/" icon={<FaHome />}>Home</NavLink>

          {user ? (
            isAdmin() ? (
              <>
                <NavLink to="/admin/dashboard" icon={<FaTachometerAlt />}>Dashboard</NavLink>
                <NavLink to="/admin/vehicles" icon={<FaCar />}>Vehicles</NavLink>
                <NavLink to="/admin/messages" icon={<FaEnvelope />}>Messages</NavLink>
                
              </>
            ) : (
              <>
                <NavLink to="/reservations" icon={<FaCalendarAlt />}>Reservations</NavLink>
                <NavLink to="/user/wishlist" icon={<FaHeart />}>Wishlist</NavLink>
                <NavLink to="/user/messages" icon={<FaEnvelope />}>Messages</NavLink>
              </>
            )
          ) : null}
        </div>

        {/* ── Right side ── */}
        <div className="nb-right">
          {user ? (
            <div className="nb-user-wrap">
              <button
                className={`nb-user-btn ${userMenuOpen ? 'open' : ''}`}
                onClick={() => setUserMenuOpen(v => !v)}
              >
                <div className="nb-user-avatar">
                  <FaUser />
                </div>
                <span className="nb-user-name">{user.name}</span>
                <FaChevronDown className={`nb-chevron ${userMenuOpen ? 'rotated' : ''}`} />
              </button>

              {userMenuOpen && (
                <div className="nb-dropdown">
                  <div className="nb-dropdown-header">
                    <div className="nb-dropdown-name">{user.name}</div>
                    <div className="nb-dropdown-role">
                      {isAdmin() ? 'Administrator' : 'Customer'}
                    </div>
                  </div>
                  <div className="nb-dropdown-divider" />
                  <button className="nb-dropdown-item nb-logout" onClick={handleLogout}>
                    <FaSignOutAlt />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="nb-auth">
              <Link to="/login" className="nb-btn-login">Log In</Link>
              <Link to="/register" className="nb-btn-register">Register</Link>
            </div>
          )}
        </div>
      </div>

      {/* Bottom red glow drip */}
      <div className="nb-bottom-glow" />
    </nav>
  );
};

export default Navbar;