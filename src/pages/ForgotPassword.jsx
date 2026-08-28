import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { profileForgotPassword } from '../api/auth.api';
import './ForgotPassword.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const PHONE_RE = /^1\d{8,9}$/;

// ─── Shared header ────────────────────────────────────────────────────────────
function FPHeader({ onBack, title, subtitle }) {
  return (
    <div className="fp-header">
      <button className="back-btn" onClick={onBack} aria-label="Back">
        <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
          <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
        </svg>
      </button>
      <div>
        <h1 className="fp-title">{title}</h1>
        <p className="fp-subtitle">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function ForgotPassword() {
  // step: 'phone' | 'success'
  const [step, setStep]         = useState('phone');
  const [phone, setPhone]       = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [apiError, setApiError] = useState('');
  const [loading, setLoading]   = useState(false);

  const navigate = useNavigate();

  // ── Step 1: request password reset ──
  const handlePhoneSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim())         { setPhoneError('Phone number is required.'); return; }
    if (!PHONE_RE.test(phone)) { setPhoneError('Enter a valid Malaysian number (e.g. 12 3456 7890).'); return; }

    setApiError('');
    setLoading(true);
    const fullPhone = '60' + phone;

    try {
      await profileForgotPassword(fullPhone);
      setStep('success');
    } catch (err) {
      const msg = err?.message || 'Something went wrong. Please try again.';
      setApiError(msg);
    } finally {
      setLoading(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 1 — Phone number
  // ────────────────────────────────────────────────────────────────────────────
  if (step === 'phone') {
    return (
      <div className="fp-page">
        <FPHeader
          onBack={() => navigate('/login')}
          title="Forgot Password"
          subtitle="We'll send a new password to your number"
        />
        <div className="fp-body">
          <div className="fp-icon-wrap" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
              <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="var(--primary)" fillOpacity=".12" stroke="var(--primary)" strokeWidth="1.5"/>
            </svg>
          </div>
          <h2 className="fp-section-title">Enter your phone number</h2>
          <p className="fp-section-body">
            Enter the phone number linked to your Mala Bistronome account. We'll send a new password to it via SMS.
          </p>

          <form className="auth-form" onSubmit={handlePhoneSubmit} noValidate>
            <div className="form-field">
              <label className="form-label">Phone Number</label>
              <div className={`phone-input-row ${phoneError ? 'phone-input-row--error' : ''}`}>
                <span className="phone-prefix">🇲🇾 +60</span>
                <input
                  className="phone-input"
                  type="tel"
                  inputMode="numeric"
                  placeholder="12 3456 7890"
                  value={phone}
                  onChange={(e) => {
                    let digits = e.target.value.replace(/\D/g, '');
                    if (digits.startsWith('60')) digits = digits.slice(2);
                    if (digits.startsWith('0'))  digits = digits.slice(1);
                    setPhone(digits);
                    setPhoneError('');
                    setApiError('');
                  }}
                  maxLength={12}
                  autoFocus
                  disabled={loading}
                />
              </div>
              {phoneError && <span className="field-error" role="alert">{phoneError}</span>}
            </div>

            {apiError && (
              <p className="field-error" role="alert" style={{ textAlign: 'center', marginBottom: 4 }}>
                {apiError}
              </p>
            )}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Sending…' : 'Send New Password'}
            </button>
          </form>

          <p className="auth-switch">
            Remember your password?{' '}
            <Link to="/login" className="text-link text-link--bold">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // STEP 2 — Success
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="fp-page">
      <div className="fp-header fp-header--plain" />
      <div className="fp-body fp-success-body">
        <div className="fp-success-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
            <circle cx="12" cy="12" r="11" fill="var(--success)" fillOpacity=".12" stroke="var(--success)" strokeWidth="1.5"/>
            <path d="M7 12.5l3.5 3.5L17 9" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="fp-success-title">Password Sent!</h2>
        <p className="fp-success-body-text">
          A new password has been sent to <strong>+60{phone}</strong> via SMS. Use it to sign in, then change your password from your profile.
        </p>
        <button className="btn-primary" onClick={() => navigate('/login')}>
          Back to Sign In
        </button>
      </div>
    </div>
  );
}
