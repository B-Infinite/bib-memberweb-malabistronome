import { useState, useEffect, useRef, useCallback } from 'react';
import './ImageSlider.css';

const AUTO_PLAY_MS  = 4500;
const SWIPE_THRESHOLD = 40;   // px needed to register a swipe
const DRAG_RESISTANCE = 0.35; // dampens drag beyond the first/last slide

export default function ImageSlider({ slides = [], onSlideClick }) {
  const [current, setCurrent]       = useState(0);
  const [dragging, setDragging]     = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const timerRef    = useRef(null);
  const startXRef   = useRef(null);
  const trackRef    = useRef(null);

  // ── Auto-play ─────────────────────────────────────────────────────────────
  const next = useCallback(() => {
    setCurrent(c => (c + 1) % slides.length);
  }, [slides.length]);

  const resetTimer = useCallback(() => {
    clearInterval(timerRef.current);
    if (slides.length > 1) {
      timerRef.current = setInterval(next, AUTO_PLAY_MS);
    }
  }, [next, slides.length]);

  useEffect(() => {
    if (slides.length < 2) return;
    timerRef.current = setInterval(next, AUTO_PLAY_MS);
    return () => clearInterval(timerRef.current);
  }, [next, slides.length]);

  const goTo = useCallback((i) => {
    setCurrent(i);
    resetTimer();
  }, [resetTimer]);

  // ── Pointer / touch drag ──────────────────────────────────────────────────
  const handlePointerDown = (e) => {
    // Ignore right-clicks and multi-touch
    if (e.button !== undefined && e.button !== 0) return;
    startXRef.current = e.clientX ?? e.touches?.[0]?.clientX;
    setDragging(true);
    setDragOffset(0);
    clearInterval(timerRef.current);
    // Capture so we keep receiving events even if pointer leaves the element
    if (e.currentTarget.setPointerCapture && e.pointerId !== undefined) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!dragging || startXRef.current === null) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    if (clientX === undefined) return;
    let diff = clientX - startXRef.current;

    // Apply resistance at the edges so it doesn't scroll freely past first/last
    const atStart = current === 0 && diff > 0;
    const atEnd   = current === slides.length - 1 && diff < 0;
    if (atStart || atEnd) diff *= DRAG_RESISTANCE;

    setDragOffset(diff);
  };

  const handlePointerUp = (e) => {
    if (!dragging) return;
    setDragging(false);

    const clientX = e.clientX ?? e.changedTouches?.[0]?.clientX;
    const diff = startXRef.current !== null && clientX !== undefined
      ? clientX - startXRef.current
      : 0;

    if (Math.abs(diff) >= SWIPE_THRESHOLD) {
      if (diff < 0 && current < slides.length - 1) {
        goTo(current + 1);
      } else if (diff > 0 && current > 0) {
        goTo(current - 1);
      } else {
        // Bounced at edge — reset timer without changing slide
        resetTimer();
      }
    } else {
      // Short drag — treat as a tap (click)
      if (Math.abs(diff) < 8) onSlideClick?.(slides[current]);
      resetTimer();
    }

    setDragOffset(0);
    startXRef.current = null;
  };

  if (!slides.length) return null;

  // translateX = slide index offset + live drag (converted to %)
  const trackWidth = trackRef.current?.offsetWidth || 1;
  const translateX = -(current * 100) + (dragOffset / trackWidth) * 100;

  return (
    <div className="img-slider" ref={trackRef}>
      {/* ── Sliding track ── */}
      <div
        className={`img-slider-track${dragging ? ' is-dragging' : ''}`}
        style={{ transform: `translateX(${translateX}%)` }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        /* Touch fallback for browsers that don't support Pointer Events */
        onTouchStart={handlePointerDown}
        onTouchMove={handlePointerMove}
        onTouchEnd={handlePointerUp}
      >
        {slides.map((slide, i) => (
          <div
            key={slide.id ?? i}
            className="img-slider-slide"
            style={{ background: slide.bg }}
            aria-hidden={i !== current}
          >
            {slide.image && (
              <img
                src={slide.image}
                alt={slide.title}
                className="img-slider-img"
                draggable={false}
              />
            )}

            {/* Text overlay */}
            <div className="img-slider-overlay">
              {slide.category && (
                <span className="img-slider-badge">{slide.category}</span>
              )}
              <h3 className="img-slider-title">{slide.title}</h3>
              <p className="img-slider-desc">{slide.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Dot indicators (outside track, always visible) ── */}
      {slides.length > 1 && (
        <div className="img-slider-dots" role="tablist" aria-label="Slides">
          {slides.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Slide ${i + 1}`}
              className={`img-slider-dot${i === current ? ' active' : ''}`}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
