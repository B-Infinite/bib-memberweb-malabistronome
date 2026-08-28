import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { cardGiftList, redeemGift, getVoucherList, getVoucherHistoryList, redeemVoucher, CARD_TYPE_ID } from '../api/member.api';
import PageHeader from '../components/PageHeader';
import VoucherModal from '../components/VoucherModal';
import AppNav from '../components/AppNav';
import './Vouchers.css';

// Module-level caches — survive re-mounts (navigation) but clear on full page reload
let catalogueCache = null;
let activeCache    = null;
let historyCache   = null;

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PLACEHOLDER_BG = 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)';

/**
 * Map a CardGetGiftListV2 gift object to the shape VoucherCard / VoucherModal expect.
 * API fields: giftID, giftName, description, validPeriod, point, discountPoint,
 *             credit, discountCredit, giftImage, expireDate, tnC, giftCatagoryID, brandImage
 */
function mapGift(g) {
  return {
    id:          String(g.giftID),
    title:       g.giftName       || 'Gift',
    description: g.description    || g.validPeriod || '',
    image:       g.giftImage      || '',
    expiry:      g.expireDate     || '',
    terms:       g.tnC            || '',
    pointsCost:  Number(g.point)  || 0,
    brandImage:  g.brandImage     || '',
    // No 'status' — identifies this as a catalogue item (not owned)
  };
}

/**
 * Map a GetVoucherListV2 item to the shape VoucherCard / VoucherModal expect.
 * API now returns one entry per voucher with OTP/serial already attached.
 */
function mapVoucher(v) {
  return {
    id:          v.voucherMemberID || String(v.voucherID),
    title:       v.voucherName     || v.voucherIDName || 'Voucher',
    description: v.description     || '',
    image:       v.voucherImage    || '',
    expiry:      v.expiryDate      || '',
    terms:       v.tnC             || '',
    pointsCost:  Number(v.pointRequired) || 0,
    brandImage:  v.brandImage      || '',
    tags:        v.voucherTagDisplay || [],
    code:               v.voucherOTP         || v.voucherSerialNo || '',
    voucherCodeSourceID: Number(v.voucherCodeSourceID) || 0,
    status:             'active',  // presence of status marks this as owned in VoucherModal
  };
}

/**
 * Map a GetVoucherHistoryListV2 item.
 * status is typically "Redeemed" or "Expired".
 */
