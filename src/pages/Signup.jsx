import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { sendRegOTP, regOTPConfirmation } from '../api/auth.api';
import OtpInput from '../components/OtpInput';
import './Signup.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const PHONE_RE  = /^1\d{8,9}$/;
const EMAIL_RE  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECS = 30;

// ─── DOB helpers ─────────────────────────────────────────────────────────────
const CURRENT_YEAR = new Date().getFullYear();

// Day labels 1–31
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);

// Month labels
const MONTHS = [
  { v: '1',  label: 'January'   },
  { v: '2',  label: 'February'  },
  { v: '3',  label: 'March'     },
  { v: '4',  label: 'April'     },
  { v: '5',  label: 'May'       },
  { v: '6',  label: 'June'      },
  { v: '7',  label: 'July'      },
  { v: '8',  label: 'August'    },
  { v: '9',  label: 'September' },
  { v: '10', label: 'October'   },
  { v: '11', label: 'November'  },
  { v: '12', label: 'December'  },
];

// Years: oldest first (1920) → most recent valid (current - 13)
const YEARS = Array.from(
  { length: CURRENT_YEAR - 13 - 1920 + 1 },
  (_, i) => CURRENT_YEAR - 13 - i   // newest valid first, oldest last
);

function daysInMonth(year, month) {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
}

