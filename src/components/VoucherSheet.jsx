import { useEffect } from 'react';
import './VoucherSheet.css';

const TYPE_META = {
  discount: { label: 'Discount',  bg: '#FFF7ED', color: '#EA580C', badgeBg: 'linear-gradient(135deg,#F97316,#EA580C)' },
  freebie:  { label: 'Freebie',   bg: '#F0FDF4', color: '#16A34A', badgeBg: 'linear-gradient(135deg,#22C55E,#16A34A)' },
  cashback: { label: 'Cashback',  bg: '#EEF2FF', color: '#4F46E5', badgeBg: 'linear-gradient(135deg,#6366F1,#4F46E5)' },
};

function VoucherCard({ voucher, onClick }) {
  const meta = TYPE_META[voucher.type] || TYPE_META.discount;
  return (
    <button className="vc-card" onClick={() => onClick(voucher)}>
      {/* Left: value badge */}
      <div className="vc-badge-zone" style={{ background: meta.bg }}>
        <div className="vc-badge" style={{ background: meta.badgeBg }}>
          {voucher.valueBadge}
        </div>
        <span className="vc-type-label" style={{ color: meta.color }}>{meta.label}</span>
      </div>

      {/* Right: info */}
      <div className="vc-info">
        <div className="vc-title-row">
          <span className="vc-title">{voucher.title}</span>
          {voucher.isNew && <span className="vc-new-badge">NEW</span>}
        </div>
        <span className="vc-min-spend">{voucher.minSpend}</span>
        <span className="vc-expiry">Exp: {voucher.expiry}</span>
      </div>

      {/* Chevron */}
      <svg className="vc-chevron" viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
      </svg>
    </button>
  );
}

export default function VoucherSheet({ merchant, onClose, onSelectVoucher }) {
  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const vouchers = merchant?.vouchers ?? [];

  return (
    <div className="vs-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Vouchers">
      <div className="vs-sheet" onClick={(e) => e.stopPropagation()}>
        {/* Drag handle */}
        <div className="vs-handle" />

        {/* Header */}
        <div className="vs-header">
          <div className="vs-header-left">
            <span className="vs-merchant-emoji">{merchant.emoji}</span>
            <div>
              <h3 className="vs-title-text">{merchant.name}</h3>
              <span className="vs-count">{vouchers.length} voucher{vouchers.length !== 1 ? 's' : ''} available</span>
            </div>
          </div>
          <button className="vs-close" onClick={onClose} aria-label="Close">
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
            </svg>
          </button>
        </div>

        {/* Voucher list */}
        <div className="vs-list">
          {vouchers.length === 0 ? (
            <p className="vs-empty">No vouchers available at this time.</p>
          ) : (
            vouchers.map((v) => (
              <VoucherCard
                key={v.id}
                voucher={v}
                onClick={(voucher) => { onSelectVoucher(voucher); }}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
