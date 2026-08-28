import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { profileChangePassword } from '../api/member.api';
import './ChangePassword.css';

// ─── Password rules ───────────────────────────────────────────────────────────
const PASSWORD_RULES = [
  { re: /.{8,}/,  label: 'At least 8 characters' },
  { re: /[A-Z]/,  label: 'One uppercase letter'   },
  { re: /[a-z]/,  label: 'One lowercase letter'   },
  { re: /[0-9]/,  label: 'One number'             },
];

function getStrength(pw) {
  return PASSWORD_RULES.filter((r) => r.re.test(pw)).length;
}

const STRENGTH_META = [
  { label: '',       color: 'var(--border)' },
  { label: 'Weak',   color: '#EF4444'       },
  { label: 'Fair',   color: '#F59E0B'       },
  { label: 'Good',   color: '#10B981'       },
  { label: 'Strong', color: '#22C55E'       },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ChangePassword() {
  const navigate = useNavigate();

  const [form, setForm] = useState({ oldPassword: '', newPassword: '', confirmPassword: '' });
  const [show, setShow]       = useState({ old: false, new: false, confirm: false });
  const [fieldErrors, setFieldErrors] = useState({});
  const [apiError, setApiError]       = useState('');
  const [submitting, setSubmitting]   = useState(false);
  const [success, setSuccess]         = useState(false);

  const set = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    setApiError('');
  };

  const toggle = (field) => () => setShow((prev) => ({ ...prev, [field]: !prev[field] }));

  function validate() {
    const errors = {};
    if (!form.oldPassword)           errors.oldPassword    = 'Current password is required.';
    if (!form.newPassword)           errors.newPassword    = 'New password is required.';
    else if (getStrength(form.newPassword) < 4)
                                     errors.newPassword    = 'Password does not meet all requirements.';
    if (!form.confirmPassword)       errors.confirmPassword = 'Please confirm your new password.';
    else if (form.newPassword !== form.confirmPassword)
                                     errors.confirmPassword = 'Passwords do not match.';
    if (form.oldPassword && form.newPassword && form.oldPassword === form.newPassword)
                                     errors.newPassword    = 'New password must be different from current.';
    return errors;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    setSubmitting(true);
    setApiError('');
    try {
      await profileChangePassword(form.oldPassword, form.newPassword);
      setSuccess(true);
      setTimeout(() => navigate('/profile'), 1500);
    } catch (err) {
      setApiError(err?.message || 'Failed to change password. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const strength     = getStrength(form.newPassword);
  const strengthMeta = STRENGTH_META[strength] ?? STRENGTH_META[0];

  // ── Eye icon helpers ──────────────────────────────────────────────────────
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

  // ────────────────────────────────────────────────────────────────────────────
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
          <h1 className="cp-header-title">Change Password</h1>
          <p className="cp-header-sub">Keep your account secure</p>
        </div>
      </header>

      {/* ── Form ── */}
      <div className="cp-body">
        <form className="auth-form" onSubmit={handleSubmit} noValidate>

          {/* Current password */}
          <div className="form-field">
            <label className="form-label">Current Password</label>
            <div className="input-row input-row--with-icon">
              <span className="input-icon-left" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </span>
              <input
                className={`form-input form-input--icon${fieldErrors.oldPassword ? ' form-input--error' : ''}`}
                type={show.old ? 'text' : 'password'}
                placeholder="Enter current password"
                value={form.oldPassword}
                onChange={set('oldPassword')}
                autoComplete="current-password"
                disabled={submitting}
              />
              <button type="button" className="input-eye" onClick={toggle('old')}
                aria-label={show.old ? 'Hide' : 'Show'}>
                {show.old ? <EyeOff /> : <EyeOn />}
              </button>
            </div>
            {fieldErrors.oldPassword && (
              <span className="field-error" role="alert">{fieldErrors.oldPassword}</span>
            )}
          </div>

          {/* New password */}
          <div className="form-field">
            <label className="form-label">New Password</label>
            <div className="input-row input-row--with-icon">
              <span className="input-icon-left" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </span>
              <input
                className={`form-input form-input--icon${fieldErrors.newPassword ? ' form-input--error' : ''}`}
                type={show.new ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={form.newPassword}
                onChange={set('newPassword')}
                autoComplete="new-password"
                disabled={submitting}
              />
              <button type="button" className="input-eye" onClick={toggle('new')}
                aria-label={show.new ? 'Hide' : 'Show'}>
                {show.new ? <EyeOff /> : <EyeOn />}
              </button>
            </div>

            {form.newPassword.length > 0 && (
              <div className="strength-meter">
                <div className="strength-bars">
                  {PASSWORD_RULES.map((_, i) => (
                    <div key={i} className="strength-bar"
                      style={{ background: i < strength ? strengthMeta.color : 'var(--border)' }} />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthMeta.color }}>
                  {strengthMeta.label}
                </span>
              </div>
            )}

            <ul className="password-rules">
              {PASSWORD_RULES.map((rule) => {
                const passed = rule.re.test(form.newPassword);
                return (
                  <li key={rule.label} className={`rule-item ${passed ? 'rule-pass' : 'rule-fail'}`}>
                    <span className="rule-icon">{passed ? '✓' : '✗'}</span>
                    {rule.label}
                  </li>
                );
              })}
            </ul>

            {fieldErrors.newPassword && (
              <span className="field-error" role="alert">{fieldErrors.newPassword}</span>
            )}
          </div>

          {/* Confirm new password */}
          <div className="form-field">
            <label className="form-label">Confirm New Password</label>
            <div className="input-row input-row--with-icon">
              <span className="input-icon-left" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </span>
              <input
                className={`form-input form-input--icon${fieldErrors.confirmPassword ? ' form-input--error' : ''}`}
                type={show.confirm ? 'text' : 'password'}
                placeholder="Re-enter new password"
                value={form.confirmPassword}
                onChange={set('confirmPassword')}
                autoComplete="new-password"
                disabled={submitting}
              />
              <button type="button" className="input-eye" onClick={toggle('confirm')}
                aria-label={show.confirm ? 'Hide' : 'Show'}>
                {show.confirm ? <EyeOff /> : <EyeOn />}
              </button>
            </div>
            {fieldErrors.confirmPassword && (
              <span className="field-error" role="alert">{fieldErrors.confirmPassword}</span>
            )}
          </div>

          {apiError && (
            <p className="field-error" role="alert" style={{ textAlign: 'center', marginBottom: 4 }}>
              {apiError}
            </p>
          )}

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
                Password Updated!
              </>
            ) : submitting ? 'Updating…' : 'Update Password'}
          </button>

        </form>
      </div>
    </div>
  );
}
