// IA de cada jefe. Para agregar uno: escribí su función y registrala en BOSS_AI.
import { REFLECT, T } from '../config/constants.js';
import { sfx } from '../core/audio.js';
import { S, ctr } from '../core/state.js';
import { hit, near, towerHit } from './combat.js';
import { mk } from './spawner.js';
import { destroyTower } from './towers.js';
import { renderSel, toast } from '../ui/hud.js';

export function clusterTarget() {   // torre con más torres (no monjes) en una zona 9x9
  let best = null, bc = 0;
  for (const a of S.towers) {
    if (a.type === 'monk') continue; let c = 0;
    for (const b of S.towers) if (b.type !== 'monk' && Math.abs(a.cx-b.cx) <= 4 && Math.abs(a.cy-b.cy) <= 4) c++;
    if (c > bc) { bc = c; best = ctr(a); }
  }
  return best;
}
export function explode(e) {   // Buster: rompe todo en 9x9 (los monjes sobreviven y devuelven el golpe)
  const cx0 = Math.floor(e.x / T), cy0 = Math.floor(e.y / T);
  for (const t of [...S.towers]) {
    if (Math.abs(t.cx - cx0) > 4 || Math.abs(t.cy - cy0) > 4) continue;
    if (t.type === 'monk') hit(e, e.max * REFLECT, null); else destroyTower(t);
  }
  S.fx.push({x:cx0*T+T/2, y:cy0*T+T/2, r:4.5*T, t:0.5, c:'255,80,80'});
  e.dead = true; renderSel();
}
// zona: -5% cadencia; genera tanques
function iceBoss(e, dt, ctl) {
  near(e, 140).forEach(t => t.frMul *= 0.95);
  e.spawnT -= dt;
  if (e.spawnT <= 0 && S.enemies.filter(x => x.mod === 'statue' && !x.boss).length < 5) {
    e.spawnT = 5; const m = mk(1.5, 1, 'statue');
    Object.assign(m, {x:e.x, y:e.y, i:e.i, dist:e.dist, stopAt:e.dist + 40 + Math.random() * 80}); S.enemies.push(m);
  }
}
// devuelve ataques cada 3 s; ulti a los 10 s
function shimadaBoss(e, dt, ctl) {
  e.dcd -= dt;
  if (e.deflect > 0) e.deflect -= dt; else if (e.dcd <= 0) { e.deflect = 1; e.dcd = 3; }
  if (e.ult > 0) {
    ctl.frozen = true; e.ult -= dt; e.slashT -= dt;
    if (e.slashT <= 0) { e.slashT = 0.4; near(e, 110).forEach(t => towerHit(t, e, 0.15)); S.fx.push({x:e.x, y:e.y, r:110, t:0.2, c:'255,60,60'}); }
    if (e.ult <= 0) e.ultCd = 10;
  } else { e.ultCd -= dt; if (e.ultCd <= 0) { e.ult = 6; e.slashT = 0; } }
}
// golpea 3x1 al frente
function makoraBoss(e, dt, ctl) {
  e.strikeT -= dt;
  if (e.strikeT <= 0) {
    e.strikeT = 1.5; const L = 3 * T * e.scale;
    S.towers.forEach(t => {
      const [px,py] = ctr(t), dx = px - e.x, dy = py - e.y, a = dx * e.ux + dy * e.uy, p = Math.abs(-dx * e.uy + dy * e.ux);
      if (a >= 0 && a <= L && p <= T * 0.6 * e.scale) towerHit(t, e, 0.35);
    });
    S.beams.push({x1:e.x, y1:e.y, x2:e.x + e.ux * L, y2:e.y + e.uy * L, t:0.15, c:'#fa5252'});
  }
}
// avanza, embiste (daño en área), se queda quieta (x1.4 de daño)
function queenBoss(e, dt, ctl) {
  e.phT -= dt;
  if (e.qs === 'move' && e.phT <= 0) { e.qs = 'charge'; e.phT = 1.5; }
  else if (e.qs === 'charge' && e.phT <= 0) {
    e.qs = 'stun'; e.phT = 3; near(e, 90).forEach(t => towerHit(t, e, 0.4)); S.fx.push({x:e.x, y:e.y, r:90, t:0.4, c:'250,176,5'});
  } else if (e.qs === 'stun' && e.phT <= 0) { e.qs = 'move'; e.phT = 6; }
  if (e.qs === 'charge') e.slow *= 4;
  if (e.qs === 'stun') ctl.frozen = true;
}
// frena el tiempo 5 s y lanza cuchillos a las torres cercanas
function dioBoss(e, dt, ctl) {
  if (S.timeStop > 0) {
    e.slow *= 2;
    if (e.knifeT > 0) {
      e.knifeT -= dt;
      if (e.knifeT <= 0) {
        sfx('mudada');
        near(e, 220).forEach(t => { towerHit(t, e, 0.25); const [px,py] = ctr(t); S.beams.push({x1:e.x, y1:e.y, x2:px, y2:py, t:0.3, c:'#fff'}); });
      }
    }
  } else {
    e.tsCd -= dt;
    if (e.tsCd <= 0) { S.timeStop = 5; e.tsCd = e.ph === 2 ? 12 : 16; e.knifeT = 2.5; sfx('zawardo'); toast('ZA WARUDO!'); }
  }
}
// corre directo hacia el grupo de torres más denso
function busterBoss(e, dt, ctl) {
  e.retarget -= dt;
  if (e.retarget <= 0) { e.retarget = 1.5; const c = clusterTarget(); e.tx = c ? c[0] : null; e.ty = c ? c[1] : null; }
  if (e.tx != null && !ctl.frozen) {
    const dx = e.tx - e.x, dy = e.ty - e.y, d = Math.hypot(dx, dy), step = e.sp * e.slow * dt;
    if (d <= step) explode(e); else { e.x += dx/d*step; e.y += dy/d*step; e.ux = dx/d; e.uy = dy/d; }
    return;
  }
}
export const BOSS_AI = {ice:iceBoss, shimada:shimadaBoss, makora:makoraBoss, queen:queenBoss, dio:dioBoss, buster:busterBoss};
