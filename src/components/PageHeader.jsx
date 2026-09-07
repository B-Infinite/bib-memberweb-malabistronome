import { useAuth } from '../context/AuthContext';
import './PageHeader.css';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

// points prop: pass local state when the page manages it optimistically (e.g. Vouchers)
// falls back to user.points from context if not supplied
export default function PageHeader({ points }) {
  const { user } = useAuth();
  const firstName     = user?.name?.split(' ')[0] || 'Member';
  const displayPoints = points ?? user?.points ?? 0;
  const displayCash   = user?.balCash != null ? Number(user.balCash) : 0;

  // CardTypeFeatureID: 0 = points + cash (all type), 1 = points only, 2 = cash only.
  const feature    = user?.cardTypeFeatureID ?? 1;
  const showPoints = feature !== 2;
  const showCash   = feature === 0 || feature === 2;
  const isSplit    = showPoints && showCash;

  return (
    <div className="page-header">

      {/* ── White greeting bar ── */}
      <div className="page-header-inner">
        <div className="page-header-greeting">
          <h1 className="page-header-greeting-main">{getGreeting()}, {firstName}!</h1>
          <p className="page-header-greeting-sub">Welcome to Mala Bistronome</p>
        </div>
      </div>

      {/* ── Green points banner ── */}
      <div className="points-banner">
        <div className="pb-bubble pb-bubble--1" />
        <div className="pb-bubble pb-bubble--2" />
        <span className="pb-brand">Mala Bistronome</span>
        <div className={`pb-metrics-row${isSplit ? ' pb-metrics-row--split' : ''}`}>
          {showPoints && (
            <div className="pb-metric">
              <span className="pb-value">{Number(displayPoints).toLocaleString()}</span>
              <span className="pb-unit">pts</span>
            </div>
          )}
          {isSplit && <div className="pb-metric-divider" />}
          {showCash && (
            <div className="pb-metric">
              <span className="pb-value">{displayCash.toFixed(2)}</span>
              <span className="pb-unit">CR</span>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
