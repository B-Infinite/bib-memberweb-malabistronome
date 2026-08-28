import { useEffect, useState } from 'react';
import './VoucherModal.css';

const TYPE_PLACEHOLDER = {
  discount: 'linear-gradient(135deg, #FFF7ED 0%, #FFEDD5 100%)',
  freebie:  'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
  cashback: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)',
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function VoucherModal({ voucher, merchant, onClose, onRedeem, onMarkUsed }) {
  const [step, setStep]           = useState('detail');   // 'detail' | 'confirm' | 'confirm-use' | 'success'
  const [copied, setCopied]       = useState(false);
  const [newCode, setNewCode]     = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);
  const [redeemError, setRedeemError]     = useState('');
  const [markUsedLoading, setMarkUsedLoading] = useState(false);
  const [markUsedError, setMarkUsedError]     = useState('');

  const placeholder   = TYPE_PLACEHOLDER[voucher.type] || TYPE_PLACEHOLDER.discount;
  const isCatalogue   = !voucher.status;
  const isOwned       = Boolean(voucher.status);
  const canMarkUsed   = isOwned && voucher.voucherCodeSourceID === 2;

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Escape key — only close on detail step; go back on confirm
  useEffect(() => {
    const handler = (e) => {
      if (e.key !== 'Escape') return;
      if (step === 'confirm' || step === 'confirm-use') setStep('detail');
      else if (step !== 'success') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose, step]);

  const handleConfirmRedeem = async () => {
    setRedeemLoading(true);
    setRedeemError('');
    try {
      const result = await onRedeem?.(voucher); // resolves to { code } or undefined
      const suffix  = Math.random().toString(36).slice(2, 6).toUpperCase();
      const fallback = `MV-${String(voucher.id).replace('tc-', '').toUpperCase()}-${suffix}`;
      setNewCode(result?.code || fallback);
      setStep('success');
    } catch (err) {
      setRedeemError(err?.message || 'Redemption failed. Please try again.');
    } finally {
      setRedeemLoading(false);
    }
  };

  const handleConfirmMarkUsed = async () => {
    setMarkUsedLoading(true);
    setMarkUsedError('');
    try {
      await onMarkUsed?.(voucher);
      onClose(); // success — close modal; active list already updated in parent
    } catch (err) {
      setMarkUsedError(err?.message || 'Failed to mark as used. Please try again.');
    } finally {
      setMarkUsedLoading(false);
    }
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div
      className="vm-overlay"
      onClick={step === 'success' || step === 'confirm-use' ? undefined : onClose}
      role="dialog"
      aria-modal="true"
      aria-label={voucher.title}
    >
      <div className="vm-modal" onClick={(e) => e.stopPropagation()}>

        {/* ════════════════════════════════
            STEP: DETAIL
        ════════════════════════════════ */}
        {step === 'detail' && (
          <>
            {/* 16:9 Hero */}
            <div className="vm-hero" style={{ background: voucher.image ? undefined : placeholder }}>
              {voucher.image && (
                <img src={voucher.image} alt={voucher.title} className="vm-hero-img" />
              )}
              <button className="vm-close" onClick={onClose} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                </svg>
              </button>
            </div>

            <div className="vm-body">
              <h3 className="vm-title">{voucher.title}</h3>
              <p className="vm-description">{voucher.description}</p>

              <div className="vm-info-row">
                <span className="vm-validity">Valid until {formatDate(voucher.expiry)}</span>
                {voucher.pointsCost > 0 && (
                  <span className="vm-pts">{voucher.pointsCost.toLocaleString()} pts</span>
                )}
              </div>

              {/* Code block — owned vouchers only */}
              {isOwned && voucher.code && (
                <div className="vm-code-block">
                  <span className="vm-code-label">Voucher Code</span>
                  <span className="vm-code">{voucher.code}</span>
                  <button
                    className={`vm-copy-btn${copied ? ' vm-copy-btn--done' : ''}`}
                    onClick={() => handleCopy(voucher.code)}
                  >
                    {copied ? (
                      <><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>Copied!</>
                    ) : (
                      <><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>Copy Code</>
                    )}
                  </button>
                </div>
              )}

              {voucher.terms && (
                <div className="vm-terms">
                  <span className="vm-terms-label">Terms &amp; Conditions</span>
                  <p className="vm-terms-text">{voucher.terms}</p>
                </div>
              )}
            </div>

            {/* Sticky footer — always visible, never scrolls away */}
            {(isCatalogue || canMarkUsed) && (
              <div className="vm-footer">
                <button
                  className="vm-use-btn"
                  onClick={() => isCatalogue ? setStep('confirm') : setStep('confirm-use')}
                >
                  {isCatalogue ? 'Redeem with Points' : 'Mark as Used'}
                </button>
              </div>
            )}
          </>
        )}

        {/* ════════════════════════════════
            STEP: CONFIRM
        ════════════════════════════════ */}
        {step === 'confirm' && (
          <div className="vm-body vm-body--centered">
            <div className="vm-confirm-icon" aria-hidden="true">🎟️</div>
            <h3 className="vm-confirm-title">Confirm Redemption</h3>
            <p className="vm-confirm-sub">You are about to redeem</p>
            <p className="vm-confirm-voucher-name">{voucher.title}</p>
            <div className="vm-confirm-cost">
              <span className="vm-confirm-cost-value">{voucher.pointsCost?.toLocaleString()}</span>
              <span className="vm-confirm-cost-unit">pts</span>
            </div>
            <p className="vm-confirm-note">This cannot be undone. The voucher will appear in My Vouchers.</p>
            {redeemError && (
              <p className="vm-redeem-error">{redeemError}</p>
            )}
            <div className="vm-confirm-actions">
              <button className="vm-cancel-btn" onClick={() => setStep('detail')} disabled={redeemLoading}>Cancel</button>
              <button
                className="vm-use-btn vm-use-btn--confirm"
                onClick={handleConfirmRedeem}
                disabled={redeemLoading}
              >
                {redeemLoading ? 'Processing…' : 'Confirm'}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            STEP: CONFIRM MARK AS USED
        ════════════════════════════════ */}
        {step === 'confirm-use' && (
          <div className="vm-body vm-body--centered">
            <div className="vm-confirm-icon" aria-hidden="true">✅</div>
            <h3 className="vm-confirm-title">Mark as Used?</h3>
            <p className="vm-confirm-sub">You are about to mark</p>
            <p className="vm-confirm-voucher-name">{voucher.title}</p>
            <p className="vm-confirm-note">This cannot be undone. The voucher will move to your Past vouchers.</p>
            {markUsedError && (
              <p className="vm-redeem-error">{markUsedError}</p>
            )}
            <div className="vm-confirm-actions">
              <button className="vm-cancel-btn" onClick={() => setStep('detail')} disabled={markUsedLoading}>Cancel</button>
              <button
                className="vm-use-btn vm-use-btn--confirm"
                onClick={handleConfirmMarkUsed}
                disabled={markUsedLoading}
              >
                {markUsedLoading ? 'Processing…' : 'Confirm'}
              </button>
            </div>
          </div>
        )}

        {/* ════════════════════════════════
            STEP: SUCCESS
        ════════════════════════════════ */}
        {step === 'success' && (
          <div className="vm-body vm-body--centered">
            <div className="vm-success-icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="currentColor" width="36" height="36">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            </div>
            <h3 className="vm-confirm-title">Redeemed!</h3>
            <p className="vm-confirm-sub">{voucher.title} is now in My Vouchers</p>

            <div className="vm-code-block" style={{ width: '100%' }}>
              <span className="vm-code-label">Voucher Code</span>
              <span className="vm-code">{newCode}</span>
              <button
                className={`vm-copy-btn${copied ? ' vm-copy-btn--done' : ''}`}
                onClick={() => handleCopy(newCode)}
              >
                {copied ? (
                  <><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>Copied!</>
                ) : (
                  <><svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14"><path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" /></svg>Copy Code</>
                )}
              </button>
            </div>

            <button className="vm-use-btn" onClick={onClose}>Done</button>
          </div>
        )}

      </div>
    </div>
  );
}
