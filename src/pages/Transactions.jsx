import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { cardTransactionHistory, CARD_TYPE_ID } from '../api/member.api';
import PageHeader from '../components/PageHeader';
import AppNav from '../components/AppNav';
import './Transactions.css';

const PAGE_SIZE = 20;

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Determine earn vs redeem from the API transaction object.
 * Primary signal: sign of amountNumber (API returns negative for debits).
 * Secondary: transactionType keyword check.
 */
function getTxType(tx) {
  const num = parseFloat(tx.amountNumber);
  if (!isNaN(num)) return num >= 0 ? 'earn' : 'redeem';

  // Fallback — transactionType string check
  const type = (tx.transactionType || '').toLowerCase();
  if (/redeem|debit|out|expire|void/.test(type)) return 'redeem';
  return 'earn';
}

/**
 * Pick the best datetime source for a transaction.
 * processDateInDateTime is a proper ISO string from the API (preferred).
 * processDate may be "YYYY-MM-DD", "DD/MM/YYYY", or legacy formats.
 */
function bestDatetime(tx) {
  return tx.processDateInDateTime || tx.processDate || '';
}

/** Parse to a YYYY-MM-DD string for grouping. */
function toDateKey(dt) {
  if (!dt) return '';
  if (/^\d{4}-\d{2}-\d{2}/.test(dt)) return dt.slice(0, 10);
  if (/^\d{2}\/\d{2}\/\d{4}/.test(dt)) {
    const [d, m, y] = dt.split('/');
    return `${y}-${m}-${d}`;
  }
  const d = new Date(dt);
  return isNaN(d) ? '' : d.toISOString().slice(0, 10);
}

function formatTime(dt) {
  if (!dt) return null;
  const d = new Date(dt.replace(' ', 'T'));
  if (isNaN(d)) return null;
  return d.toLocaleTimeString('en-MY', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDateLabel(dateKey) {
  const today = new Date().toISOString().slice(0, 10);

  if (dateKey === today) return 'Today';
  return new Date(dateKey + 'T00:00:00').toLocaleDateString('en-MY', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function groupByDate(txList) {
  const groups = {};
  txList.forEach((tx) => {
    const key   = toDateKey(bestDatetime(tx));
    const label = key ? formatDateLabel(key) : 'Unknown Date';
    if (!groups[label]) groups[label] = [];
    groups[label].push(tx);
  });
  return Object.entries(groups);
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function TxIcon({ type }) {
  return type === 'earn' ? (
    <div className="tx-icon tx-icon--earn">
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M20 12l-1.41-1.41L13 16.17V4h-2v12.17l-5.58-5.59L4 12l8 8 8-8z"
              transform="rotate(180 12 12)" />
      </svg>
    </div>
  ) : (
    <div className="tx-icon tx-icon--redeem">
      <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
        <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2z" />
      </svg>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Transactions() {
  const { user }  = useAuth();

  const [txList, setTxList]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError]         = useState('');
  const [hasMore, setHasMore]     = useState(true);
  const [page, setPage]           = useState(1);
  const [activeType, setActiveType] = useState('all'); // 'all' | 'earn' | 'redeem'

  const cardNo    = user?.accountNumber || user?.cardNo || '';
  const cardTypeID = CARD_TYPE_ID;

  // ── Initial load ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!cardNo) { setLoading(false); return; }

    setLoading(true);
    setError('');
    setTxList([]);
    setPage(1);
    setHasMore(true);

    cardTransactionHistory(cardNo, cardTypeID, 1, PAGE_SIZE)
      .then((res) => {
        const list = res.data?.responseData?.transactionList ?? [];
        setTxList(list);
        setHasMore(list.length === PAGE_SIZE);
      })
      .catch((err) => setError(err?.message || 'Failed to load transactions.'))
      .finally(() => setLoading(false));
  }, [cardNo]);

  // ── Load more ───────────────────────────────────────────────────────────────
  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const res  = await cardTransactionHistory(
        cardNo, cardTypeID,
        (nextPage - 1) * PAGE_SIZE + 1,
        nextPage * PAGE_SIZE,
      );
      const more = res.data?.responseData?.transactionList ?? [];
      setTxList((prev) => [...prev, ...more]);
      setPage(nextPage);
      setHasMore(more.length === PAGE_SIZE);
    } catch (err) {
      setError(err?.message || 'Failed to load more.');
    } finally {
      setLoadingMore(false);
    }
  };

  // ── Filter + group ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (activeType === 'all') return txList;
    return txList.filter((tx) => getTxType(tx) === activeType);
  }, [txList, activeType]);

  const grouped = useMemo(() => groupByDate(filtered), [filtered]);

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="tx-page">
      <PageHeader />

      {/* ── Filter tabs ── */}
      <div className="tx-filters">
        <div className="tx-type-tabs">
          {[
            { id: 'all',    label: 'All Transactions' },
            { id: 'earn',   label: 'Earned'           },
            { id: 'redeem', label: 'Redeemed'         },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`tx-type-tab${activeType === tab.id ? ' active' : ''}`}
              onClick={() => setActiveType(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Content ── */}
      <div className="tx-content">

        {loading && (
          <div className="tx-loading">
            <div className="tx-spinner" />
            <p>Loading transactions…</p>
          </div>
        )}

        {!loading && error && (
          <div className="tx-empty">
            <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
            </svg>
            <p>{error}</p>
            <button className="tx-retry-btn" onClick={() => window.location.reload()}>Retry</button>
          </div>
        )}

        {!loading && !error && grouped.length === 0 && (
          <div className="tx-empty">
            <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
              <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
            </svg>
            <p>No transactions found</p>
          </div>
        )}

        {!loading && grouped.map(([dateLabel, txs]) => (
          <div key={dateLabel} className="tx-group">
            <div className="tx-date-label">{dateLabel}</div>
            <div className="tx-group-list">
              {txs.map((tx, idx) => {
                const type = getTxType(tx);
                const pts  = parseFloat(tx.amountNumber);
                const time = formatTime(bestDatetime(tx));
                return (
                  <div key={idx} className="tx-row">
                    <TxIcon type={type} />
                    <div className="tx-row-info">
                      <span className="tx-row-desc">{tx.description || '—'}</span>
                      <div className="tx-row-meta">
                        {tx.transactionType && (
                          <span className="tx-row-type">{tx.transactionType}</span>
                        )}
                        {time && (
                          <span className="tx-row-time">{time}</span>
                        )}
                        {tx.remark && (
                          <span className="tx-row-ref">{tx.remark}</span>
                        )}
                      </div>
                    </div>
                    <div className={`tx-row-points${type === 'earn' ? ' earn' : ' redeem'}`}>
                      {!isNaN(pts)
                        ? <>{type === 'earn' ? '+' : '−'}{Math.abs(pts).toLocaleString()}</>
                        : tx.amount || '—'
                      }
                      <span className="tx-row-pts-label">pts</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

        {/* Load more */}
        {!loading && !error && hasMore && txList.length > 0 && (
          <button
            className="tx-load-more"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            {loadingMore ? 'Loading…' : 'Load More'}
          </button>
        )}

      </div>

      <AppNav active="history" />
    </div>
  );
}
