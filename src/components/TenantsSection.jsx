import { useNavigate } from 'react-router-dom';
import './TenantsSection.css';

const HOME_LIMIT = Number(import.meta.env.VITE_HOME_TENANTS_LIMIT) || 4;

export default function TenantsSection({ tenants = [] }) {
  const navigate = useNavigate();
  if (!tenants.length) return null;

  const visible = tenants.slice(0, HOME_LIMIT);
  const hasMore = tenants.length > HOME_LIMIT;

  return (
    <div className="tenants-section">
      <div className="tenants-section-header">
        <h3 className="section-title">Our Tenants</h3>
        {hasMore && (
          <button className="see-all-btn" onClick={() => navigate('/tenants')}>
            View All
          </button>
        )}
      </div>

      <div className="tenants-list">
        {visible.map((tenant) => (
          <article
            key={tenant.id}
            className="tenant-card"
            onClick={() => navigate('/tenant-detail', { state: { item: tenant } })}
          >
            <div
              className="tenant-card-image"
              aria-label={tenant.name}
            >
              {tenant.image && (
                <img src={tenant.image} alt={tenant.name} className="tenant-card-img-el" />
              )}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
