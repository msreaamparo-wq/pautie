import { useEffect, useState } from 'react';
import { CONFIG } from './config.js';
const NOTES = [523.25, 659.25, 783.99, 659.25, 587.33, 698.46, 880, 698.46, 659.25, 783.99, 1046.5, 783.99, 698.46, 659.25, 587.33, 523.25];
const s = { playing: false, muted: false, ctx: null, master: null, el: null, timer: null, fade: null, i: 0, subs: new Set() };
const emit = () => s.subs.forEach((f) => f({ playing: s.playing, muted: s.muted }));
function tone(f) {
  const t = s.ctx.currentTime, o = s.ctx.createOscillator(), g = s.ctx.createGain();
  o.type = 'triangle'; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.03); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.7);
  o.connect(g).connect(s.master); o.start(t); o.stop(t + 0.75);
}
// Gentle fade-in (about 2 seconds) so the music is not sudden / startling.
function fadeInFile() {
  clearInterval(s.fade);
  let v = 0;
  s.el.volume = 0;
  s.fade = setInterval(() => {
    v = Math.min(1, v + 0.05);
    s.el.volume = v;
    if (v >= 1) clearInterval(s.fade);
  }, 100);
}
export const music = {
  start() {
    if (s.playing) return;
    if (CONFIG.musicFile) {
      s.el = s.el || Object.assign(new Audio(CONFIG.musicFile), { loop: true });
      s.el.muted = s.muted;
      fadeInFile();
      s.el.play().then(() => { s.playing = true; emit(); }).catch(() => {});
      return;
    }
    s.ctx = s.ctx || new (window.AudioContext || window.webkitAudioContext)();
    s.master = s.master || s.ctx.createGain();
    s.master.connect(s.ctx.destination);
    const t = s.ctx.currentTime, target = s.muted ? 0 : 0.5;
    s.master.gain.cancelScheduledValues(t);
    s.master.gain.setValueAtTime(0, t);
    s.master.gain.linearRampToValueAtTime(target, t + 2);
    s.ctx.resume();
    s.timer = setInterval(() => tone(NOTES[s.i++ % NOTES.length]), 420);
    s.playing = true; emit();
  },
  pause() {
    clearInterval(s.timer); clearInterval(s.fade);
    if (s.el) s.el.pause();
    if (s.master) s.master.disconnect();
    s.playing = false; emit();
  },
  toggle() { s.playing ? this.pause() : this.start(); },
  mute() {
    s.muted = !s.muted;
    if (s.el) s.el.muted = s.muted;
    if (s.master) s.master.gain.value = s.muted ? 0 : 0.5;
    emit();
  }
};
export function useMusic() {
  const [st, set] = useState({ playing: s.playing, muted: s.muted });
  useEffect(() => { s.subs.add(set); return () => s.subs.delete(set); }, []);
  return st;
}
