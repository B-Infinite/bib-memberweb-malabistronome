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

  return (
    <div className="page-header">

      {/* ── White greeting bar ── */}
      <div className="page-header-inner">
        <div className="page-header-greeting">
          <h1 className="page-header-greeting-main">{getGreeting()}, {firstName}!</h1>
          <p className="page-header-greeting-sub">Welcome to KevW Kopitam</p>
        </div>
      </div>

      {/* ── Green points banner ── */}
      <div className="points-banner">
        <div className="pb-bubble pb-bubble--1" />
        <div className="pb-bubble pb-bubble--2" />
        <span className="pb-brand">KevW Kopitam</span>
        <div className="pb-points-row">
          <span className="pb-value">{Number(displayPoints).toLocaleString()}</span>
          <span className="pb-unit">pts</span>
        </div>
      </div>

    </div>
  );
}
