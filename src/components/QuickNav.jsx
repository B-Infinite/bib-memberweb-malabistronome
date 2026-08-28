import { useNavigate } from 'react-router-dom';
import './QuickNav.css';

const NAV_ITEMS = [
  {
    id: 'vouchers',
    label: 'Vouchers',
    path: '/vouchers',
    bg: '#FFF7ED',
    color: '#EA580C',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M22 10V6c0-1.11-.9-2-2-2H4c-1.1 0-1.99.89-1.99 2v4c1.1 0 1.99.9 1.99 2s-.89 2-2 2v4c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2v-4c-1.1 0-2-.9-2-2s.9-2 2-2zm-2-1.46c-1.19.69-2 1.99-2 3.46s.81 2.77 2 3.46V18H4v-2.54c1.19-.69 2-1.99 2-3.46 0-1.48-.8-2.77-1.99-3.46L4 6h16v2.54zM11 15h2v2h-2v-2zm0-4h2v2h-2v-2zm0-4h2v2h-2V7z" />
      </svg>
    ),
  },
  {
    id: 'news',
    label: 'News',
    path: '/news',
    bg: '#EEF2FF',
    color: '#4F46E5',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M22 3l-1.67 1.67L18.67 3 17 4.67 15.33 3l-1.66 1.67L12 3l-1.67 1.67L8.67 3 7 4.67 5.33 3 3.67 4.67 2 3v16c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V3zM11 17H7v-2h4v2zm6 0h-4v-2h4v2zm1-5H6v-2h12v2zm0-4H6V6h12v2z" />
      </svg>
    ),
  },
  {
    id: 'history',
    label: 'History',
    path: '/transactions',
    bg: '#F0FDF4',
    color: '#16A34A',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M13 3c-4.97 0-9 4.03-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7c-1.93 0-3.68-.79-4.94-2.06l-1.42 1.42C8.27 19.99 10.51 21 13 21c4.97 0 9-4.03 9-9s-4.03-9-9-9zm-1 5v5l4.28 2.54.72-1.21-3.5-2.08V8H12z" />
      </svg>
    ),
  },
  {
    id: 'outlets',
    label: 'Outlets',
    path: '/outlets',
    bg: '#FDF4FF',
    color: '#9333EA',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
      </svg>
    ),
  },
];

export default function QuickNav({ merchantId, onVouchersClick }) {
  const navigate = useNavigate();

  const handleClick = (item) => {
    if (item.id === 'vouchers' && onVouchersClick) {
      onVouchersClick();
      return;
    }
    navigate(merchantId ? `${item.path}?m=${merchantId}` : item.path);
  };

  return (
    <div className="quick-nav">
      <h3 className="section-title">Quick Access</h3>
      <div className="quick-nav-grid">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className="quick-nav-item"
            onClick={() => handleClick(item)}
          >
            <div className="quick-nav-icon" style={{ background: item.bg, color: item.color }}>
              {item.icon}
            </div>
            <span className="quick-nav-label">{item.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
