// Efectos de sonido y música de fondo.
import { BOSSES } from '../config/enemies.js';
import { S } from './state.js';

export const sfx = n => { try { const a = new Audio('sounds/' + encodeURIComponent(n) + '.mp3'); a.volume = 0.8; a.play().catch(() => {}); } catch (e) {} };
export const meow = () => sfx('gato_enojado');
let curMusic = null, curName = null;
export function playMusic(n) {
  if (n === curName) return;
  if (curMusic) curMusic.pause();
  curName = n; if (typeof Audio === 'undefined') return;
  curMusic = new Audio('sounds/' + encodeURIComponent(n) + '.mp3'); curMusic.loop = true; curMusic.volume = 0.4; curMusic.play().catch(() => {});
}
export function stopMusic() { if (curMusic) curMusic.pause(); curMusic = null; curName = null; }
export function musicTick() {
  if (S.phase !== 'wave' && !curName) return;
  const b = S.enemies.find(e => e.boss);
  playMusic(b ? BOSSES[b.boss].track : 'wavebasic');
}
