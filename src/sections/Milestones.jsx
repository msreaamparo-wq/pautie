import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Camera, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Section from '../components/Section.jsx';
import { CONFIG } from '../config.js';

// Swipe left/right on touch screens.
function useSwipe(onSwipe) {
  const startX = useRef(null);
  return {
    onTouchStart: (e) => { startX.current = e.touches[0].clientX; },
    onTouchEnd: (e) => {
      if (startX.current === null) return;
      const dx = e.changedTouches[0].clientX - startX.current;
      startX.current = null;
      if (Math.abs(dx) > 40) onSwipe(dx < 0 ? 1 : -1);
    },
  };
}

function MonthCard({ month, images, index, onOpen }) {
  const [active, setActive] = useState(0);
  const total = images.length;
  const has = total > 0;
  const multiple = total > 1;

  const go = (dir) => setActive((c) => (c + dir + total) % total);
  const swipe = useSwipe(go);

  return (
    <motion.li
      className="ms-card"
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, delay: (index % 3) * 0.06, ease: 'easeOut' }}
    >
      <div className="ms-photo" {...(multiple ? swipe : {})}>
        <button
          type="button"
          className="ms-stage"
          disabled={!has}
          onClick={() => has && onOpen(images, active, month)}
          aria-label={has ? `Open month ${month} photos` : `Month ${month}`}
        >
          {has ? (
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.img
                key={images[active]}
                src={images[active]}
                alt={`Month ${month}, photo ${active + 1}`}
                loading="lazy"
                decoding="async"
                draggable="false"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              />
            </AnimatePresence>
          ) : (
            <span className="ms-empty"><Camera size={22} strokeWidth={1.3} /></span>
          )}
        </button>

        {multiple && (
          <>
            <button type="button" className="ms-arrow prev" onClick={() => go(-1)} aria-label="Previous photo">
              <ChevronLeft size={16} />
            </button>
            <button type="button" className="ms-arrow next" onClick={() => go(1)} aria-label="Next photo">
              <ChevronRight size={16} />
            </button>
          </>
        )}
      </div>

      <div className="ms-foot">
        <span className="ms-num">{String(month).padStart(2, '0')}</span>
        <span className="ms-label">Month{month > 1 ? 's' : ''}</span>
        {multiple && <span className="ms-count">{active + 1}/{total}</span>}
      </div>
    </motion.li>
  );
}

