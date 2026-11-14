import { motion } from 'framer-motion';
import { reveal } from '../animations/variants.js';

export default function Section({ id, title, children, className = '' }) {
  return (
    <section id={id} className={`px-5 py-20 sm:py-28 ${className}`}>
      <div className="mx-auto max-w-5xl">
        {title && (
          <motion.div {...reveal} className="mb-12 text-center">
            <h2 className="font-serif text-3xl font-bold tracking-wide text-ink sm:text-4xl">
              {title}
            </h2>
            <div className="mx-auto mt-4 flex items-center justify-center gap-3" aria-hidden="true">
              <span className="h-px w-12 bg-gold/50" />
              <span className="h-1.5 w-1.5 rotate-45 bg-gold" />
              <span className="h-px w-12 bg-gold/50" />
            </div>
          </motion.div>
        )}
        {children}
      </div>
    </section>
  );
}
