import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import APP_LINKS from '../config/appLinks';
import AppNav from '../components/AppNav';
import './Profile.css';

// ── Sub-components ────────────────────────────────────────────────────────────

function ProfileField({ label, value }) {
  return (
    <div className="profile-field">
      <span className="profile-field-label">{label}</span>
      <span className="profile-field-value">{value}</span>
    </div>
  );
}

function LinkField({ label, value, onClick }) {
  return (
    <div className="profile-field profile-field--link" onClick={onClick} style={onClick ? { cursor: 'pointer' } : {}}>
      <span className="profile-field-label">{label}</span>
      <div className="profile-field-link-right">
        {value && <span className="profile-field-value">{value}</span>}
        <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" className="profile-chevron">
          <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
        </svg>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const initials = user?.name
    ?.split(' ')
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join('') || '?';

  return (
    <div className="profile-page">
      {/* ── Header ── */}
      <header className="profile-header">
        <div className="profile-avatar" aria-hidden="true">{initials}</div>
        <h2 className="profile-name">{user?.name}</h2>
        {user?.accountNumber && (
          <span className="profile-member-no">Member #{user.accountNumber}</span>
        )}
      </header>

      {/* ── Scrollable content ── */}
      <main className="profile-content">

        {/* Personal Info */}
        <div className="profile-section">
          <h3 className="profile-section-title">Personal Info</h3>
          <div className="profile-field-list">
            <ProfileField label="Full Name" value={user?.name} />
            <ProfileField label="Phone" value={user?.phone || user?.mobileNo} />
            <ProfileField label="Date of Birth" value={user?.birthdate || '—'} />
            <ProfileField label="Email" value={user?.email || user?.emailAddress || '—'} />
          </div>
          <div className="profile-btn-row">
            <button className="profile-edit-btn" onClick={() => navigate('/edit-profile')}>Edit Info</button>
            <button className="profile-edit-btn profile-edit-btn--secondary" onClick={() => navigate('/change-password')}>Change Password</button>
          </div>
        </div>

        {/* About — driven by src/config/appLinks.js */}
        <div className="profile-section">
          <h3 className="profile-section-title">About</h3>
          <div className="profile-field-list">
            {APP_LINKS.filter((link) => link.enabled).map((link) => {
              if (link.type === 'info') {
                return (
                  <ProfileField key={link.id} label={link.label} value={link.value} />
                );
              }
              // 'external' | 'email' | 'phone'
              const href =
                link.type === 'email' ? `mailto:${link.url}` :
                link.type === 'phone' ? `tel:${link.url.replace(/[\s\-]/g, '')}` :
                link.url;
              return (
                <LinkField
                  key={link.id}
                  label={link.label}
                  onClick={href ? () => window.open(href, '_blank', 'noopener,noreferrer') : undefined}
                />
              );
            })}
          </div>
        </div>

        {/* Logout */}
        <button
          className="profile-logout-btn"
          onClick={logout}
        >
          Sign Out
        </button>
      </main>

      <AppNav active="profile" />
    </div>
  );
}
