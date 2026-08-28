import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './DetailPage.css';

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

function formatDate(iso) {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString('en-MY', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

/**
 * Splits a string into plain-text and linked segments.
 * Detects: https?:// URLs · email addresses · phone numbers (intl + MY formats)
 */
function linkify(text) {
  if (!text) return null;

  const PATTERN = /(https?:\/\/[^\s]+|[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}|\+?(?:60)?[\s\-]?(?:1[0-9][\s\-]?\d{7,8}|[3-9]\d[\s\-]?\d{6,7}))/g;

  const parts = [];
  let last = 0;
  let match;

  while ((match = PATTERN.exec(text)) !== null) {
    // plain text before this match
    if (match.index > last) parts.push(text.slice(last, match.index));

    const val = match[0];
    let href;
    if (/^https?:\/\//i.test(val))  href = val;
    else if (/@/.test(val))         href = `mailto:${val}`;
    else                            href = `tel:${val.replace(/[\s\-]/g, '')}`;

    parts.push(
      <a key={match.index} href={href} className="detail-link"
         target="_blank" rel="noopener noreferrer">
        {val}
      </a>
    );
    last = match.index + val.length;
  }

  if (last < text.length) parts.push(text.slice(last));
  return parts.length ? parts : text;
}

/* ─── Component ────────────────────────────────────────────────────────────── */

export default function DetailPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const type   = state?.type;
  const isNews = type === 'news';

  // Track load state — always 16:9 regardless of content type
  const [imgLoaded, setImgLoaded] = useState(false);
  const [heroRatio, setHeroRatio] = useState('16 / 9');

  if (!state?.item) { navigate(-1); return null; }

  const { item } = state;
  const hasImage = Boolean(item.image);

  function handleImageLoad(e) {
    const { naturalWidth, naturalHeight } = e.target;
    setHeroRatio(`${naturalWidth} / ${naturalHeight}`);
    setImgLoaded(true);
  }

  const heroStyle = {
    background:  item.bg,
    aspectRatio: hasImage ? (imgLoaded ? heroRatio : '16 / 9') : '16 / 9',
  };

  return (
    <div className="detail-page">

      {/* ── Hero ── */}
      <div
        className={`detail-hero${hasImage ? ' detail-hero--img' : ' detail-hero--gradient'}`}
        style={heroStyle}
      >
        {/* Shimmer sweep — visible while image is loading */}
        {hasImage && !imgLoaded && <div className="detail-hero-shimmer" aria-hidden="true" />}

        {/* Actual image — fades in once loaded */}
        {hasImage && (
          <img
            src={item.image}
            alt={item.title ?? item.name}
            className={`detail-hero-img${imgLoaded ? ' detail-hero-img--loaded' : ''}`}
            onLoad={handleImageLoad}
          />
        )}

        {/* Scrim + overlays sit above the image */}
        <div className="detail-hero-scrim" />

        <button className="detail-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>

        {isNews && item.category && <span className="detail-hero-badge">{item.category}</span>}
      </div>

      {/* ── Content ── */}
      <div className="detail-content">
        {isNews && item.date && <p className="detail-meta">{formatDate(item.date)}</p>}

        <h1 className="detail-title">{item.title || item.name}</h1>

        <p className="detail-description">{linkify(item.description)}</p>

        <div className="detail-divider" />
      </div>
    </div>
  );
}
