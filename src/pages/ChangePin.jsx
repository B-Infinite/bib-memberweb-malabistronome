import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { changePin, resetPin } from '../api/member.api';
import './ChangePassword.css';
import './ForgotPassword.css';
import './ChangePin.css';

const PIN_RE = /^\d{6}$/;

// ── Eye icon helpers (matches ChangePassword.jsx) ──
const EyeOff = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/>
  </svg>
);
const EyeOn = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
  </svg>
);

export default function ChangePin() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [mode, setMode] = useState('change'); // 'change' | 'reset'

  // ── Change PIN flow ──
  const [pinForm, setPinForm]         = useState({ oldPin: '', newPin: '', confirmPin: '' });
  const [show, setShow]               = useState({ old: false, new: false, confirm: false });
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]         = useState(false);

  // ── Reset-via-SMS flow — no phone entry: always resets the logged-in member's own number ──
  const [resetLoading, setResetLoading]   = useState(false);
  const [resetStep, setResetStep]         = useState('confirm'); // 'confirm' | 'success'

  // ── Error dialog (in-app modal, not the native browser alert) ──
  const [errorModal, setErrorModal] = useState('');

  const setPin = (field) => (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
    setPinForm((prev) => ({ ...prev, [field]: digits }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
  };

  const toggle = (field) => () => setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  function validate() {
    const errors = {};
    if (!pinForm.oldPin)                   errors.oldPin     = 'Current PIN is required.';
    else if (!PIN_RE.test(pinForm.oldPin))  errors.oldPin     = 'PIN must be exactly 6 digits.';

    if (!pinForm.newPin)                   errors.newPin     = 'New PIN is required.';
    else if (!PIN_RE.test(pinForm.newPin)) errors.newPin     = 'PIN must be exactly 6 digits.';

    if (!pinForm.confirmPin)               errors.confirmPin = 'Please confirm your new PIN.';
    else if (pinForm.newPin !== pinForm.confirmPin)
                                            errors.confirmPin = 'PINs do not match.';

    if (pinForm.oldPin && pinForm.newPin && pinForm.oldPin === pinForm.newPin)
                                            errors.newPin     = 'New PIN must be different from current PIN.';
    return errors;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    setSubmitting(true);
    try {
      await changePin(pinForm.oldPin, pinForm.newPin);
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setErrorModal(err?.message || 'Failed to change PIN. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetConfirm = async () => {
    setResetLoading(true);
    try {
      await resetPin();
      setResetStep('success');
    } catch (err) {
      setErrorModal(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setResetLoading(false);
    }
  };

  const showTabs = !(mode === 'reset' && resetStep === 'success');

  return (
    <div className="cp-page">

      {/* ── Header ── */}
      <header className="cp-header">
        <button className="cp-back-btn" onClick={() => navigate('/profile')} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div>
          <h1 className="cp-header-title">Manage PIN</h1>
          <p className="cp-header-sub">Change or reset your 6-digit PIN</p>
        </div>
      </header>

      <div className="cp-body">

        {showTabs && (
          <div className="pin-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'change'}
              className={`pin-tab${mode === 'change' ? ' pin-tab--active' : ''}`}
              onClick={() => setMode('change')}
            >
              Change PIN
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'reset'}
              className={`pin-tab${mode === 'reset' ? ' pin-tab--active' : ''}`}
              onClick={() => setMode('reset')}
            >
              Reset via SMS
            </button>
          </div>
        )}

        {/* ════════════════════════════════
            CHANGE PIN
        ════════════════════════════════ */}
        {mode === 'change' && (
          <form className="auth-form" onSubmit={handleSubmit} noValidate>

            {/* Current PIN */}
            <div className="form-field">
              <label className="form-label">Current PIN</label>
              <div className="input-row input-row--with-icon">
                <span className="input-icon-left" aria-hidden="true"><LockIcon /></span>
                <input
                  className={`form-input form-input--icon${fieldErrors.oldPin ? ' form-input--error' : ''}`}
                  type={show.old ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="off"
                  placeholder="6-digit PIN"
                  value={pinForm.oldPin}
                  onChange={setPin('oldPin')}
                  disabled={submitting}
                />
                <button type="button" className="input-eye" onClick={toggle('old')}
                  aria-label={show.old ? 'Hide' : 'Show'}>
                  {show.old ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
              {fieldErrors.oldPin && (
                <span className="field-error" role="alert">{fieldErrors.oldPin}</span>
              )}
            </div>

            {/* New PIN */}
            <div className="form-field">
              <label className="form-label">New PIN</label>
              <div className="input-row input-row--with-icon">
                <span className="input-icon-left" aria-hidden="true"><LockIcon /></span>
                <input
                  className={`form-input form-input--icon${fieldErrors.newPin ? ' form-input--error' : ''}`}
                  type={show.new ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="off"
                  placeholder="Enter new 6-digit PIN"
                  value={pinForm.newPin}
                  onChange={setPin('newPin')}
                  disabled={submitting}
                />
                <button type="button" className="input-eye" onClick={toggle('new')}
                  aria-label={show.new ? 'Hide' : 'Show'}>
                  {show.new ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
              {fieldErrors.newPin && (
                <span className="field-error" role="alert">{fieldErrors.newPin}</span>
              )}
            </div>

            {/* Confirm new PIN */}
            <div className="form-field">
              <label className="form-label">Confirm New PIN</label>
              <div className="input-row input-row--with-icon">
                <span className="input-icon-left" aria-hidden="true"><LockIcon /></span>
                <input
                  className={`form-input form-input--icon${fieldErrors.confirmPin ? ' form-input--error' : ''}`}
                  type={show.confirm ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  autoComplete="off"
                  placeholder="Re-enter new PIN"
                  value={pinForm.confirmPin}
                  onChange={setPin('confirmPin')}
                  disabled={submitting}
                />
                <button type="button" className="input-eye" onClick={toggle('confirm')}
                  aria-label={show.confirm ? 'Hide' : 'Show'}>
                  {show.confirm ? <EyeOff /> : <EyeOn />}
                </button>
              </div>
              {fieldErrors.confirmPin && (
                <span className="field-error" role="alert">{fieldErrors.confirmPin}</span>
              )}
            </div>

            <button
              className={`btn-primary cp-submit-btn${success ? ' cp-submit-btn--done' : ''}`}
              type="submit"
              disabled={submitting || success}
              style={{ marginTop: 8 }}
            >
              {success ? (
                <>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18" style={{ marginRight: 6 }}>
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                  PIN Updated!
                </>
              ) : submitting ? 'Updating…' : 'Update PIN'}
            </button>
          </form>
        )}

        {/* ════════════════════════════════
            RESET VIA SMS — step 'confirm'
        ════════════════════════════════ */}
        {mode === 'reset' && resetStep === 'confirm' && (
          <>
            <div className="pin-phone-row">
              <div className="fp-icon-wrap pin-phone-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
                  <path d="M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1-9.4 0-17-7.6-17-17 0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1L6.6 10.8z" fill="var(--primary)" fillOpacity=".12" stroke="var(--primary)" strokeWidth="1.5"/>
                </svg>
              </div>
              <span className="pin-phone-number">+{user?.mobileNo || 'your number'}</span>
            </div>
            <h2 className="fp-section-title">Reset your PIN</h2>
            <p className="fp-section-body">
              We will send a new 6-digit PIN to this number via SMS.
            </p>

            <button className="btn-primary" onClick={handleResetConfirm} disabled={resetLoading}>
              {resetLoading ? 'Sending…' : 'Send New PIN'}
            </button>
          </>
        )}

        {/* ════════════════════════════════
            RESET VIA SMS — step 'success'
        ════════════════════════════════ */}
        {mode === 'reset' && resetStep === 'success' && (
          <div className="fp-success-body">
            <div className="fp-success-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
                <circle cx="12" cy="12" r="11" fill="var(--success)" fillOpacity=".12" stroke="var(--success)" strokeWidth="1.5"/>
                <path d="M7 12.5l3.5 3.5L17 9" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 className="fp-success-title">PIN Sent!</h2>
            <p className="fp-success-body-text">
              A new 6-digit PIN has been sent to <strong>+{user?.mobileNo}</strong> via SMS.
            </p>
            <button className="btn-primary" onClick={() => navigate('/profile')}>
              Back to Profile
            </button>
          </div>
        )}

      </div>

      {/* ── Error dialog ── */}
      {errorModal && (
        <div className="pin-alert-overlay" onClick={() => setErrorModal('')}>
          <div className="pin-alert-box" onClick={(e) => e.stopPropagation()} role="alertdialog" aria-modal="true">
            <p className="pin-alert-message">{errorModal}</p>
            <button className="btn-primary" onClick={() => setErrorModal('')}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
}
