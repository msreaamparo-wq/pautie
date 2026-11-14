import { useEffect, useState } from 'react';
import Section from '../components/Section.jsx';
import { CONFIG } from '../config.js';

const target = new Date(CONFIG.startsAt).getTime();
const calc = () => Math.max(0, target - Date.now());

export default function Countdown() {
  const [ms, setMs] = useState(calc);

  useEffect(() => {
    const t = setInterval(() => setMs(calc()), 1000);
    return () => clearInterval(t);
  }, []);

  const s = Math.floor(ms / 1000);
  const parts = [
    ['Days', Math.floor(s / 86400)],
    ['Hours', Math.floor((s % 86400) / 3600)],
    ['Minutes', Math.floor((s % 3600) / 60)],
    ['Seconds', s % 60],
  ];

  return (
    <Section id="countdown" className="bg-gradient-to-b from-cream via-mist to-sky/60">
      {ms > 0 ? (
        <div className="text-center">
          <p className="text-[11px] font-bold uppercase tracking-[0.28em] text-gold">Save the date</p>
          <h2 className="mt-3 font-serif text-3xl font-bold text-ink sm:text-4xl">
            DAYS UNTIL THE BIG DAY!
          </h2>
          <p className="mt-3 text-sm text-ink/60">
            {CONFIG.dateDisplay} &middot; {CONFIG.timeDisplay} &middot; {CONFIG.venue}
          </p>

          <div className="mx-auto mt-10 grid max-w-xl grid-cols-4 gap-3" role="timer" aria-live="off">
            {parts.map(([label, value]) => (
              <div
                key={label}
                className="rounded-2xl border border-champagne/70 bg-ivory py-5 shadow-card"
              >
                <div className="font-serif text-3xl font-extrabold tabular-nums text-ink sm:text-5xl">
                  {String(value).padStart(2, '0')}
                </div>
                <div className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-gold sm:text-xs">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <h2 className="text-center font-serif text-4xl font-extrabold text-gold sm:text-5xl">
          THE CELEBRATION HAS BEGUN!
        </h2>
      )}
    </Section>
  );
}
