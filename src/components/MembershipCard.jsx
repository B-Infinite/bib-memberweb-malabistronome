import './MembershipCard.css';

// Card color is driven by CardTypeFeatureID (from CardPointGetV2):
// 0 = points + cash (all type), 1 = points only, 2 = cash only.
const FEATURE_GRADIENTS = {
  0: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 50%, var(--accent) 100%)',
  1: 'linear-gradient(135deg, var(--primary-dark) 0%, var(--primary) 55%, var(--primary-light) 100%)',
  2: 'linear-gradient(135deg, var(--accent-dark) 0%, var(--accent) 100%)',
};

export default function MembershipCard({ member, merchantName, onShowQR, onOutlets }) {
  const feature  = member?.cardTypeFeatureID ?? 1;
  const gradient = FEATURE_GRADIENTS[feature] ?? FEATURE_GRADIENTS[1];

  const showPoints = feature !== 2;
  const showCash   = feature === 0 || feature === 2;
  const displayCash = member?.balCash != null ? Number(member.balCash) : 0;

  const expiryLabel = member?.pointsExpiry
    ? new Date(member.pointsExpiry).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="membership-card" style={{ background: gradient }}>
      {/* Decorative circles */}
      <div className="card-bubble card-bubble--1" />
      <div className="card-bubble card-bubble--2" />

      {/* Top row — brand only */}
      <div className="card-top">
        <span className="card-brand-label">{merchantName || 'Mala Bistronome'}</span>
      </div>

      {/* Points / Cash */}
      <div className="card-points-block">
        <div className="card-points-metrics">
          {showPoints && (
            <div className="card-points-main">
              <span className="card-points-value">
                {(member?.points || 0).toLocaleString()}
              </span>
              <span className="card-points-unit">pts</span>
            </div>
          )}
          {showCash && (
            <div className="card-points-main">
              <span className="card-points-value">{displayCash.toFixed(2)}</span>
              <span className="card-points-unit">CR</span>
            </div>
          )}
        </div>
        {expiryLabel && (
          <span className="card-points-expiry">Expires {expiryLabel}</span>
        )}
      </div>

      {/* Bottom row — action buttons */}
      <div className="card-bottom">
        <button className="card-action-btn" onClick={onShowQR} aria-label="Show membership QR code">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M3 11h8V3H3v8zm2-6h4v4H5V5zM3 21h8v-8H3v8zm2-6h4v4H5v-4zM13 3v8h8V3h-8zm6 6h-4V5h4v4zM13 13h2v2h-2v-2zM15 15h2v2h-2v-2zM13 17h2v2h-2v-2zM17 13h2v2h-2v-2zM19 15h2v2h-2v-2zM17 17h2v2h-2v-2zM19 19h2v2h-2v-2zM15 19h2v2h-2v-2zM13 21h2v-2h-2v2z" />
          </svg>
          <span>QR</span>
        </button>
        <button className="card-action-btn" onClick={onOutlets} aria-label="Find outlets">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <span>Outlets</span>
        </button>
      </div>
    </div>
  );
}
