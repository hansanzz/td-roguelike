// Punto de entrada: conecta los módulos y arranca el bucle del juego.
import { S } from './core/state.js';
import { update } from './systems/update.js';
import { initAuth } from './ui/auth.js';
import { initInput } from './ui/input.js';
import { draw } from './ui/render.js';

initAuth();
initInput();
let last = performance.now();
function loop(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now;
  if (S) { update(dt); draw(); }
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