export default function Milestones() {
  const [lightbox, setLightbox] = useState(null);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  const getImages = (month) => {
    const album = CONFIG.milestoneAlbums?.[month - 1];
    if (Array.isArray(album) && album.length) return album.filter(Boolean);
    const single = CONFIG.milestoneImages?.[month - 1];
    return single ? [single] : [];
  };

  const open = (images, index, month) => setLightbox({ images, index, month });

  const change = (dir) =>
    setLightbox((c) =>
      c ? { ...c, index: (c.index + dir + c.images.length) % c.images.length } : null
    );
  const swipe = useSwipe(change);

  useEffect(() => {
    if (!lightbox) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowLeft') change(-1);
      if (e.key === 'ArrowRight') change(1);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [lightbox === null]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Section id="milestones" title="12 MONTHS OF PURE HAPPINESS">
      <ul className="ms-grid">
        {months.map((m, i) => (
          <MonthCard key={m} month={m} index={i} images={getImages(m)} onOpen={open} />
        ))}
      </ul>

      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="ms-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            role="dialog"
            aria-modal="true"
          >
            <div className="ms-lb-body" onClick={(e) => e.stopPropagation()} {...swipe}>
              <img
                src={lightbox.images[lightbox.index]}
                alt={`Month ${lightbox.month}, photo ${lightbox.index + 1}`}
                draggable="false"
              />
              <p className="ms-lb-caption">
                Month {lightbox.month}
                {lightbox.images.length > 1 && <span> · {lightbox.index + 1} / {lightbox.images.length}</span>}
              </p>
            </div>

            <button type="button" className="ms-lb-btn close" onClick={() => setLightbox(null)} aria-label="Close">
              <X size={20} />
            </button>
            {lightbox.images.length > 1 && (
              <>
                <button type="button" className="ms-lb-btn prev" onClick={(e) => { e.stopPropagation(); change(-1); }} aria-label="Previous photo">
                  <ChevronLeft size={22} />
                </button>
                <button type="button" className="ms-lb-btn next" onClick={(e) => { e.stopPropagation(); change(1); }} aria-label="Next photo">
                  <ChevronRight size={22} />
                </button>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .ms-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 22px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0;
          list-style: none;
        }
        .ms-card {
          min-width: 0;
          padding: 8px 8px 12px;
          border: 1px solid #e4eef8;
          border-radius: 20px;
          background: #fffdf8;
          box-shadow: 0 10px 28px rgba(36, 65, 95, .07);
          transition: transform .35s ease, box-shadow .35s ease;
        }
        .ms-card:hover { transform: translateY(-4px); box-shadow: 0 16px 36px rgba(36, 65, 95, .12); }

        .ms-photo {
          position: relative;
          aspect-ratio: 3 / 4;
          overflow: hidden;
          border-radius: 14px;
          background: linear-gradient(160deg, #edf7ff, #dcecfa);
        }
        .ms-stage { position: absolute; inset: 0; display: block; width: 100%; height: 100%; cursor: zoom-in; }
        .ms-stage:disabled { cursor: default; }
        .ms-stage img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center 30%;
          transition: transform .8s cubic-bezier(.2, .7, .2, 1);
        }
        .ms-card:hover .ms-stage img { transform: scale(1.04); }
        .ms-empty { display: grid; place-items: center; width: 100%; height: 100%; color: #9ec9f2; }

        .ms-arrow {
          position: absolute;
          top: 50%;
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          color: #24415f;
          background: rgba(255, 253, 248, .88);
          box-shadow: 0 4px 12px rgba(36, 65, 95, .16);
          transform: translateY(-50%);
          opacity: 0;
          transition: opacity .25s ease, background .2s ease;
        }
        .ms-arrow:hover { background: #fff; }
        .ms-arrow.prev { left: 8px; }
        .ms-arrow.next { right: 8px; }
        .ms-photo:hover .ms-arrow, .ms-arrow:focus-visible { opacity: 1; }
        @media (hover: none) { .ms-arrow { opacity: .85; } }

        .ms-foot {
          display: flex;
          align-items: baseline;
          gap: 7px;
          padding: 11px 6px 0;
        }
        .ms-num { color: #b8922e; font: 400 24px/1 Georgia, serif; }
        .ms-label { color: #6f8fb0; font-size: 10px; font-weight: 600; letter-spacing: .18em; text-transform: uppercase; }
        .ms-count { margin-left: auto; color: #8aa3bd; font-size: 11px; font-variant-numeric: tabular-nums; }

        .ms-lightbox {
          position: fixed;
          inset: 0;
          z-index: 999;
          display: grid;
          place-items: center;
          padding: 24px;
          background: rgba(16, 30, 48, .92);
          backdrop-filter: blur(8px);
        }
        .ms-lb-body { display: grid; justify-items: center; gap: 14px; max-width: 100%; }
        .ms-lb-body img {
          display: block;
          max-width: min(92vw, 760px);
          max-height: 78vh;
          border-radius: 14px;
          object-fit: contain;
          box-shadow: 0 24px 70px rgba(0, 0, 0, .4);
        }
        .ms-lb-caption { margin: 0; color: rgba(255, 255, 255, .8); font: 13px Georgia, serif; letter-spacing: .04em; }
        .ms-lb-btn {
          position: absolute;
          display: grid;
          place-items: center;
          width: 42px;
          height: 42px;
          border-radius: 50%;
          color: #24415f;
          background: rgba(255, 253, 248, .95);
          box-shadow: 0 6px 18px rgba(0, 0, 0, .25);
          transition: background .2s ease;
        }
        .ms-lb-btn:hover { background: #fff; }
        .ms-lb-btn.close { top: 18px; right: 18px; }
        .ms-lb-btn.prev { left: 18px; top: 50%; transform: translateY(-50%); }
        .ms-lb-btn.next { right: 18px; top: 50%; transform: translateY(-50%); }

        @media (max-width: 1000px) { .ms-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 16px; } }
        @media (max-width: 720px) {
          .ms-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; padding: 0 4px; }
          .ms-card { padding: 6px 6px 10px; border-radius: 16px; }
          .ms-photo { border-radius: 11px; }
          .ms-num { font-size: 21px; }
          .ms-label { font-size: 9px; }
          .ms-lb-btn.prev { left: 8px; }
          .ms-lb-btn.next { right: 8px; }
        }
      `}</style>
    </Section>
  );
}