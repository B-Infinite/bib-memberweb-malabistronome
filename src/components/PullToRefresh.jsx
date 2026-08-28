import { useRef, useState, useEffect } from 'react';
import './PullToRefresh.css';

const COMMIT_PX   = 10;   // must move this many px DOWN before PTR activates
const TRIGGER_PX  = 64;   // release past this to fire refresh
const MAX_DRAG    = 88;   // hard cap with rubber-band feel
const HOLD_PX     = 56;   // height kept open while the spinner runs

/**
 * Drop-in scrollable container with pull-to-refresh.
 *
 * Key design choices that prevent false triggers:
 *  1. startTop  — we capture scrollTop at TOUCH-START. If the user was
 *     scrolled down even 1 px, PTR is locked out for that whole gesture.
 *     This stops "scroll back to top via momentum → finger still moving →
 *     triggers refresh" from ever happening.
 *  2. COMMIT_PX — we need a deliberate downward move of ≥10 px before we
 *     decide it's a pull rather than a tap or micro-jitter.
 *  3. e.preventDefault() is called ONLY after we've committed. Normal
 *     scroll events are never blocked.
 */
export default function PullToRefresh({ onRefresh, children, className = '', style }) {
  const wrapRef   = useRef(null);
  const startY    = useRef(0);
  const startTop  = useRef(0);   // scrollTop captured at each touch-start
  const committed = useRef(false);
  const pullRef   = useRef(0);   // avoids stale closure in touch handlers

  const [pull, setPull]             = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [done, setDone]             = useState(false);

  // ── Scroll-to-top on mount (fixes shared scroll between pages) ──────────────
  useEffect(() => {
    wrapRef.current?.scrollTo(0, 0);
  }, []);

  // ── Touch event handlers ────────────────────────────────────────────────────
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    function onTouchStart(e) {
      committed.current = false;
      startY.current    = e.touches[0].clientY;
      startTop.current  = el.scrollTop; // snapshot — never rechecked during move
    }

    function onTouchMove(e) {
      if (refreshing) return;

      const dy = e.touches[0].clientY - startY.current;

      if (!committed.current) {
        // Gate 1: element must have been at the very top when finger landed
        if (startTop.current > 0) return;
        // Gate 2: movement must be clearly downward before we commit
        if (dy < COMMIT_PX) return;
        committed.current = true;
      }

      // Once committed, track the pull distance
      if (dy <= 0) {
        // Finger went back up — abort
        committed.current = false;
        pullRef.current   = 0;
        setPull(0);
        return;
      }

      // Rubber-band: subtract commit threshold so the start feels instant
      const clamped     = Math.min((dy - COMMIT_PX) * 0.48, MAX_DRAG);
      pullRef.current   = clamped;
      setPull(clamped);
      e.preventDefault(); // prevent scroll ONLY while genuinely pulling
    }

    function onTouchEnd() {
      if (!committed.current) return;
      committed.current = false;
      if (pullRef.current >= TRIGGER_PX) {
        doRefresh();
      } else {
        pullRef.current = 0;
        setPull(0);
      }
    }

    el.addEventListener('touchstart',  onTouchStart, { passive: true  });
    el.addEventListener('touchmove',   onTouchMove,  { passive: false }); // non-passive for preventDefault
    el.addEventListener('touchend',    onTouchEnd,   { passive: true  });
    el.addEventListener('touchcancel', onTouchEnd,   { passive: true  });

    return () => {
      el.removeEventListener('touchstart',  onTouchStart);
      el.removeEventListener('touchmove',   onTouchMove);
      el.removeEventListener('touchend',    onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [refreshing]);

  // ── Refresh execution ───────────────────────────────────────────────────────
  async function doRefresh() {
    setRefreshing(true);
    setDone(false);
    pullRef.current = HOLD_PX;
    setPull(HOLD_PX);
    try {
      await onRefresh?.();
    } catch { /* silent */ } finally {
      setDone(true);
      await delay(480);
      setRefreshing(false);
      setDone(false);
      pullRef.current = 0;
      setPull(0);
    }
  }

  // ── Derived display values ──────────────────────────────────────────────────
  const isLivePull  = pull > 0 && !refreshing;
  const progress    = Math.min(pull / TRIGGER_PX, 1);
  const indicatorH  = refreshing ? HOLD_PX : pull;
  const arrowDeg    = Math.round(progress * 300);

  return (
    <div ref={wrapRef} className={`ptr-wrap ${className}`} style={style}>

      {/* Indicator — expands from 0 height as user pulls */}
      <div
        className={`ptr-indicator-row${isLivePull ? ' is-pulling' : ''}`}
        style={{ height: indicatorH }}
      >
        <div className="ptr-icon-shell">
          {done ? (
            <svg className="ptr-check" viewBox="0 0 24 24" fill="none" width="22" height="22">
              <circle cx="12" cy="12" r="10" stroke="var(--primary)" strokeWidth="2"
                fill="var(--primary)" fillOpacity=".1" />
              <path d="M7 12.5l3.5 3.5L17 9" stroke="var(--primary)" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ) : refreshing ? (
            <svg className="ptr-spinner" viewBox="0 0 24 24" fill="none" width="22" height="22">
              <circle cx="12" cy="12" r="10" stroke="var(--border)" strokeWidth="2.5" />
              <path d="M12 2a10 10 0 0 1 10 10" stroke="var(--primary)"
                strokeWidth="2.5" strokeLinecap="round" />
            </svg>
          ) : (
            <svg
              viewBox="0 0 24 24" fill="none" width="20" height="20"
              style={{ opacity: progress, transform: `rotate(${arrowDeg}deg)` }}
            >
              <path d="M12 5v14M5 12l7 7 7-7" stroke="var(--primary)"
                strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}

const delay = (ms) => new Promise((r) => setTimeout(r, ms));
