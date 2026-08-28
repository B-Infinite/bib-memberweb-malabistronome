import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getPromotionList } from '../api/member.api';
import './ListAll.css';

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
}

/** Map a GetPromotionListV2 item to the card shape. */
function mapPromoToCard(p) {
  return {
    raw: {
      id:          p.promotionID,
      title:       p.promotionTitle       || '',
      image:       p.promotionImage       || '',
      description: p.promotionDescription || '',
      date:        p.promotionStartDate   || null,
      category:    p.companyName          || '',
      bg:          'linear-gradient(135deg, #1F3C28, #285838)',
    },
    id:          p.promotionID,
    title:       p.promotionTitle       || '',
    description: p.promotionDescription || '',
    image:       p.promotionImage       || null,
    gradient:    'linear-gradient(135deg, #1F3C28, #285838)',
    date:        p.promotionStartDate   || null,
    category:    p.companyName          || '',
  };
}

// Module-level cache so re-visiting doesn't re-shimmer
let promoCacheListAll = null;

export default function ListAll() {
  const navigate  = useNavigate();
  const { state } = useLocation();
  const { user }  = useAuth();
  const cardNo    = user?.accountNumber || user?.cardNo || '';

  const pageTitle = state?.title || 'All Items';
  const type      = state?.type  || 'news';

  const isNews = type === 'news';

  // For non-news pages, use items passed via navigation state
  const passedItems = (state?.items || []).map((item) => ({
    raw:         item,
    id:          item.id,
    title:       item.title  ?? item.name,
    description: item.description,
    image:       item.image  ?? null,
    gradient:    item.bg     ?? 'linear-gradient(135deg, #1F3C28, #285838)',
    date:        item.date   ?? null,
    category:    item.category ?? null,
  }));

  // News: use cache for instant display, then refresh in background
  const [cards, setCards]     = useState(() => isNews ? (promoCacheListAll ?? []) : passedItems);
  const [loading, setLoading] = useState(isNews && promoCacheListAll === null);
  const [error, setError]     = useState('');

  useEffect(() => {
    if (!isNews) return;

    getPromotionList(cardNo)
      .then((res) => {
        const list   = res.data?.responseData?.promotionList ?? [];
        const mapped = list.map(mapPromoToCard);
        promoCacheListAll = mapped;
        setCards(mapped);
      })
      .catch(() => {
        setError('Failed to load promotions.');
        if (!promoCacheListAll) setCards([]);
      })
      .finally(() => setLoading(false));
  }, [isNews]);

  const handleCardClick = (card) => {
    const route = type === 'tenant' ? '/tenant-detail' : '/news-detail';
    navigate(route, { state: { item: card.raw, type } });
  };

  return (
    <div className="listall-page">
      {/* ── Header ── */}
      <header className="listall-header">
        <button className="listall-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>
        <div>
          <h1 className="listall-header-title">{pageTitle}</h1>
          {!loading && (
            <p className="listall-header-sub">{cards.length} item{cards.length !== 1 ? 's' : ''}</p>
          )}
        </div>
      </header>

      {/* ── List ── */}
      <main className="listall-content">

        {loading && (
          <div className="listall-loading">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="listall-card-skeleton" aria-hidden="true">
                <div className="lcs-img" />
                <div className="lcs-body">
                  <div className="lcs-line lcs-line--meta" />
                  <div className="lcs-line lcs-line--title" />
                  <div className="lcs-line lcs-line--desc" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && error && cards.length === 0 && (
          <div className="listall-empty"><p>{error}</p></div>
        )}

        {!loading && cards.length === 0 && !error && (
          <div className="listall-empty"><p>Nothing to show here yet.</p></div>
        )}

        {cards.map((card) => (
          <article
            key={card.id}
            className="listall-card"
            onClick={() => handleCardClick(card)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCardClick(card)}
          >
            <div className="listall-card-img" style={{ background: card.gradient }}>
              {card.image && (
                <img src={card.image} alt={card.title} className="listall-card-img-el" />
              )}
            </div>
            <div className="listall-card-body">
              {(card.category || card.date) && (
                <div className="listall-card-meta">
                  {card.category && <span className="listall-card-category">{card.category}</span>}
                  {card.date && <time className="listall-card-date">{formatDate(card.date)}</time>}
                </div>
              )}
              <h3 className="listall-card-title">{card.title}</h3>
              {card.description && (
                <p className="listall-card-desc">{card.description}</p>
              )}
            </div>
          </article>
        ))}

      </main>
    </div>
  );
}