function mapVoucherHistory(v) {
  const isExpired = (v.status || '').toLowerCase() === 'expired';
  return {
    id:                  v.voucherMemberID  || String(v.voucherID),
    title:               v.voucherName      || 'Voucher',
    description:         v.description      || '',
    image:               v.voucherImage     || '',
    expiry:              v.expiryDate       || '',
    usedDate:            v.redeemDate       || '',
    terms:               v.tnC              || '',
    brandImage:          v.brandImage       || '',
    pointsCost:          Number(v.pointRequired) || 0,
    code:                v.voucherOTP       || v.voucherSerialNo || '',
    voucherCodeSourceID: Number(v.voucherCodeSourceID) || 0,
    tags:                v.voucherTagDisplay || [],
    status:              v.status           || 'Redeemed',
    isExpired,
  };
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (isNaN(d)) return iso; // Return as-is if not parseable
  return d.toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ─── VoucherCard ──────────────────────────────────────────────────────────────

function VoucherCard({ voucher, canAfford = true, isUsed = false, isExpired = false, onClick }) {
  const cardClass = [
    'voucher-card',
    !canAfford  ? 'voucher-card--locked'  : '',
    isUsed      ? 'voucher-card--used'    : '',
    isExpired   ? 'voucher-card--expired' : '',
  ].filter(Boolean).join(' ');

  const Tag = isExpired ? 'div' : 'button';

  return (
    <Tag className={cardClass} onClick={!isExpired ? onClick : undefined} aria-label={voucher.title}>
      <div className="voucher-card-img">
        {voucher.image
          ? <img src={voucher.image} alt={voucher.title} className="voucher-card-img-el" />
          : <div className="voucher-card-img-placeholder" style={{ background: PLACEHOLDER_BG }} />
        }
      </div>
      <div className="voucher-card-body">
        <span className="voucher-card-title">{voucher.title}</span>
        {voucher.description
          ? <span className="voucher-card-desc">{voucher.description}</span>
          : (isUsed || isExpired) && (
            <span className={`voucher-card-status-badge${isExpired ? ' expired' : ''}`}>
              {isExpired ? 'Expired' : voucher.status || 'Redeemed'}
            </span>
          )
        }
        {(voucher.expiry || voucher.usedDate) && (
          <span className="voucher-card-validity">
            {isUsed
              ? `Used on ${formatDate(voucher.usedDate || voucher.expiry)}`
              : isExpired
              ? `Expired ${formatDate(voucher.expiry)}`
              : `Valid until ${formatDate(voucher.expiry)}`
            }
          </span>
        )}
        {!isUsed && !isExpired && voucher.pointsCost > 0 && (
          <span className="voucher-card-pts">{voucher.pointsCost.toLocaleString()} pts</span>
        )}
        {(isUsed || isExpired) && voucher.code && (
          <span className="voucher-card-code">{voucher.code}</span>
        )}
      </div>
    </Tag>
  );
}

// ─── LoadingGrid ──────────────────────────────────────────────────────────────

function LoadingGrid() {
  return (
    <div className="vouchers-grid">
      {[1, 2, 3].map(i => (
        <div key={i} className="voucher-card-skeleton" aria-hidden="true">
          <div className="vcs-img" />
          <div className="vcs-body">
            <div className="vcs-line vcs-line--title" />
            <div className="vcs-line vcs-line--desc" />
            <div className="vcs-line vcs-line--sub" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState({ icon, text }) {
  return (
    <div className="vouchers-empty">
      {icon}
      <p>{text}</p>
    </div>
  );
}

const EmptyVoucherIcon = (
  <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
    <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2z" />
  </svg>
);

// ─── Main component ───────────────────────────────────────────────────────────

export default function Vouchers() {
  const { user, refreshUserData } = useAuth();

  const [activeTab, setActiveTab]             = useState('catalogue');
  const [selectedVoucher, setSelectedVoucher] = useState(null);

  // Catalogue — initialise from cache for instant display on return visits
  const [catalogue, setCatalogue]   = useState(() => catalogueCache ?? []);
  const [catLoading, setCatLoading] = useState(catalogueCache === null);
  const [catError, setCatError]     = useState('');

  // Live points (deducted after redemption)
  const [points, setPoints] = useState(() => user?.points ?? 0);

  // Active (redeemed) vouchers from API
  const [activeVouchers, setActiveVouchers]     = useState(() => activeCache ?? []);
  const [activeLoading, setActiveLoading]       = useState(activeCache === null);
  const [activeError, setActiveError]           = useState('');

  // Past (used/expired) vouchers from API
  const [historyVouchers, setHistoryVouchers]   = useState(() => historyCache ?? []);
  const [historyLoading, setHistoryLoading]     = useState(historyCache === null);
  const [historyError, setHistoryError]         = useState('');

  const cardNo = user?.accountNumber || user?.cardNo || '';

  // ── Fetch catalogue — always refresh in background; skeleton only on first load
  useEffect(() => {
    if (!cardNo) { setCatLoading(false); return; }

    cardGiftList(cardNo)
      .then((res) => {
        const list = res.data?.responseData?.giftList ?? [];
        const mapped = list.map(mapGift);
        catalogueCache = mapped;
        setCatalogue(mapped);
      })
      .catch((err) => {
        if (!catalogueCache) setCatError(err?.message || 'Failed to load catalogue.');
      })
      .finally(() => setCatLoading(false));
  }, [cardNo]);

  // ── Fetch active vouchers — same cache pattern as catalogue
  useEffect(() => {
    if (!cardNo) { setActiveLoading(false); return; }

    getVoucherList(cardNo)
      .then((res) => {
        const list   = res.data?.responseData?.voucherList ?? [];
        const mapped = list.map(mapVoucher);
        activeCache = mapped;
        setActiveVouchers(mapped);
      })
      .catch((err) => {
        if (!activeCache) setActiveError(err?.message || 'Failed to load vouchers.');
      })
      .finally(() => setActiveLoading(false));
  }, [cardNo]);

  // ── Fetch voucher history (used / expired)
  useEffect(() => {
    if (!cardNo) { setHistoryLoading(false); return; }

    getVoucherHistoryList(cardNo)
      .then((res) => {
        const list   = res.data?.responseData?.voucherHistoryList ?? [];
        const mapped = list.map(mapVoucherHistory);
        historyCache = mapped;
        setHistoryVouchers(mapped);
      })
      .catch((err) => {
        if (!historyCache) setHistoryError(err?.message || 'Failed to load history.');
      })
      .finally(() => setHistoryLoading(false));
  }, [cardNo]);

  // Keep local points in sync when user context updates
  useEffect(() => {
    if (user?.points !== undefined) setPoints(user.points);
  }, [user?.points]);

  // ── Redeem handler — called by VoucherModal ─────────────────────────────────
  const handleRedeem = async (voucher) => {
    const res  = await redeemGift(cardNo, voucher.id);
    const rd   = res.data?.responseData ?? {};

    // OTP takes priority over serial number
    const code  = rd.voucherOTP || rd.voucherSerialNo || '';
    const isOTP = Boolean(rd.voucherOTP);

    // Optimistic local deduction for instant feedback on this page
    setPoints((prev) => prev - voucher.pointsCost);

    // Sync the real balance back into the auth context in the background
    refreshUserData().catch(() => { /* non-fatal */ });

    // Invalidate active voucher cache so the Active tab re-fetches on next visit
    activeCache = null;
    getVoucherList(cardNo)
      .then((res) => {
        const list   = res.data?.responseData?.voucherList ?? [];
        const mapped = list.map(mapVoucher);
        activeCache = mapped;
        setActiveVouchers(mapped);
      })
      .catch(() => { /* non-fatal — user will see stale data until next visit */ });

    return { code, isOTP };
  };

  // ── Mark as Used handler — called by VoucherModal for voucherCodeSourceID === 2
  const handleMarkUsed = async (voucher) => {
    await redeemVoucher(cardNo, voucher.id);

    // Remove from active cache & state immediately
    activeCache = (activeCache ?? []).filter(v => v.id !== voucher.id);
    setActiveVouchers(prev => prev.filter(v => v.id !== voucher.id));

    // Invalidate history cache so Past tab re-fetches with the newly used voucher
    historyCache = null;
    getVoucherHistoryList(cardNo)
      .then((res) => {
        const list   = res.data?.responseData?.voucherHistoryList ?? [];
        const mapped = list.map(mapVoucherHistory);
        historyCache = mapped;
        setHistoryVouchers(mapped);
      })
      .catch(() => { /* non-fatal */ });
  };

  return (
    <div className="vouchers-page">

      {/* ── Shared header ── */}
      <PageHeader points={points} />

      {/* ── Tabs ── */}
      <div className="vouchers-tabs">
        <div className="vouchers-tab-pills">
          <button
            className={`vouchers-tab-pill${activeTab === 'catalogue' ? ' active' : ''}`}
            onClick={() => setActiveTab('catalogue')}
          >
            Catalogue
            {!catLoading && catalogue.length > 0 && (
              <span className={`vouchers-tab-pill-badge${activeTab === 'catalogue' ? ' active' : ''}`}>
                {catalogue.length}
              </span>
            )}
          </button>
          <button
            className={`vouchers-tab-pill${activeTab === 'active' ? ' active' : ''}`}
            onClick={() => setActiveTab('active')}
          >
            Active
            {!activeLoading && activeVouchers.length > 0 && (
              <span className={`vouchers-tab-pill-badge${activeTab === 'active' ? ' active' : ''}`}>
                {activeVouchers.length}
              </span>
            )}
          </button>
          <button
            className={`vouchers-tab-pill${activeTab === 'past' ? ' active' : ''}`}
            onClick={() => setActiveTab('past')}
          >
            Past
            {!historyLoading && historyVouchers.length > 0 && (
              <span className={`vouchers-tab-pill-badge${activeTab === 'past' ? ' active' : ''}`}>
                {historyVouchers.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="vouchers-content">

        {/* ── Catalogue tab ── */}
        {activeTab === 'catalogue' && (
          <>
            {catLoading && <LoadingGrid />}

            {!catLoading && catError && (
              <EmptyState
                icon={
                  <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                }
                text={catError}
              />
            )}

            {!catLoading && !catError && catalogue.length === 0 && (
              <EmptyState icon={EmptyVoucherIcon} text="No gifts available right now." />
            )}

            {!catLoading && !catError && catalogue.length > 0 && (
              <div className="vouchers-grid">
                {catalogue.map((voucher) => (
                  <VoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    canAfford={points >= voucher.pointsCost}
                    onClick={() => setSelectedVoucher(voucher)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Active tab ── */}
        {activeTab === 'active' && (
          <>
            {activeLoading && <LoadingGrid />}

            {!activeLoading && activeError && (
              <EmptyState
                icon={
                  <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                }
                text={activeError}
              />
            )}

            {!activeLoading && !activeError && activeVouchers.length === 0 && (
              <EmptyState
                icon={EmptyVoucherIcon}
                text="No active vouchers — redeem one from the Catalogue!"
              />
            )}

            {!activeLoading && !activeError && activeVouchers.length > 0 && (
              <div className="vouchers-grid">
                {activeVouchers.map((voucher) => (
                  <VoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    onClick={() => setSelectedVoucher(voucher)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* ── Past tab ── */}
        {activeTab === 'past' && (
          <>
            {historyLoading && <LoadingGrid />}

            {!historyLoading && historyError && (
              <EmptyState
                icon={
                  <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                  </svg>
                }
                text={historyError}
              />
            )}

            {!historyLoading && !historyError && historyVouchers.length === 0 && (
              <EmptyState
                icon={
                  <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
                    <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
                  </svg>
                }
                text="No past vouchers yet."
              />
            )}

            {!historyLoading && !historyError && historyVouchers.length > 0 && (
              <div className="vouchers-grid">
                {historyVouchers.map((voucher) => (
                  <VoucherCard
                    key={voucher.id}
                    voucher={voucher}
                    isUsed={!voucher.isExpired}
                    isExpired={voucher.isExpired}
                    onClick={() => setSelectedVoucher(voucher)}
                  />
                ))}
              </div>
            )}
          </>
        )}

      </div>

      <AppNav active="vouchers" />

      {selectedVoucher && (
        <VoucherModal
          voucher={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          onRedeem={handleRedeem}
          onMarkUsed={handleMarkUsed}
        />
      )}
    </div>
  );
}
