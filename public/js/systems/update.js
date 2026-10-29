// Bucle de simulación: un paso de juego por frame.
import { musicTick } from '../core/audio.js';
import { S } from '../core/state.js';
import { resolveDeaths } from './combat.js';
import { enemyStep } from './enemies.js';
import { gameOver, offerPick } from './progression.js';
import { tickSpawns } from './spawner.js';
import { applyIceAura, updateTowers } from './towers.js';
import { bossBar, refreshSel } from '../ui/hud.js';

let uiTimer = 0;
export function update(dt) {
  if (S.over) return;
  const timeStopped = S.timeStop > 0;      // DIO detuvo el tiempo: solo se mueve él
  if (timeStopped) S.timeStop -= dt; else tickSpawns(dt);
  for (const t of S.towers) { t.hurt = false; t.frMul = 1; }   // los enemigos los vuelven a marcar cada frame
  applyIceAura();
  for (const e of S.enemies) { e.slow = Math.max(0.1, 1 - e.slowSum); if (!timeStopped || e.boss === 'dio') enemyStep(e, dt); }
  if (!timeStopped) for (const t of S.towers) if (!t.hurt) t.wear = Math.max(0, t.wear - 0.01 * dt);   // el desgaste se recupera lento
  refreshUI(dt);
  updateTowers(dt, timeStopped);
  resolveDeaths();
  decayEffects(dt);
  checkWaveEnd();
}
function refreshUI(dt) { uiTimer -= dt; if (uiTimer <= 0) { uiTimer = 0.1; refreshSel(); bossBar(); musicTick(); } }
function decayEffects(dt) {
  S.beams.forEach(b => b.t -= dt); S.beams = S.beams.filter(b => b.t > 0);
  S.fx.forEach(f => f.t -= dt); S.fx = S.fx.filter(f => f.t > 0);
  S.enemies = S.enemies.filter(e => !e.dead);
}
function checkWaveEnd() {
  if (S.lives <= 0) return gameOver();
  if (S.phase === 'wave' && S.queue === 0 && !S.bosses.length && S.enemies.length === 0) offerPick();
}
