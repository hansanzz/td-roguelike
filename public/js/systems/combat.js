// Daño, muerte, empuje y utilidades de combate compartidas.
import { PUSH, REFLECT } from '../config/constants.js';
import { CUM, pts } from '../config/map.js';
import { TYPES } from '../config/towers.js';
import { S, ctr } from '../core/state.js';
import { unlock } from './progression.js';
import { mk } from './spawner.js';
import { hud, toast } from '../ui/hud.js';

// t = torre que causa el daño (null = efecto/reflejo)
export function hit(e, a, t) {
  if (e.inv) return;
  if (e.deflect > 0) { if (t) towerHit(t, e, 0.05); return; }   // Shimada devuelve el ataque
  if (e.boss === 'makora') {
    if (t && t.type === 'sentry') { e.res += 0.015; e.scale += 0.01; }  // cada bala de sentry lo hace más resistente y grande
    a /= 1 + e.res;
  }
  if (e.qs === 'stun') a *= 1.4;   // abeja reina quieta: recibe más daño
  if (e.slow < 0.99) a *= 1.25;                                    // sinergia: ralentizados reciben +25%
  if (t && t.type === 'creeper' && e.dotT > 0) a *= 1.3;           // sinergia: veneno + explosión
  if (e.boss && S.relics.has('bossbane')) a *= 1.2;
  if (t && t.q && Math.random() * 100 < t.q.k) a *= 2;             // crítico según calidad
  if (t) e.lastHit = t;
  e.hp -= a;
  if (e.mod === 'healer' && a > 0 && e.healCd <= 0) {   // curandero: cura a los de alrededor
    e.healCd = 0.5;
    for (const o of S.enemies) if (!o.dead && Math.hypot(o.x-e.x, o.y-e.y) <= 90) o.hp = Math.min(o.max, o.hp + o.max * 0.08);
  }
}
// un enemigo ataca una torre: el monje lo devuelve, las demás se desgastan
export function towerHit(t, e, add) {
  if (t.type === 'monk') hit(e, e.max * add * REFLECT, null);
  else { t.hurt = true; t.wear = Math.min(0.7, t.wear + add * (S.relics.has('thick') ? 0.7 : 1)); }
}
export function kill(e) {
  if (e.dead) return;
  e.dead = true; S.gold += Math.round(e.rw * (S.relics.has('greed') ? 1.25 : 1)); S.score += e.pts;
  const c = e.lastHit;   // el gato mejora matando
  if (c && c.type === 'cat' && S.towers.includes(c)) { c.bonus = (c.bonus || 0) + 0.5; c.chanceB = Math.min(10, (c.chanceB || 0) + 0.5); }
  if (e.boss) { S.widowCh++; toast('Jefe vencido: +1 uso de Widow'); }
  if (e.mod === 'statue') S.kStatue++;
  if (e.mod === 'fast') S.kFast++;
  if (S.kStatue >= 5 || S.kFast >= 7) unlock('anhelante');   // 5 tanques o 7 rápidos
  if (e.mod === 'wasp') S.queenCh = Math.min(100, S.queenCh + 3);
  if (e.mod === 'cultist') S.dioCh = Math.min(100, S.dioCh + 5);
  if (e.boss === 'queen') for (let i = 0; i < 4; i++) { const w = mk(1, 1, 'wasp'); Object.assign(w, {x:e.x + (i-1.5)*8, y:e.y, i:e.i, dist:e.dist}); S.enemies.push(w); }
  hud();
}
export function placeAt(e) {
  let i = 0; while (i < pts.length - 2 && e.dist >= CUM[i+1]) i++;
  const f = (e.dist - CUM[i]) / (CUM[i+1] - CUM[i]);
  e.x = pts[i][0] + (pts[i+1][0] - pts[i][0]) * f; e.y = pts[i][1] + (pts[i+1][1] - pts[i][1]) * f; e.i = i;
}
export function push(e) {
  if (e.boss === 'buster' && e.tx != null) { e.x = Math.max(0, e.x - e.ux * PUSH); e.y = Math.max(0, e.y - e.uy * PUSH); }
  else { e.dist = Math.max(0, e.dist - PUSH); placeAt(e); }
}
export function nearest(px, py, rng, pen) {
  let best = null, bd = 1e9;
  for (const e of S.enemies) {
    if (e.dead) continue;
    let d = Math.hypot(e.x - px, e.y - py); if (d > rng) continue;
    if (pen) d += pen(e);
    if (d < bd) { best = e; bd = d; }
  }
  return best;
}
export const near = (e, rng) => S.towers.filter(t => { const [px,py] = ctr(t); return Math.hypot(e.x-px, e.y-py) <= rng; });
export function claw(t, e, d) {
  const [px,py] = ctr(t);
  S.beams.push({x1:px, y1:py, x2:e.x, y2:e.y, t:0.1, c:TYPES.cat.color}); hit(e, d, t);
}
// resuelve muertes; DIO pasa a su fase 2 en vez de morir
export function resolveDeaths() {
  for (const e of S.enemies) if (e.hp <= 0) {
    if (e.boss === 'dio' && e.ph === 1) { e.ph = 2; e.hp = e.max; toast('DIO - fase 2'); S.fx.push({x:e.x, y:e.y, r:60, t:0.5, c:'252,196,25'}); }
    else kill(e);
  }
}
