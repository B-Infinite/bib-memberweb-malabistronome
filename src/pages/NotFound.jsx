import { useNavigate } from 'react-router-dom';
import logo from '../assets/logo_mala.webp';
import './NotFound.css';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="nf-page">
      <div className="nf-card">
        <img src={logo} alt="Mala Bistronome" className="nf-logo" />

        <div className="nf-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" width="40" height="40">
            <circle cx="11" cy="11" r="8" stroke="var(--primary)" strokeWidth="1.5" strokeOpacity="0.3" />
            <path d="M21 21l-4.35-4.35" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
            <path d="M11 8v3" stroke="var(--primary)" strokeWidth="2" strokeLinecap="round" />
            <circle cx="11" cy="14" r="1" fill="var(--primary)" />
          </svg>
        </div>

        <h1 className="nf-title">Page not found</h1>
        <p className="nf-body">
          The page you're looking for doesn't exist or may have been moved.
          Head back to the home screen to continue.
        </p>

        <div className="nf-actions">
          <button className="btn-primary" onClick={() => navigate('/home', { replace: true })}>
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
}
