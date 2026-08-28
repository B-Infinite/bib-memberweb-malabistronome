import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getHighlightPromotionList, getBrandList, CLIENT_ID } from '../api/member.api';
import PageHeader from '../components/PageHeader';
import ImageSlider from '../components/ImageSlider';
import TenantsSection from '../components/TenantsSection';
import AppNav from '../components/AppNav';
import './Home.css';

/** Map a GetBrandListV2 item to the shape TenantsSection / TenantDetailPage expect. */
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

/** Map a highlight promotion API object to the shape ImageSlider expects. */
function mapPromoToSlide(p) {
  return {
    id:          p.promotionID,
    title:       p.promotionTitle || '',
    image:       p.promotionImage || '',
    description: p.validPeriod   || '',
    category:    p.companyName || p.clientDisplayName || '',
    bg:          'linear-gradient(135deg, #1F3C28 0%, #2D5A40 100%)',
    _raw: p,
  };
}

/**
 * Module-level cache — survives re-mounts (navigation) but clears on full
 * page reload (i.e. fresh login). Never shown as a loading shimmer again
 * once populated.
 */
let promoCache  = null;
let brandsCache = null;

export default function Home() {
  const { user } = useAuth();
  const navigate  = useNavigate();

  // Initialise from cache so slides are visible instantly on return visits
  const [slides, setSlides]             = useState(() => promoCache ?? []);
  const [promoLoading, setPromoLoading] = useState(promoCache === null);

  const [brands, setBrands]             = useState(() => brandsCache ?? []);

  // Always refresh in the background; only show shimmer on first load
  useEffect(() => {
    getHighlightPromotionList()
      .then((res) => {
        const list   = res.data?.responseData?.highlightPromotionList ?? [];
        const mapped = list.map(mapPromoToSlide);
        promoCache   = mapped;       // save for next visit
        setSlides(mapped);
      })
      .catch(() => {
        if (!promoCache) setSlides([]);
      })
      .finally(() => setPromoLoading(false));
  }, []);

  // Fetch brand/tenant list — same silent-refresh cache pattern
  useEffect(() => {
    getBrandList()
      .then((res) => {
        const list   = res.data?.responseData?.brandList ?? [];
        // Filter out the mall's own entry (CLIENT_ID) — it's not a tenant
        const mapped = list
          .filter((b) => String(b.merchantHQID) !== String(CLIENT_ID))
          .map(mapBrand);
        brandsCache = mapped;
        setBrands(mapped);
      })
      .catch(() => {
        if (!brandsCache) setBrands([]);
      });
  }, []);

  return (
    <div className="home-page">

      {/* ── Shared header: greeting + points banner ── */}
      <PageHeader />

      {/* ── Scrollable content ── */}
      <div className="home-content">

        <div className="home-slider-section">
          <div className="home-slider-header">
            <h3 className="section-title">News &amp; Promotions</h3>
            {slides.length > 0 && (
              <button
                className="see-all-btn"
                onClick={() => navigate('/all-news', {
                  state: {
                    title: 'News & Promotions',
                    items: slides.map(s => ({
                      ...s,
                      // Flatten for ListAll / DetailPage
                      title:       s.title,
                      image:       s.image,
                      description: s.description,
                    })),
                    type: 'news',
                  },
                })}
              >
                View All
              </button>
            )}
          </div>

          {promoLoading ? (
            <div className="home-slider-loading">
              <div className="home-slider-shimmer" />
            </div>
          ) : slides.length === 0 ? (
            <div className="home-slider-empty">No promotions right now</div>
          ) : (
            <ImageSlider
              slides={slides}
              onSlideClick={(slide) =>
                navigate('/news-detail', {
                  state: {
                    item: {
                      ...slide,
                      // Ensure DetailPage fields are present
                      title:       slide.title,
                      image:       slide.image,
                      description: slide.description,
                      date:        slide._raw?.postingDateStart ?? null,
                      category:    slide.category,
                    },
                    type: 'news',
                  },
                })
              }
            />
          )}
        </div>

        <TenantsSection tenants={brands} />

      </div>

      <AppNav active="home" />

    </div>
  );
}