function buildDob(day, month, year) {
  if (!day || !month || !year) return '';
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

// ─── Password helpers ────────────────────────────────────────────────────────
const PASSWORD_RULES = [
  { re: /.{8,}/,   label: 'At least 8 characters' },
  { re: /[A-Z]/,   label: 'One uppercase letter'   },
  { re: /[a-z]/,   label: 'One lowercase letter'   },
  { re: /[0-9]/,   label: 'One number'             },
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

// ─── Validation ───────────────────────────────────────────────────────────────
function validateForm(form, agreedToTerms) {
  const errors = {};
  if (!form.name.trim())                           errors.name            = 'Name is required.';
  if (!form.dobDay || !form.dobMonth || !form.dobYear)
                                                   errors.dob             = 'Please select your full date of birth.';
  if (!form.phone.trim())                          errors.phone           = 'Phone number is required.';
  else if (!PHONE_RE.test(form.phone))             errors.phone           = 'Enter a valid Malaysian number (e.g. 12 3456 7890).';
  if (form.email && !EMAIL_RE.test(form.email))    errors.email           = 'Enter a valid email address.';
  if (!form.password)                              errors.password        = 'Password is required.';
  else if (getStrength(form.password) < 4)         errors.password        = 'Password does not meet all requirements.';
  if (!form.confirmPassword)                       errors.confirmPassword = 'Please confirm your password.';
  else if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';
  if (!agreedToTerms)                              errors.terms           = 'You must agree to the Terms & Conditions and Mala Bistronome Agreement to continue.';
  return errors;
}

const INITIAL = {
  name: '', dobDay: '', dobMonth: '', dobYear: '',
  phone: '', email: '', password: '', confirmPassword: '',
};

// ─── Component ────────────────────────────────────────────────────────────────
export default function Signup() {
  const [step, setStep]                 = useState('form');
  const [form, setForm]                 = useState(INITIAL);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors]   = useState({});
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // OTP state
  const [otp, setOtp]             = useState('');
  const [otpError, setOtpError]   = useState('');
  const [countdown, setCountdown] = useState(RESEND_SECS);
  const [canResend, setCanResend] = useState(false);

  const { login } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError]     = useState('');
  const navigate = useNavigate();

  // ── Countdown (OTP step only) ──
  useEffect(() => {
    if (step !== 'otp') return;
    if (countdown === 0) { setCanResend(true); return; }
    const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, countdown]);

  // ── Valid days for current month/year selection ──
  const maxDays = useMemo(
    () => daysInMonth(form.dobYear, form.dobMonth),
    [form.dobYear, form.dobMonth]
  );

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // If day becomes invalid after month/year change, clear it
      if ((field === 'dobMonth' || field === 'dobYear') && next.dobDay) {
        const max = daysInMonth(next.dobYear, next.dobMonth);
        if (Number(next.dobDay) > max) next.dobDay = '';
      }
      return next;
    });
    setFieldErrors((prev) => ({ ...prev, [field === 'dobDay' || field === 'dobMonth' || field === 'dobYear' ? 'dob' : field]: '' }));
  };

  // ── Step 1: validate → send OTP ──
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const errors = validateForm(form, agreedToTerms);
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }
    setSubmitting(true);
    setApiError('');
    try {
      await sendRegOTP('60' + form.phone, form.email || '');
    } catch (err) {
      setApiError(err?.message || 'Failed to send OTP. Please check your number and try again.');
      setSubmitting(false);
      return;
    } finally {
      setSubmitting(false);
    }
    setOtp(''); setOtpError('');
    setCountdown(RESEND_SECS); setCanResend(false);
    setStep('otp');
  };

  // ── Step 2: verify OTP → create account ──
  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { setOtpError('Enter the 6-digit code.'); return; }
    setSubmitting(true);
    setOtpError('');
    try {
      await regOTPConfirmation({
        mobileNo:     '60' + form.phone,
        otp,
        name:         form.name,
        birthdate:    buildDob(form.dobDay, form.dobMonth, form.dobYear),
        emailAddress: form.email || '',
        password:     form.password,
      });

      // Registration succeeded — log in immediately to hydrate the session
      await login('60' + form.phone, form.password);
      navigate('/home', { replace: true });
    } catch (err) {
      setOtpError(err?.message || 'Incorrect or expired code. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setOtp(''); setOtpError('');
    setCountdown(RESEND_SECS); setCanResend(false);
    try {
      await sendRegOTP('60' + form.phone, form.email || '');
    } catch {
      // resend failure is silent — user can try again
    }
  };

  const strength     = getStrength(form.password);
  const strengthMeta = STRENGTH_META[strength] ?? STRENGTH_META[0];
  const showRules    = passwordFocused || form.password.length > 0;

  // ────────────────────────────────────────────────────────────────────────────
  // OTP Screen
  // ────────────────────────────────────────────────────────────────────────────
  if (step === 'otp') {
    return (
      <div className="signup-page">
        <div className="signup-header">
          <button className="back-btn" onClick={() => setStep('form')} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <div>
            <h1 className="signup-title">Verify Number</h1>
            <p className="signup-subtitle">OTP sent to +60{form.phone}</p>
          </div>
        </div>

        <div className="signup-body">
          <div className="otp-screen">
            <div className="otp-icon-wrap" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
                <rect width="24" height="24" rx="6" fill="var(--primary)" fillOpacity="0.1"/>
                <path d="M7 8h10M7 12h6M7 16h4" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="otp-heading">Enter your OTP</h2>
            <p className="otp-body">
              We sent a 6-digit code to <strong>+60{form.phone}</strong>.
              Check your SMS and enter it below.
            </p>

            <form onSubmit={handleOtpSubmit} noValidate>
              <OtpInput
                length={6}
                value={otp}
                onChange={(v) => { setOtp(v); setOtpError(''); }}
                hasError={!!otpError}
              />
              {otpError && <p className="otp-error" role="alert">{otpError}</p>}
              <button
                className="btn-primary"
                type="submit"
                style={{ marginTop: 28 }}
                disabled={otp.length < 6 || submitting}
              >
                {submitting ? 'Verifying…' : 'Verify & Create Account'}
              </button>
            </form>

            <div className="otp-resend">
              {canResend ? (
                <button className="otp-resend-btn" onClick={handleResend}>Resend code</button>
              ) : (
                <span className="otp-countdown">Resend code in <strong>{countdown}s</strong></span>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Registration Form
  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="signup-page">
      <div className="signup-header">
        <Link to="/login" className="back-btn" aria-label="Back to login">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </Link>
        <div>
          <h1 className="signup-title">Create Account</h1>
          <p className="signup-subtitle">Join Mala Bistronome Member Portal</p>
        </div>
      </div>

      <div className="signup-body">
        <form className="auth-form" onSubmit={handleFormSubmit} noValidate>

          {/* Name */}
          <div className="form-field">
            <label className="form-label">Name</label>
            <input
              className={`form-input ${fieldErrors.name ? 'form-input--error' : ''}`}
              type="text"
              placeholder="e.g. Ahmad bin Razali"
              value={form.name}
              onChange={set('name')}
              autoComplete="name"
            />
            {fieldErrors.name && <span className="field-error" role="alert">{fieldErrors.name}</span>}
          </div>

          {/* Date of Birth — 3 dropdowns */}
          <div className="form-field">
            <label className="form-label">Date of Birth</label>
            <div className={`dob-row ${fieldErrors.dob ? 'dob-row--error' : ''}`}>
              {/* Day */}
              <select
                className="dob-select dob-select--day"
                value={form.dobDay}
                onChange={set('dobDay')}
                aria-label="Day"
              >
                <option value="">Day</option>
                {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
                ))}
              </select>

              {/* Month */}
              <select
                className="dob-select dob-select--month"
                value={form.dobMonth}
                onChange={set('dobMonth')}
                aria-label="Month"
              >
                <option value="">Month</option>
                {MONTHS.map((m) => (
                  <option key={m.v} value={m.v}>{m.label}</option>
                ))}
              </select>

              {/* Year */}
              <select
                className="dob-select dob-select--year"
                value={form.dobYear}
                onChange={set('dobYear')}
                aria-label="Year"
              >
                <option value="">Year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            {fieldErrors.dob && <span className="field-error" role="alert">{fieldErrors.dob}</span>}
          </div>

          {/* Phone */}
          <div className="form-field">
            <label className="form-label">Phone Number</label>
            <div className={`phone-input-row ${fieldErrors.phone ? 'phone-input-row--error' : ''}`}>
              <span className="phone-prefix">🇲🇾 +60</span>
              <input
                className="phone-input"
                type="tel"
                placeholder="12 3456 7890"
                value={form.phone}
                onChange={(e) => {
                  let digits = e.target.value.replace(/\D/g, '');
                  if (digits.startsWith('60')) digits = digits.slice(2);
                  if (digits.startsWith('0'))  digits = digits.slice(1);
                  setForm((prev) => ({ ...prev, phone: digits }));
                  setFieldErrors((prev) => ({ ...prev, phone: '' }));
                }}
                maxLength={12}
                inputMode="numeric"
              />
            </div>
            {fieldErrors.phone && <span className="field-error" role="alert">{fieldErrors.phone}</span>}
          </div>

          {/* Email — optional */}
          <div className="form-field">
            <label className="form-label">
              Email <span className="label-optional">(optional)</span>
            </label>
            <input
              className={`form-input ${fieldErrors.email ? 'form-input--error' : ''}`}
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
            />
            {fieldErrors.email && <span className="field-error" role="alert">{fieldErrors.email}</span>}
          </div>

          {/* Password + strength */}
          <div className="form-field">
            <label className="form-label">Password</label>
            <div className="input-row">
              <input
                className={`form-input ${fieldErrors.password ? 'form-input--error' : ''}`}
                type={showPassword ? 'text' : 'password'}
                placeholder="Min. 8 characters"
                value={form.password}
                onChange={set('password')}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                autoComplete="new-password"
              />
              <button type="button" className="input-eye"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}>
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

            {form.password.length > 0 && (
              <div className="strength-meter">
                <div className="strength-bars">
                  {PASSWORD_RULES.map((_, i) => (
                    <div key={i} className="strength-bar"
                      style={{ background: i < strength ? strengthMeta.color : 'var(--border)' }}
                    />
                  ))}
                </div>
                <span className="strength-label" style={{ color: strengthMeta.color }}>
                  {strengthMeta.label}
                </span>
              </div>
            )}

            {showRules && (
              <ul className="password-rules">
                {PASSWORD_RULES.map((rule) => {
                  const passed = rule.re.test(form.password);
                  return (
                    <li key={rule.label} className={`rule-item ${passed ? 'rule-pass' : 'rule-fail'}`}>
                      <span className="rule-icon">{passed ? '✓' : '✗'}</span>
                      {rule.label}
                    </li>
                  );
                })}
              </ul>
            )}

            {fieldErrors.password && (
              <span className="field-error" role="alert">{fieldErrors.password}</span>
            )}
          </div>

          {/* Confirm password */}
          <div className="form-field">
            <label className="form-label">Confirm Password</label>
            <input
              className={`form-input ${fieldErrors.confirmPassword ? 'form-input--error' : ''}`}
              type="password"
              placeholder="Re-enter your password"
              value={form.confirmPassword}
              onChange={set('confirmPassword')}
              autoComplete="new-password"
            />
            {fieldErrors.confirmPassword && (
              <span className="field-error" role="alert">{fieldErrors.confirmPassword}</span>
            )}
          </div>

          {/* T&C Agreement */}
          <div className={`terms-row ${fieldErrors.terms ? 'terms-row--error' : ''}`}>
            <label className="terms-label">
              <input
                type="checkbox"
                className="terms-checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (e.target.checked) setFieldErrors((prev) => ({ ...prev, terms: '' }));
                }}
              />
              <span className="terms-text">
                I have read and agree to the{' '}
                <a href="#" className="terms-link" onClick={(e) => e.preventDefault()}>
                  Terms &amp; Conditions
                </a>{' '}
                and{' '}
                <a href="#" className="terms-link" onClick={(e) => e.preventDefault()}>
                  Mala Bistronome Agreement
                </a>
              </span>
            </label>
            {fieldErrors.terms && (
              <span className="field-error" role="alert">{fieldErrors.terms}</span>
            )}
          </div>

          {apiError && (
            <p className="field-error" role="alert" style={{ textAlign: 'center', marginBottom: 4 }}>
              {apiError}
            </p>
          )}
          <button className="btn-primary" type="submit" disabled={submitting}>
            {submitting ? 'Sending OTP…' : 'Send OTP'}
          </button>
        </form>

        <p className="auth-switch">
          Already have an account?{' '}
          <Link to="/login" className="text-link text-link--bold">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
