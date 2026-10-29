// Torres: stats efectivos, comportamiento por tipo (un tick por torre) y aura de hielo.
import { COLS, ROWS, T } from '../config/constants.js';
import { LVM, QUAL, TYPES } from '../config/towers.js';
import { meow } from '../core/audio.js';
import { S, baseHp, ctr, ui } from '../core/state.js';
import { claw, hit, nearest, push } from './combat.js';

export function st(t) {
  const b = {...TYPES[t.type].lv[0]}, q = t.q || QUAL[2], L = LVM[t.lv || 0];
  if (t.type === 'cat') b.dmg += (t.bonus || 0) + (S.relics.has('catclaw') ? 1 : 0);
  if (b.dmg) b.dmg *= S.up.dmg * q.d * L.d;
  if (b.dot) b.dot *= S.up.dmg * q.d * L.d;
  if (b.heal) b.heal *= L.d;
  if (b.rate) b.rate *= S.up.rate * q.r * L.r * (1 - (t.wear || 0)) * (t.frMul || 1);
  if (b.slow) b.slow = Math.min(0.8, b.slow * L.s) * (1 - (t.wear || 0));
  b.rng *= S.up.rng * q.g * L.g;
  return b;
}
export function releaseHug(t) { if (t.target) { t.target.held = false; t.target = null; } }
export function destroyTower(t) { releaseHug(t); S.towers = S.towers.filter(x => x !== t); if (ui.sel === t) ui.sel = null; }
// francotiradora (medio hp base cada 0.5 s); fusil si se acercan (cada 0.1 s)
function tickWidow(t, s, px, py, dt) {
  t.cd -= dt; if (t.cd > 0) return;
  const bh = baseHp(), sc = s.rate / 2, close = nearest(px, py, 120, e => e.inv ? 1e5 : 0);
  let tg = null;
  if (close && !close.inv) { tg = close; t.cd = 0.1 / sc; hit(tg, 0.02 * bh * S.up.dmg, t); }
  else {
    for (const e of S.enemies) if (!e.dead && !e.inv) { const k = e.boss === 'buster' ? 1e9 : e.dist; if (!tg || k > tg.k) tg = {e, k}; }
    if (tg) { tg = tg.e; t.cd = 0.5 / sc; hit(tg, 0.25 * bh * S.up.dmg, t); }
  }
  if (tg) S.beams.push({x1:px, y1:py, x2:tg.x, y2:tg.y, t:0.06, c:'#fff'});
}
// rayo enorme por fila/columna + 2 ligeros (mitad de largo, 1/3 de daño)
function tickAnhelante(t, s, px, py, dt) {
  t.cd -= dt; t.tk = (t.tk || 0) - dt;
  t.rays = (t.rays || []).filter(r => (r.t -= dt) > 0);
  if (t.cd <= 0) {
    const row = S.enemies.filter(e => !e.dead && Math.abs(e.y-py) <= T/2).length, col = S.enemies.filter(e => !e.dead && Math.abs(e.x-px) <= T/2).length;
    if (row + col > 0) {
      t.cd = 1 / s.rate;
      const big = row >= col ? 'row' : 'col', light = big === 'row' ? 'col' : 'row';
      t.rays.push({ax:big, f:1, t:5}, {ax:light, f:1/3, t:5, half:true, dir:-1}, {ax:light, f:1/3, t:5, half:true, dir:1});
    }
  }
  if (t.tk <= 0) {
    t.tk = 0.2;
    for (const r of t.rays) for (const e of S.enemies) {
      if (e.dead) continue;
      const dx = e.x - px, dy = e.y - py, a = r.ax === 'row' ? dx : dy, w = r.ax === 'row' ? dy : dx;
      const reach = (r.ax === 'row' ? COLS : ROWS) * T / 2;
      if (Math.abs(w) <= T/2 && (!r.half || (a * r.dir >= 0 && a * r.dir <= reach))) hit(e, 5 * r.f * S.up.dmg, t);
    }
  }
}
// agarra y drena 1 de vida cada 0.3 s
function tickHugger(t, s, px, py, dt) {
  if (t.target && (t.target.dead || Math.hypot(t.target.x-px, t.target.y-py) > s.rng * 1.5)) releaseHug(t);
  if (!t.target) {
    const e = S.enemies.find(e => !e.dead && !e.held && !e.inv && !e.boss && Math.hypot(e.x-px, e.y-py) <= s.rng);
    if (e) { t.target = e; e.held = true; t.cd = 0; }
  }
  if (t.target) { t.cd -= dt; if (t.cd <= 0) { t.cd = 1 / s.rate; hit(t.target, s.dmg, t); } }
}
function tickCat(t, s, px, py, dt) {
  if (t.barrage > 0) {   // ráfaga con daño base
    t.bcd -= dt;
    if (t.bcd <= 0) {
      t.bcd = 0.12; t.barrage--;
      const e = nearest(px, py, s.rng); if (e) claw(t, e, 3 * S.up.dmg);
      if (t.barrage === 0) t.cd = 1 / s.rate;
    }
    return;
  }
  t.cd -= dt; if (t.cd > 0) return;
  const e = nearest(px, py, s.rng); if (!e) return;
  if (Math.random() < 0.10 + (t.chanceB || 0) / 100) { t.barrage = 6; t.bcd = 0; meow(); return; }
  claw(t, e, s.dmg); t.cd = 1 / s.rate;
}
// empuja 5 casillas atrás a todos los enemigos en rango
function tickMonk(t, s, px, py, dt) {
  t.cd -= dt; if (t.cd > 0) return;
  const inRange = S.enemies.filter(e => !e.dead && Math.hypot(e.x-px, e.y-py) <= s.rng);
  if (!inRange.length) return;
  inRange.forEach(push); t.cd = 1 / s.rate; S.fx.push({x:px, y:py, r:s.rng, t:0.25, c:'255,169,77'});
}
// torres de disparo simple: básica, sentry, veneno, creeper y médico
function tickGeneric(t, s, px, py, dt) {
  t.cd -= dt; if (t.cd > 0) return;
  const best = nearest(px, py, s.rng, s.dot ? (e => e.dotT > 0.5 ? 1000 : 0) : null);
  if (!best) return;
  t.cd = 1 / s.rate;
  S.beams.push({x1:px, y1:py, x2:best.x, y2:best.y, t:0.08, c:TYPES[t.type].color});
  if (s.dot) { best.dot = s.dot; best.dotT = s.dotT; }
  else if (s.splash) {
    for (const e of S.enemies) if (Math.hypot(e.x-best.x, e.y-best.y) <= s.splash) hit(e, s.dmg, t);
    S.fx.push({x:best.x, y:best.y, r:s.splash, t:0.25});
  } else hit(best, s.dmg, t);
  if (s.heal) for (const o of S.towers) if (Math.hypot(o.cx*T - t.cx*T, o.cy*T - t.cy*T) <= s.rng) o.wear = Math.max(0, o.wear - s.heal);   // médico
}
const BEHAVIOR = {widow:tickWidow, anhelante:tickAnhelante, hugger:tickHugger, cat:tickCat, monk:tickMonk};   // tipo -> comportamiento

export function updateTowers(dt, timeStopped) {
  if (timeStopped) return;
  for (const t of [...S.towers]) {
    if (t.type === 'ice') continue;   // el hielo actúa como aura (applyIceAura)
    const s = st(t), [px, py] = ctr(t);
    (BEHAVIOR[t.type] || tickGeneric)(t, s, px, py, dt);
  }
}
// Hielo: las zonas se SUMAN (tope 90% de ralentización, se aplica en update)
export function applyIceAura() {
  for (const e of S.enemies) e.slowSum = 0;
  for (const t of S.towers) if (t.type === 'ice') {
    const s = st(t), [px,py] = ctr(t);
    for (const e of S.enemies) if (Math.hypot(e.x-px, e.y-py) <= s.rng) { e.slowSum += s.slow; if (S.relics.has('frostfire')) { e.dot = Math.max(e.dot, 3); e.dotT = Math.max(e.dotT, 0.5); } }
  }
}
