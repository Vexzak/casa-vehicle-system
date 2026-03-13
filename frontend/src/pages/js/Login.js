import React, { useState, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../css/Auth.css';

const Streaks = () => (
  <>
    {[
      { top: '18%', width: '35%', duration: '1.8s', delay: '0s'   },
      { top: '38%', width: '50%', duration: '1.4s', delay: '0.6s' },
      { top: '58%', width: '28%', duration: '2.1s', delay: '1.1s' },
      { top: '74%', width: '42%', duration: '1.6s', delay: '0.3s' },
    ].map((s, i) => (
      <div key={i} className="auth-streak" style={{
        top: s.top, width: s.width,
        animationDuration: s.duration,
        animationDelay: s.delay,
        left: '-60%',
      }} />
    ))}
  </>
);

const Login = () => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { login } = useAuth();

  const [formData, setFormData]   = useState({ email: '', password: '' });
  const [errors, setErrors]       = useState({});
  const [serverMsg, setServerMsg] = useState({ text: '', type: '' });
  const [loading, setLoading]     = useState(false);
  const cardRef                   = useRef(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      newErrors.email = 'Enter a valid email address.';
    if (!formData.password)
      newErrors.password = 'Password is required.';
    return newErrors;
  };

  const triggerShake = () => {
    const card = cardRef.current;
    if (!card) return;
    card.classList.remove('shake');
    void card.offsetWidth;
    card.classList.add('shake');
    card.addEventListener('animationend', () => card.classList.remove('shake'), { once: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg({ text: '', type: '' });
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }

    setLoading(true);
    try {
      const user = await login(formData.email, formData.password);
      setServerMsg({ text: 'Authenticated. Redirecting…', type: 'success' });
      const from = location.state?.from || '/';
      setTimeout(() => {
        if (user.role === 'admin') navigate('/admin/dashboard');
        else navigate(from);
      }, 1000);
    } catch (err) {
      triggerShake();
      setServerMsg({
        text: err.response?.data?.message || 'Invalid email or password.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <Streaks />

      <div className="auth-card" ref={cardRef}>
        <div className="auth-card-accent" />

        <div className="auth-brand">
          <div className="auth-brand-emblem">🏎️</div>
          <span className="auth-brand-name">VELO<span>MARKET</span></span>
        </div>

        <div className="auth-badge">
          <span className="auth-badge-dot" />
          Welcome Back
        </div>

        <h1 className="auth-title">
          Sign Into<br />Your <em>Account</em>
        </h1>
        <p className="auth-subtitle">
          No account? <Link to="/register">Register free</Link>
        </p>

        {serverMsg.text && (
          <div className={`server-msg ${serverMsg.type}`}>
            {serverMsg.type === 'error' ? '✕' : '✓'} {serverMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="email">Email Address</label>
            <input
              type="email" id="email" name="email"
              value={formData.email} onChange={handleChange}
              placeholder="your@email.com" autoComplete="email"
              className={errors.email ? 'error-field' : ''}
            />
            {errors.email && <div className="field-error">⚠ {errors.email}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="password">
              Password
              <a href="/forgot-password">Forgot?</a>
            </label>
            <input
              type="password" id="password" name="password"
              value={formData.password} onChange={handleChange}
              placeholder="Your password" autoComplete="current-password"
              className={errors.password ? 'error-field' : ''}
            />
            {errors.password && <div className="field-error">⚠ {errors.password}</div>}
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Authenticating…' : 'Sign In →'}
          </button>
        </form>

        <div className="auth-divider">or</div>
        <div className="auth-footer-link">
          New here? <Link to="/register">Create an account</Link>
        </div>

      </div>
    </div>
  );
};

export default Login;