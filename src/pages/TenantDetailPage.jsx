import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TenantDetailPage.css';

/* ─── Helpers ──────────────────────────────────────────────────────────────── */

/**
 * Splits plain text into segments, hyperlinking URLs, emails, and phone numbers.
 */
function linkify(text) {
  if (!text) return null;

  const PATTERN = /(https?:\/\/[^\s]+|[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}|\+?(?:60)?[\s\-]?(?:1[0-9][\s\-]?\d{7,8}|[3-9]\d[\s\-]?\d{6,7}))/g;

  const parts = [];
  let last = 0;
  let match;

  while ((match = PATTERN.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));

    const val = match[0];
    let href;
    if (/^https?:\/\//i.test(val))  href = val;
    else if (/@/.test(val))         href = `mailto:${val}`;
    else                            href = `tel:${val.replace(/[\s\-]/g, '')}`;

    parts.push(
      <a key={match.index} href={href} className="tdp-link"
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

export default function TenantDetailPage() {
  const { state } = useLocation();
  const navigate  = useNavigate();

  const [imgLoaded, setImgLoaded] = useState(false);

  if (!state?.item) { navigate(-1); return null; }

  const { item } = state;
  const hasImage  = Boolean(item.image);

  return (
    <div className="tdp-page">

      {/* ── 16:9 Hero — always fixed ratio ── */}
      <div className="tdp-hero">
        {/* Shimmer while image loads */}
        {hasImage && !imgLoaded && (
          <div className="tdp-hero-shimmer" aria-hidden="true" />
        )}

        {hasImage && (
          <img
            src={item.image}
            alt={item.name || item.title}
            className={`tdp-hero-img${imgLoaded ? ' tdp-hero-img--loaded' : ''}`}
            onLoad={() => setImgLoaded(true)}
          />
        )}

        {/* Bottom gradient scrim */}
        <div className="tdp-hero-scrim" />

        {/* Back button */}
        <button className="tdp-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
        </button>

        {/* Category badge — bottom-left of hero */}
        {item.category && (
          <span className="tdp-hero-badge">{item.category}</span>
        )}

      </div>

      {/* ── Content card ── */}
      <div className="tdp-content">

        <h1 className="tdp-title">{item.name || item.title}</h1>

        {item.floor && (
          <div className="tdp-meta-row">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            <span>{item.floor}</span>
          </div>
        )}

        {item.hours && (
          <div className="tdp-meta-row">
            <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
              <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
            </svg>
            <span>{item.hours}</span>
          </div>
        )}

        <div className="tdp-divider" />

        {item.description && (
          <p className="tdp-description">{linkify(item.description)}</p>
        )}

        {/* Extra info fields from future API */}
        {item.phone && (
          <div className="tdp-info-block">
            <span className="tdp-info-label">Phone</span>
            <a href={`tel:${item.phone.replace(/[\s\-]/g, '')}`} className="tdp-link">{item.phone}</a>
          </div>
        )}

        {item.website && (
          <div className="tdp-info-block">
            <span className="tdp-info-label">Website</span>
            <a href={item.website} className="tdp-link" target="_blank" rel="noopener noreferrer">{item.website}</a>
          </div>
        )}

      </div>
    </div>
  );
}
