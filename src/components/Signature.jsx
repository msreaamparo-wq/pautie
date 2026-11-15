import { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { CONFIG } from '../config.js';

// Opening screen: the baby's full name is "written" letter by letter
// (S, h, a, u, n ...) and, once finished, goes straight to the invitation.
// No tap needed. Edit the name in config.js (fullName).

const LETTER_DELAY = 0.11; // seconds between each letter
const LETTER_FADE = 0.35;  // seconds for one letter to appear
const HOLD_AFTER = 1.0;    // seconds to hold after the last letter / flourish

export default function Signature({ onDone }) {
  const reduce = useReducedMotion();
  const words = CONFIG.fullName.split(' ');
  const total = CONFIG.fullName.replace(/ /g, '').length;
  const step = reduce ? 0 : LETTER_DELAY;
  const writeTime = total * step + LETTER_FADE;
  const flourishDelay = writeTime;
  const doneAt = (reduce ? 1.2 : writeTime + 0.8 + HOLD_AFTER) * 1000;

  useEffect(() => {
    const t = setTimeout(onDone, doneAt);
    return () => clearTimeout(t);
  }, [onDone, doneAt]);

  let n = 0; // running letter index across all words

  return (
    <motion.section
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7 }}
      className="relative isolate grid min-h-[100svh] place-items-center overflow-hidden bg-gradient-to-b from-mist via-ivory to-cream px-5 text-center"
    >
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-sky/75 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-20 h-80 w-80 rounded-full bg-sun/55 blur-3xl" />

      <div className="relative w-full max-w-4xl">
        <h1
          aria-label={CONFIG.fullName}
          className="flex flex-wrap justify-center gap-x-5 gap-y-1 text-[2.9rem] leading-[1.25] text-ink sm:text-7xl"
          style={{ fontFamily: '"Great Vibes", "Snell Roundhand", "Brush Script MT", cursive' }}
        >
          {words.map((word, wi) => (
            <span key={wi} aria-hidden="true" className="whitespace-nowrap">
              {word.split('').map((ch) => {
                const i = n++;
                return (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, filter: 'blur(5px)' }}
                    animate={{ opacity: 1, filter: 'blur(0px)' }}
                    transition={{ delay: i * step, duration: reduce ? 0 : LETTER_FADE, ease: 'easeOut' }}
                  >
                    {ch}
                  </motion.span>
                );
              })}
            </span>
          ))}
        </h1>

        {/* Signature flourish drawn under the name after the last letter */}
        <svg viewBox="0 0 400 24" className="mx-auto mt-2 h-6 w-64 sm:w-96" fill="none" aria-hidden="true">
          <motion.path
            d="M4 14 C 60 2, 110 22, 170 12 S 280 4, 340 12 S 380 14, 396 8"
            stroke="#b8922e"
            strokeWidth="2.5"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ delay: flourishDelay, duration: reduce ? 0 : 0.8, ease: 'easeInOut' }}
          />
        </svg>
      </div>
    </motion.section>
  );
}
