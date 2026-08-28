import { useNavigate } from 'react-router-dom';
import AppNav from '../components/AppNav';
import './News.css';

export default function News() {
  const navigate = useNavigate();

  return (
    <div className="news-page">
      {/* ── Header ── */}
      <header className="news-header">
        <div className="news-header-inner">
          <button className="news-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <div>
            <h1 className="news-header-title">What's Happening</h1>
            <p className="news-header-sub">Latest updates &amp; promotions</p>
          </div>
        </div>
      </header>

      {/* ── Empty state ── */}
      <main className="news-content">
        <div className="news-empty">
          <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
            <path d="M22 3l-1.67 1.67L18.67 3 17 4.67 15.33 3l-1.66 1.67L12 3l-1.67 1.67L8.67 3 7 4.67 5.33 3 3.67 4.67 2 3v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V3z" />
          </svg>
          <p>No updates at this time</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Check back soon for the latest news &amp; promotions.</p>
        </div>
      </main>

      <AppNav active="home" />
    </div>
  );
}
