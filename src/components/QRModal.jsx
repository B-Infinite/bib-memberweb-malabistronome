import { useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import './QRModal.css';

export default function QRModal({ member, onClose }) {
  // Lock body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const qrValue = member?.memberNumber || 'BI-MEMBER';

  return (
    <div className="qr-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Membership QR Code">
      <div className="qr-sheet" onClick={(e) => e.stopPropagation()}>
        <button className="qr-close" onClick={onClose} aria-label="Close">
          <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </button>

        <div className="qr-header">
          <div className="qr-tier-badge">{member?.tier || 'Member'}</div>
          <h3 className="qr-name">{member?.name || '—'}</h3>
        </div>

        <div className="qr-code-wrap">
          <QRCodeSVG
            value={qrValue}
            size={200}
            bgColor="#FFFFFF"
            fgColor="#1F3C28"
            level="H"
            includeMargin={false}
          />
        </div>

        <div className="qr-member-number">
          <span className="qr-number-label">Member Number</span>
          <span className="qr-number-value">{member?.memberNumber || '—'}</span>
        </div>

        <p className="qr-hint">Present this QR code at any KevW Kopitam store</p>
      </div>
    </div>
  );
}
