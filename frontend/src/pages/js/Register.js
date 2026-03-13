import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../css/Auth.css';

const STRENGTH_COLORS = ['#e8001d', '#dd6b20', '#f5c400', '#34d399'];
const STRENGTH_LABELS = ['', 'Weak', 'Fair', 'Good', 'Strong'];

function scorePassword(pw) {
  let score = 0;
  if (pw.length >= 8)          score++;
  if (/[A-Z]/.test(pw))        score++;
  if (/[0-9]/.test(pw))        score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score;
}

const Streaks = () => (
  <>
    {[
      { top: '12%', width: '40%', duration: '1.6s', delay: '0s'   },
      { top: '30%', width: '55%', duration: '1.2s', delay: '0.5s' },
      { top: '52%', width: '32%', duration: '2.0s', delay: '0.9s' },
      { top: '70%', width: '45%', duration: '1.5s', delay: '0.2s' },
      { top: '85%', width: '25%', duration: '1.9s', delay: '1.3s' },
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

const Register = () => {
  const navigate     = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData]   = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors]       = useState({});
  const [serverMsg, setServerMsg] = useState({ text: '', type: '' });
  const [loading, setLoading]     = useState(false);
  const [pwScore, setPwScore]     = useState(0);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(f => ({ ...f, [name]: value }));
    if (name === 'password') setPwScore(scorePassword(value));
    if (errors[name]) setErrors(err => ({ ...err, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim())
      newErrors.name = 'Please enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim()))
      newErrors.email = 'Enter a valid email address.';
    if (scorePassword(formData.password) < 3)
      newErrors.password = 'Min. 8 characters with a number and symbol.';
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match.';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerMsg({ text: '', type: '' });
    const fieldErrors = validate();
    if (Object.keys(fieldErrors).length > 0) { setErrors(fieldErrors); return; }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      setServerMsg({ text: 'Account created! Redirecting to login…', type: 'success' });
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setServerMsg({
        text: err.response?.data?.message || 'Registration failed. Please try again.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page scrollable">
      <Streaks />

      <div className="auth-card">
        <div className="auth-card-accent" />

        <div className="auth-brand">
          <div className="auth-brand-emblem">🏎️</div>
          <span className="auth-brand-name">VELO<span>MARKET</span></span>
        </div>

        <div className="auth-badge">
          <span className="auth-badge-dot" />
          New Account
        </div>

        <h1 className="auth-title">
          Create Your<br /><em>Account</em>
        </h1>
        <p className="auth-subtitle">Secure and private. Always.</p>

        {serverMsg.text && (
          <div className={`server-msg ${serverMsg.type}`}>
            {serverMsg.type === 'error' ? '✕' : '✓'} {serverMsg.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="name">Full Name</label>
            <input
              type="text" id="name" name="name"
              value={formData.name} onChange={handleChange}
              placeholder="Essak Santy" autoComplete="name"
              className={errors.name ? 'error-field' : ''}
            />
            {errors.name && <div className="field-error">⚠ {errors.name}</div>}
          </div>

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
            <label htmlFor="password">Password</label>
            <input
              type="password" id="password" name="password"
              value={formData.password} onChange={handleChange}
              placeholder="Min. 8 characters" autoComplete="new-password"
              className={errors.password ? 'error-field' : ''}
            />
            <div className="strength-bar">
              {[1, 2, 3, 4].map(i => (
                <span key={i} style={{
                  background: formData.password && i <= pwScore
                    ? STRENGTH_COLORS[pwScore - 1]
                    : undefined,
                }} />
              ))}
            </div>
            <div className="strength-label" style={{
              color: formData.password && pwScore > 0 ? STRENGTH_COLORS[pwScore - 1] : undefined,
            }}>
              {formData.password ? STRENGTH_LABELS[pwScore] : ''}
            </div>
            {errors.password && <div className="field-error">⚠ {errors.password}</div>}
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password" id="confirmPassword" name="confirmPassword"
              value={formData.confirmPassword} onChange={handleChange}
              placeholder="Repeat password" autoComplete="new-password"
              className={errors.confirmPassword ? 'error-field' : ''}
            />
            {errors.confirmPassword && (
              <div className="field-error">⚠ {errors.confirmPassword}</div>
            )}
          </div>

          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Creating Account…' : 'Create Account →'}
          </button>
        </form>

        <div className="auth-divider">or</div>
        <div className="auth-footer-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;