import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getBrandList, CLIENT_ID } from '../api/member.api';
import './Tenants.css';

function mapBrand(b) {
  return {
    id:          String(b.merchantHQID),
    name:        b.companyName  || 'Brand',
    image:       b.brandImage   || '',
    description: b.description  || '',
    category:    b.category     || '',
    url:         b.url          || '',
  };
}

// Module-level cache — survives re-mounts, clears on full reload
let brandsCache = null;

export default function Tenants() {
  const navigate = useNavigate();

  const [tenants, setTenants]   = useState(() => brandsCache ?? []);
  const [loading, setLoading]   = useState(brandsCache === null);
  const [error, setError]       = useState('');

  useEffect(() => {
    getBrandList()
      .then((res) => {
        const list   = res.data?.responseData?.brandList ?? [];
        const mapped = list
          .filter((b) => String(b.merchantHQID) !== String(CLIENT_ID))
          .map(mapBrand);
        brandsCache = mapped;
        setTenants(mapped);
      })
      .catch((err) => {
        if (!brandsCache) setError(err?.message || 'Failed to load tenants.');
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="tenants-page">

      {/* ── Header ── */}
      <header className="tenants-header">
        <div className="tenants-header-inner">
          <button
            className="tenants-back-btn"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
              <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
            </svg>
          </button>
          <div className="tenants-header-text">
            <h1 className="tenants-title">Our Tenants</h1>
            {!loading && (
              <p className="tenants-subtitle">{tenants.length} brands at KevW Kopitam</p>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main className="tenants-content">

        {/* Skeleton */}
        {loading && (
          <div className="tenants-grid">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="tenant-card-skeleton" aria-hidden="true" />
            ))}
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="tenants-empty">
            <p>{error}</p>
          </div>
        )}

        {/* Empty */}
        {!loading && !error && tenants.length === 0 && (
          <div className="tenants-empty">
            <p>No tenants found.</p>
          </div>
        )}

        {/* Grid */}
        {!loading && tenants.length > 0 && (
          <div className="tenants-grid">
            {tenants.map((tenant) => (
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
                    <img
                      src={tenant.image}
                      alt={tenant.name}
                      className="tenant-card-img-el"
                    />
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

      </main>
    </div>
  );
}
