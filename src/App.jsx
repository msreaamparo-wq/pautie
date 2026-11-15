import { useState, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Signature from './components/Signature.jsx';
import Invitation from './sections/Invitation.jsx';
import Milestones from './sections/Milestones.jsx';
import Gallery from './sections/Gallery.jsx';
import Countdown from './sections/Countdown.jsx';
import Rsvp from './sections/Rsvp.jsx';
import Closing from './sections/Closing.jsx';
import MusicPlayer from './components/MusicPlayer.jsx';

export default function App() {
  const [signed, setSigned] = useState(false);            // opening signature finished?
  const [celebrationOpen, setCelebrationOpen] = useState(false);
  const finishSignature = useCallback(() => setSigned(true), []);

  // Music does not start automatically.
  // The guest must tap the Play button (MusicPlayer) first.
  const openCelebration = () => {
    setCelebrationOpen(true);
    requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  if (celebrationOpen) {
    return (
      <>
        <main>
          <Milestones />
          <Gallery />
          <Countdown />
          <Rsvp />
          <Closing />
        </main>
        <MusicPlayer />
      </>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {!signed ? (
        <Signature key="signature" onDone={finishSignature} />
      ) : (
        <Invitation key="invitation" onOpen={openCelebration} />
      )}
    </AnimatePresence>
  );
}
