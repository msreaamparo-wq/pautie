import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { AlertCircle, Check, Heart, Loader2, Minus, PartyPopper, Plus, Send } from 'lucide-react';
import Section from '../components/Section.jsx';
import { CONFIG } from '../config.js';
import { supabase, supabaseReady } from '../supabase.js';

const label = 'text-[11px] font-bold uppercase tracking-[0.16em] text-ink/60';
const field =
  'w-full rounded-xl border border-sky bg-white px-4 py-3 text-ink placeholder:text-ink/35 transition focus:border-ocean focus:outline-none focus:ring-4 focus:ring-sky/60';

export default function Rsvp() {
  const [name, setName] = useState('');
  const [attending, setAttending] = useState(true);
  const [guests, setGuests] = useState(1);
  const [note, setNote] = useState('');
  const [status, setStatus] = useState('idle'); // idle | sending | done | error
  const [error, setError] = useState('');
  const [sent, setSent] = useState(null);

  const summary = () =>
    `RSVP for ${CONFIG.name}’s 1st Birthday\nName: ${name.trim()}\nAttending: ${
      attending ? 'Yes' : 'No'
    }\nGuests: ${attending ? guests : 0}\nMessage: ${note.trim() || '-'}`;

  const reset = () => {
    setName('');
    setAttending(true);
    setGuests(1);
    setNote('');
    setError('');
    setStatus('idle');
    setSent(null);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (status === 'sending') return;

    // Hidden spam trap: real guests never fill this in.
    if (new FormData(event.currentTarget).get('website')) return;

    if (!name.trim()) {
      setError('Please enter your name.');
      setStatus('error');
      return;
    }

    setStatus('sending');
    setError('');

    const row = {
      name: name.trim(),
      attending,
      guests: attending ? guests : 0,
      message: note.trim() || null,
    };

    if (!supabaseReady) {
      setError('RSVP saving is not set up yet. Please copy your reply below and send it to the family.');
      setStatus('error');
      return;
    }

    const { error: insertError } = await supabase.from('rsvps').insert(row);

    if (insertError) {
      console.error('RSVP error:', insertError);
      setError('Sorry, we could not send your RSVP. Please try again, or copy your reply below and send it to the family.');
      setStatus('error');
      return;
    }

    setSent(row);
    setStatus('done');
  };

  return (
    <Section id="rsvp" title="RSVP" className="bg-gradient-to-b from-sky/60 via-mist to-cream">
      <div className="mx-auto max-w-xl overflow-hidden rounded-[2rem] border border-champagne/70 bg-ivory shadow-soft">
        {/* Header */}
        <div className="border-b border-champagne/60 bg-gradient-to-br from-mist via-sky/40 to-sun/30 px-6 py-6 text-center sm:px-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.26em] text-gold">Kindly reply</p>
          <p className="mt-2 font-serif text-xl font-bold text-ink sm:text-2xl">
            Will you celebrate with us?
          </p>
          <p className="mt-1.5 text-sm text-ink/60">
            {CONFIG.dateDisplay} &middot; {CONFIG.timeDisplay} &middot; {CONFIG.venue}
          </p>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {status === 'done' && sent ? (
            <motion.div
              key="done"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="px-6 py-10 text-center sm:px-8"
              role="status"
            >
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mist text-ocean shadow-card">
                {sent.attending ? <PartyPopper size={28} /> : <Heart size={28} />}
              </span>
              <h3 className="mt-5 font-serif text-2xl font-bold text-ink">
                {sent.attending ? 'Thank you, see you there!' : 'Thank you for letting us know'}
              </h3>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink/65">
                {sent.attending
                  ? `We saved your RSVP for ${sent.guests} ${sent.guests === 1 ? 'guest' : 'guests'}. We can’t wait to celebrate with you, ${sent.name}!`
                  : `We will miss you, ${sent.name}, but we are grateful for your love and thoughts.`}
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-7 rounded-full border border-ink/15 bg-white px-6 py-2.5 text-sm font-semibold text-ink transition hover:border-ink/30 hover:bg-mist"
              >
                Send another RSVP
              </button>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              onSubmit={submit}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid gap-5 px-6 py-7 sm:px-8 sm:py-8"
            >
              {/* Name */}
              <label className="grid gap-2">
                <span className={label}>Your name</span>
                <input
                  required
                  maxLength={100}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoComplete="name"
                  placeholder="e.g. Maria Santos"
                  className={field}
                />
              </label>

              {/* Attending */}
              <fieldset className="grid gap-2">
                <legend className={`${label} mb-2`}>Will you attend?</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { value: true, text: 'Yes, I’ll be there!', icon: Check },
                    { value: false, text: 'Sorry, can’t make it', icon: Heart },
                  ].map(({ value, text, icon: Icon }) => {
                    const active = attending === value;
                    return (
                      <button
                        key={text}
                        type="button"
                        role="radio"
                        aria-checked={active}
                        onClick={() => setAttending(value)}
                        className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm font-semibold transition ${
                          active
                            ? 'border-ocean bg-mist text-ink ring-2 ring-ocean/25'
                            : 'border-sky bg-white text-ink/70 hover:border-baby hover:bg-mist/60'
                        }`}
                      >
                        <span
                          className={`grid h-7 w-7 shrink-0 place-items-center rounded-full ${
                            active ? 'bg-ocean text-white' : 'bg-sky/60 text-ink/50'
                          }`}
                        >
                          <Icon size={15} strokeWidth={2.4} />
                        </span>
                        {text}
                      </button>
                    );
                  })}
                </div>
              </fieldset>

              {/* Guests */}
              <AnimatePresence initial={false}>
                {attending && (
                  <motion.div
                    key="guests"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="grid gap-2">
                      <span className={label}>Number of guests (including you)</span>
                      <div className="flex items-center justify-between rounded-xl border border-sky bg-white px-3 py-2">
                        <button
                          type="button"
                          onClick={() => setGuests((g) => Math.max(1, g - 1))}
                          disabled={guests <= 1}
                          aria-label="Fewer guests"
                          className="grid h-10 w-10 place-items-center rounded-full bg-mist text-ink transition hover:bg-sky disabled:opacity-40"
                        >
                          <Minus size={18} />
                        </button>
                        <span className="font-serif text-2xl font-bold tabular-nums text-ink" aria-live="polite">
                          {guests}
                        </span>
                        <button
                          type="button"
                          onClick={() => setGuests((g) => Math.min(20, g + 1))}
                          disabled={guests >= 20}
                          aria-label="More guests"
                          className="grid h-10 w-10 place-items-center rounded-full bg-mist text-ink transition hover:bg-sky disabled:opacity-40"
                        >
                          <Plus size={18} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Message */}
              <label className="grid gap-2">
                <span className={label}>
                  Message for Shaun <span className="font-medium normal-case tracking-normal text-ink/40">(optional)</span>
                </span>
                <textarea
                  rows="3"
                  maxLength={500}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Write a birthday wish..."
                  className={`${field} resize-none`}
                />
              </label>

              {/* Spam trap (hidden) */}
              <input type="text" name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden="true" />

              {/* Error */}
              {status === 'error' && error && (
                <div role="alert" className="rounded-xl border border-gold/40 bg-sun/40 p-4 text-sm text-ink">
                  <p className="flex items-start gap-2 font-semibold">
                    <AlertCircle size={17} className="mt-0.5 shrink-0 text-gold" />
                    {error}
                  </p>
                  {error.includes('copy your reply') && name.trim() && (
                    <pre className="mt-3 whitespace-pre-wrap rounded-lg bg-white/70 p-3 font-sans text-[13px]">{summary()}</pre>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-6 py-3.5 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(36,65,95,0.24)] transition hover:-translate-y-0.5 hover:bg-ink/90 disabled:translate-y-0 disabled:opacity-70"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 size={17} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={17} /> Send RSVP
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </Section>
  );
}
