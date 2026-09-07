import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo_mala.webp';

import './Login.css';

const PHONE_RE = /^1\d{8,9}$/;

function validate(phone, password) {
  const errors = {};
  if (!phone.trim())              errors.phone    = 'Phone number is required.';
  else if (!PHONE_RE.test(phone)) errors.phone    = 'Enter a valid Malaysian number (e.g. 12 3456 7890).';
  if (!password)                  errors.password = 'Password is required.';
  return errors;
}

export default function Login() {
  const [phone, setPhone]               = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({});

  const { login, loading, error: authError, clearError } = useAuth();
  const [apiError, setApiError] = useState('');

  const navigate = useNavigate();

  const handlePhoneChange = (e) => {
    let digits = e.target.value.replace(/\D/g, '');
    // Normalise: strip country code so the field always holds the local part only
    // 60xxxxxxxxx → 1xxxxxxxxx  (user pasted full international number)
    if (digits.startsWith('60')) digits = digits.slice(2);
    // 0xxxxxxxxx  → 1xxxxxxxxx  (user typed with leading zero)
    if (digits.startsWith('0')) digits = digits.slice(1);
    setPhone(digits);
    setFieldErrors((prev) => ({ ...prev, phone: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate(phone, password);
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    setApiError('');
    const fullPhone = '60' + phone;
    try {
      await login(fullPhone, password);
      navigate('/home', { replace: true });
    } catch (err) {
      const errMsg = err?.message || authError || 'Login failed. Please check your credentials and try again.';
      setApiError(errMsg);
    }
  };

  // Clear auth context error on unmount
  useEffect(() => () => clearError(), []); // eslint-disable-line react-hooks/exhaustive-deps

  const clearFieldError = (field) =>
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));

  return (
    <div className="login-page">

      {/* ── Hero: logo + headline ── */}
      <div className="login-hero">
        <div className="login-hero-blob login-hero-blob--accent" />
        <span className="login-hero-logo">
          <img src={logo} alt="Mala Bistronome" className="login-hero-logo-img" />
        </span>
        <h1 className="login-hero-title">Welcome Back</h1>
        <p className="login-hero-sub">
          {import.meta.env.VITE_LOGIN_TAGLINE || 'Sign in to your Mala Bistronome membership'}
        </p>
      </div>

      {/* ── Right side: floating card + signup link ── */}
      <div className="login-right">
      <div className="login-card">
        <p className="login-card-hint">Enter your phone number to continue</p>

        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Phone */}
          <div className="form-field">
            <label className="form-label">Phone Number</label>
            <div className={`phone-input-row ${fieldErrors.phone ? 'phone-input-row--error' : ''}`}>
              <span className="phone-prefix">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden="true">
                  <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                </svg>
                <span>+60</span>
              </span>
              <input
                className="phone-input"
                type="tel"
                inputMode="numeric"
                placeholder="12 3456 7890"
                value={phone}
                onChange={handlePhoneChange}
                maxLength={12}
                autoComplete="tel-national"
              />
            </div>
            {fieldErrors.phone && (
              <span className="field-error" role="alert">{fieldErrors.phone}</span>
            )}
          </div>

          {/* Password */}
          <div className="form-field">
            <label className="form-label">Password</label>
            <div className="input-row input-row--with-icon">
              <span className="input-icon-left" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </span>
              <input
                className={`form-input form-input--icon ${fieldErrors.password ? 'form-input--error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); clearFieldError('password'); setApiError(''); }}
                autoComplete="current-password"
              />
              <button
                type="button"
                className="input-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                  </svg>
                )}
              </button>
            </div>
            <div className="password-meta">
              <span className="field-hint">
                {fieldErrors.password
                  ? <span className="field-error" role="alert">{fieldErrors.password}</span>
                  : ''}
              </span>
              <Link to="/forgot-password" className="text-link">Forgot password?</Link>
            </div>
          </div>

          {apiError && (
            <p className="field-error" role="alert" style={{ textAlign: 'center', marginBottom: 4 }}>
              {apiError}
            </p>
          )}

          <button className="btn-primary" type="submit" disabled={loading}>
            {loading ? 'Signing in…' : 'Continue'}
          </button>

        </form>

        <p className="login-tos">
          By continuing, you agree to our{' '}
          <Link to="/terms" className="text-link">Terms of Service</Link>
          {' '}and{' '}
          <Link to="/privacy" className="text-link">Privacy Policy</Link>
        </p>
      </div>

      {/* ── Sign up link below card ── */}
      <p className="login-signup-link">
        Don&apos;t have an account?{' '}
        <Link to="/signup" className="login-signup-anchor">Join Mala Bistronome</Link>
      </p>

      </div>{/* end login-right */}
    </div>
  );
}
