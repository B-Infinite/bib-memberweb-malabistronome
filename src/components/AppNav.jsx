/**
 * AppNav — shared bottom navigation (mobile) + sidebar (desktop ≥ 768px).
 *
 * Props:
 *   active  — which nav item is highlighted: 'home' | 'vouchers' | 'history' | 'profile'
 */
import { useNavigate } from 'react-router-dom';

import './AppNav.css';

const NAV_ITEMS = [
  {
    id:   'home',
    label: 'Home',
    path:  '/home',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
      </svg>
    ),
  },
  {
    id:   'vouchers',
    label: 'Vouchers',
    path:  '/vouchers',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v2.54zM11 15h2v2h-2v-2zm0-4h2v2h-2v-2zm0-4h2v2h-2V7z" />
      </svg>
    ),
  },
  {
    id:   'history',
    label: 'History',
    path:  '/transactions',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
      </svg>
    ),
  },
  {
    id:   'profile',
    label: 'Profile',
    path:  '/profile',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
      </svg>
    ),
  },
];

export default function AppNav({ active }) {
  const navigate = useNavigate();

  return (
    <nav className="bottom-nav" aria-label="Main navigation">

      {/* Sidebar header — desktop only */}
      <div className="sidebar-header">
        <span className="sidebar-logo-wordmark">
          <span className="sidebar-logo-line1">KevW</span>
          <span className="sidebar-logo-line2">Kopitiam</span>
        </span>
      </div>
      <div className="sidebar-divider" />

      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`bottom-nav-item${active === item.id ? ' active' : ''}`}
          onClick={() => navigate(item.path)}
          aria-current={active === item.id ? 'page' : undefined}
        >
          {item.icon}
          <span>{item.label}</span>
        </button>
      ))}

    </nav>
  );
}
