import { useNavigate } from 'react-router-dom';
import './NewsSection.css';

const CATEGORY_META = {
  'Promotion':    { color: '#EA580C', bg: '#FFF7ED' },
  'New Arrival':  { color: '#16A34A', bg: '#F0FDF4' },
  'Event':        { color: '#7C3AED', bg: '#F5F3FF' },
  'Offer':        { color: '#0284C7', bg: '#F0F9FF' },
  'New Menu':     { color: '#0D9488', bg: '#F0FDFA' },
  'Announcement': { color: '#64748B', bg: '#F8FAFC' },
};

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-MY', { day: 'numeric', month: 'short' });
}

export default function NewsSection({ news = [], merchantId }) {
  const navigate = useNavigate();

  // Group by category, preserving insertion order
  const grouped = {};
  news.forEach((item) => {
    if (!grouped[item.category]) grouped[item.category] = [];
    grouped[item.category].push(item);
  });

  if (news.length === 0) return null;

  return (
    <div className="news-section">
      <div className="news-section-header">
        <h3 className="section-title">What&apos;s Happening</h3>
        <button
          className="see-all-btn"
          onClick={() => navigate(merchantId ? `/news?m=${merchantId}` : '/news')}
        >
          See all
        </button>
      </div>

      {Object.entries(grouped).map(([category, items]) => {
        const meta = CATEGORY_META[category] || { color: '#64748B', bg: '#F8FAFC' };
        return (
          <div key={category} className="news-rail">
            <div className="news-rail-label-wrap">
              <span className="news-rail-label" style={{ color: meta.color, background: meta.bg }}>
                {category}
              </span>
            </div>

            <div className="news-scroll">
              {items.map((item) => (
                <article key={item.id} className="news-card">
                  <div className="news-card-image" style={{ background: item.bg }} />
                  <div className="news-card-body">
                    <h4 className="news-card-title">{item.title}</h4>
                    <p className="news-card-desc">{item.description}</p>
                    <time className="news-card-date" dateTime={item.date}>
                      {formatDate(item.date)}
                    </time>
                  </div>
                </article>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
