// Turno de cada enemigo: dardos, efectos, habilidad de jefe y avance por el camino.
import { STINK_R } from '../config/constants.js';
import { pts } from '../config/map.js';
import { S, ctr } from '../core/state.js';
import { BOSS_AI } from './bosses.js';
import { hit, near, towerHit } from './combat.js';
import { hud } from '../ui/hud.js';

// dardos que desgastan torres (avispa y abeja reina)
function dartAttack(e, dt) {
  const b = e.boss;
  if (e.mod === 'wasp' || b === 'queen') {   // dardos que desgastan torres
    e.dartT -= dt;
    if (e.dartT <= 0) {
      const ns = near(e, b ? 170 : 140);
      if (ns.length) {
        const t = ns[Math.floor(Math.random() * ns.length)], [px,py] = ctr(t);
        e.dartT = b ? 1.2 : 2; towerHit(t, e, b ? 0.08 : 0.05);
        S.beams.push({x1:e.x, y1:e.y, x2:px, y2:py, t:0.12, c:'#fab005'});
      }
    }
  }
}
// avance por el camino; la estatua se frena invulnerable
function followPath(e, dt, frozen) {
  if (e.mod === 'statue' && !e.done && e.dist >= e.stopAt) {   // estatua: quieta e invulnerable
    e.inv = true; e.hold -= dt;
    if (e.hold <= 0) { e.inv = false; e.done = true; }
  } else if (!frozen) {
    const [tx,ty] = pts[e.i+1] || pts[e.i];
    const dx = tx-e.x, dy = ty-e.y, d = Math.hypot(dx,dy), step = e.sp*e.slow*dt;
    if (d > 0) { e.ux = dx/d; e.uy = dy/d; }
    e.dist += Math.min(d, step);
    if (d <= step) { e.x = tx; e.y = ty; e.i++; } else { e.x += dx/d*step; e.y += dy/d*step; }
    if (e.i >= pts.length - 1) { e.dead = true; S.lives--; hud(); }
  }
}
export function enemyStep(e, dt) {
  e.healCd -= dt;
  dartAttack(e, dt);
  if (e.dotT > 0) { hit(e, e.dot * dt, null); e.dotT -= dt; }
  if (e.mod === 'stink') near(e, STINK_R).forEach(t => towerHit(t, e, 0.12 * dt));
  const ctl = {frozen:e.held};            // algunas habilidades de jefe lo detienen
  const ai = BOSS_AI[e.boss];
  if (ai && ai(e, dt, ctl) === true) return;   // true = el jefe ya se movió solo
  followPath(e, dt, ctl.frozen);
}
