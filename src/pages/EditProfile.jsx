import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profileUpdateSendOTP, profileUpdateOTPConfirmation } from '../api/member.api';
import OtpInput from '../components/OtpInput';
import './EditProfile.css';

// ─── Constants ────────────────────────────────────────────────────────────────
const PHONE_RE = /^1\d{8,9}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CURRENT_YEAR = new Date().getFullYear();

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

const YEARS = Array.from(
  { length: CURRENT_YEAR - 13 - 1920 + 1 },
  (_, i) => CURRENT_YEAR - 13 - i
);

function daysInMonth(year, month) {
  if (!year || !month) return 31;
  return new Date(Number(year), Number(month), 0).getDate();
}

function buildDob(day, month, year) {
  if (!day || !month || !year) return '';
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function parseDob(dob) {
  if (!dob) return { dobDay: '', dobMonth: '', dobYear: '' };
  const [year, month, day] = dob.split('-');
  return {
    dobDay:   String(Number(day)),
    dobMonth: String(Number(month)),
    dobYear:  year,
  };
}

function stripPrefix(phone) {
  if (!phone) return '';
  if (phone.startsWith('+60')) return phone.slice(3);
  if (phone.startsWith('60'))  return phone.slice(2);
  if (phone.startsWith('0'))   return phone.slice(1);
  return phone;
}

function validate(form) {
  const errors = {};
  if (!form.name.trim())
    errors.name = 'Name is required.';
  if (!form.phone.trim())
    errors.phone = 'Phone number is required.';
  else if (!PHONE_RE.test(form.phone))
    errors.phone = 'Enter a valid Malaysian number (e.g. 12 3456 7890).';
  if (!form.dobDay || !form.dobMonth || !form.dobYear)
    errors.dob = 'Please select your full date of birth.';
  if (form.email && !EMAIL_RE.test(form.email))
    errors.email = 'Enter a valid email address.';
  return errors;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function EditProfile() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();

  const initialDob = parseDob(user?.birthdate);

  const [form, setForm] = useState({
    name:     user?.name  || '',
    phone:    stripPrefix(user?.phone || user?.mobileNo) || '',
    email:    user?.email || user?.emailAddress || '',
    dobDay:   initialDob.dobDay,
    dobMonth: initialDob.dobMonth,
    dobYear:  initialDob.dobYear,
  });

  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting]   = useState(false);
  const [apiError, setApiError]       = useState('');

  // OTP modal state
  const [otpModal, setOtpModal] = useState(false);
  const [otp, setOtp]           = useState('');
  const [otpError, setOtpError] = useState('');

  const maxDays = useMemo(
    () => daysInMonth(form.dobYear, form.dobMonth),
    [form.dobYear, form.dobMonth]
  );

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if ((field === 'dobMonth' || field === 'dobYear') && next.dobDay) {
        const max = daysInMonth(next.dobYear, next.dobMonth);
        if (Number(next.dobDay) > max) next.dobDay = '';
      }
      return next;
    });
    const errorKey = ['dobDay', 'dobMonth', 'dobYear'].includes(field) ? 'dob' : field;
    setFieldErrors((prev) => ({ ...prev, [errorKey]: '' }));
    setApiError('');
  };

  const handlePhoneChange = (e) => {
    let digits = e.target.value.replace(/\D/g, '');
    if (digits.startsWith('60')) digits = digits.slice(2);
    if (digits.startsWith('0'))  digits = digits.slice(1);
    setForm((prev) => ({ ...prev, phone: digits }));
    setFieldErrors((prev) => ({ ...prev, phone: '' }));
    setApiError('');
  };

  // ── Step 2: call ProfileUpdateOTPConfirmationV2 ───────────────────────────
  const submitConfirmation = async (otpValue) => {
    try {
      await profileUpdateOTPConfirmation({
        newMobileNo:   '60' + form.phone,
        emailAddress:  form.email.trim(),
        name:          form.name.trim(),
        birthdate:     buildDob(form.dobDay, form.dobMonth, form.dobYear),
        otp:           otpValue,
        ic:            user?.ic            || '',
        address:       user?.address       || '',
        state:         user?.state         || '',
        country:       user?.country       || '',
        gender:        user?.gender        || '',
        race:          user?.race          || '',
        designation:   user?.designation   || '',
        maritalStatus: user?.maritalStatus || '',
        accountNumber: user?.accountNumber || '',
        carPlateNo:    user?.carPlateNo    || '',
      });

      // Reflect confirmed changes in local user state
      updateUser({
        name:         form.name.trim(),
        phone:        '60' + form.phone,
        mobileNo:     '60' + form.phone,
        email:        form.email.trim() || null,
        emailAddress: form.email.trim() || null,
        birthdate:    buildDob(form.dobDay, form.dobMonth, form.dobYear),
      });

      navigate('/profile');
    } catch (err) {
      setOtpError(err?.message || 'Incorrect or expired OTP. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Step 1: call ProfileUpdateSendOTPV2 ──────────────────────────────────
  const handleSave = async (e) => {
    e.preventDefault();
    const errors = validate(form);
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    setSubmitting(true);
    setApiError('');

    try {
      const res = await profileUpdateSendOTP({
        newMobileNo:  '60' + form.phone,
        emailAddress: form.email.trim(),
      });

      const displayOTP = res.data?.responseData?.displayOTP;

      if (String(displayOTP) === '1') {
        // Mobile number changed — show OTP modal
        setOtp('');
        setOtpError('');
        setOtpModal(true);
        setSubmitting(false);
      } else {
        // No OTP required — confirm directly with empty otp
        await submitConfirmation('');
      }
    } catch (err) {
      setApiError(err?.message || 'Failed to send update. Please try again.');
      setSubmitting(false);
    }
  };

  // ── OTP modal confirm ────────────────────────────────────────────────────
  const handleOtpConfirm = async (e) => {
    e.preventDefault();
    if (otp.length < 6) { setOtpError('Enter the 6-digit code.'); return; }
    setSubmitting(true);
    setOtpError('');
    await submitConfirmation(otp);
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="ep-page">

      {/* ── Header ── */}
      <header className="ep-header">
        <button className="ep-back-btn" onClick={() => navigate('/profile')} aria-label="Back">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div>
          <h1 className="ep-header-title">Edit Profile</h1>
          <p className="ep-header-sub">Update your personal information</p>
        </div>
      </header>

      {/* ── Form ── */}
      <div className="ep-body">
        <form className="auth-form" onSubmit={handleSave} noValidate>

          {/* Full Name */}
          <div className="form-field">
            <label className="form-label">Full Name</label>
            <input
              className={`form-input${fieldErrors.name ? ' form-input--error' : ''}`}
              type="text"
              placeholder="e.g. Ahmad bin Razali"
              value={form.name}
              onChange={set('name')}
              autoComplete="name"
              disabled={submitting}
            />
            {fieldErrors.name && (
              <span className="field-error" role="alert">{fieldErrors.name}</span>
            )}
          </div>

          {/* Phone */}
          <div className="form-field">
            <label className="form-label">Phone Number</label>
            <div className={`phone-input-row${fieldErrors.phone ? ' phone-input-row--error' : ''}`}>
              <span className="phone-prefix">🇲🇾 +60</span>
              <input
                className="phone-input"
                type="tel"
                inputMode="numeric"
                placeholder="12 3456 7890"
                value={form.phone}
                onChange={handlePhoneChange}
                maxLength={12}
                autoComplete="tel-national"
                disabled={submitting}
              />
            </div>
            {fieldErrors.phone && (
              <span className="field-error" role="alert">{fieldErrors.phone}</span>
            )}
          </div>

          {/* Date of Birth */}
          <div className="form-field">
            <label className="form-label">Date of Birth</label>
            <div className={`dob-row${fieldErrors.dob ? ' dob-row--error' : ''}`}>
              <select
                className="dob-select dob-select--day"
                value={form.dobDay}
                onChange={set('dobDay')}
                aria-label="Day"
                disabled={submitting}
              >
                <option value="">Day</option>
                {Array.from({ length: maxDays }, (_, i) => i + 1).map((d) => (
                  <option key={d} value={d}>{String(d).padStart(2, '0')}</option>
                ))}
              </select>

              <select
                className="dob-select dob-select--month"
                value={form.dobMonth}
                onChange={set('dobMonth')}
                aria-label="Month"
                disabled={submitting}
              >
                <option value="">Month</option>
                {MONTHS.map((m) => (
                  <option key={m.v} value={m.v}>{m.label}</option>
                ))}
              </select>

              <select
                className="dob-select dob-select--year"
                value={form.dobYear}
                onChange={set('dobYear')}
                aria-label="Year"
                disabled={submitting}
              >
                <option value="">Year</option>
                {YEARS.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
            {fieldErrors.dob && (
              <span className="field-error" role="alert">{fieldErrors.dob}</span>
            )}
          </div>

          {/* Email (optional) */}
          <div className="form-field">
            <label className="form-label">
              Email <span className="ep-label-optional">(optional)</span>
            </label>
            <input
              className={`form-input${fieldErrors.email ? ' form-input--error' : ''}`}
              type="email"
              placeholder="your@email.com"
              value={form.email}
              onChange={set('email')}
              autoComplete="email"
              disabled={submitting}
            />
            {fieldErrors.email && (
              <span className="field-error" role="alert">{fieldErrors.email}</span>
            )}
          </div>

          {apiError && (
            <p className="field-error" role="alert" style={{ textAlign: 'center', marginBottom: 4 }}>
              {apiError}
            </p>
          )}

          <button
            className="btn-primary ep-save-btn"
            type="submit"
            disabled={submitting}
            style={{ marginTop: 8 }}
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>

        </form>
      </div>

      {/* ── OTP Modal ── */}
      {otpModal && (
        <div className="ep-otp-overlay" role="dialog" aria-modal="true">
          <div className="ep-otp-sheet">
            <div className="ep-otp-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" width="32" height="32">
                <rect width="24" height="24" rx="6" fill="var(--primary)" fillOpacity="0.1"/>
                <path d="M7 8h10M7 12h6M7 16h4" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </div>
            <h2 className="ep-otp-title">Verify New Number</h2>
            <p className="ep-otp-body">
              An OTP has been sent to <strong>+60{form.phone}</strong>. Enter it below to confirm your update.
            </p>

            <form onSubmit={handleOtpConfirm} noValidate>
              <OtpInput
                length={6}
                value={otp}
                onChange={(v) => { setOtp(v); setOtpError(''); }}
                hasError={!!otpError}
              />
              {otpError && (
                <p className="otp-error" role="alert">{otpError}</p>
              )}
              <div className="ep-otp-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => { setOtpModal(false); setOtp(''); setOtpError(''); }}
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={otp.length < 6 || submitting}
                >
                  {submitting ? 'Confirming…' : 'Confirm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
