import { useNavigate } from 'react-router-dom';
import AppNav from '../components/AppNav';
import './Outlets.css';

export default function Outlets() {
  const navigate = useNavigate();

  return (
    <div className="outlets-page">
      {/* ── Header ── */}
      <header className="outlets-header">
        <div className="outlets-header-inner">
          <button className="outlets-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <div>
            <h1 className="outlets-header-title">Outlets</h1>
            <p className="outlets-header-sub">Our locations</p>
          </div>
        </div>
      </header>

      {/* ── Empty state ── */}
      <main className="outlets-content">
        <div className="outlets-empty">
          <svg viewBox="0 0 24 24" fill="currentColor" width="40" height="40">
            <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
          </svg>
          <p>No outlets listed at this time</p>
          <p style={{ fontSize: 13, marginTop: 4 }}>Location information will be available soon.</p>
        </div>
      </main>

      <AppNav active="home" />
    </div>
  );
}
