// Creación de enemigos, jefes y control de oleadas (cuándo aparecen).
import { HP_GROWTH, MAX_BOSSES, REWARD_GROWTH } from '../config/constants.js';
import { BOSSES, MODS } from '../config/enemies.js';
import { PATH_LEN, pts } from '../config/map.js';
import { sfx } from '../core/audio.js';
import { S } from '../core/state.js';
import { hud, toast } from '../ui/hud.js';

export function mk(hpMult, spMult, mod) {
  const w = S.wave;
  const hp = 20 * Math.pow(HP_GROWTH, w - 1) * hpMult * S.curHp * (S.eliteNow ? 1.5 : 1);
  return {i:0, x:pts[0][0], y:pts[0][1], hp, max:hp, sp:Math.min(110, 50 + w * 2) * spMult * S.curSpeed, slow:1, slowSum:0,
    dot:0, dotT:0, healCd:0, dartT:2, mod, boss:null, dist:0, inv:false, done:false, held:false, scale:1, res:0, ux:1, uy:0,
    stopAt: PATH_LEN * (0.3 + Math.random() * 0.35), hold: 4 + Math.min(w, 6) * 0.5,
    rw: Math.round(8 * Math.pow(REWARD_GROWTH, w - 1) * (mod ? 1.5 : 1)), pts: 10 + 5 * w};
}
export function spawn() {
  const w = S.wave, names = Object.keys(MODS);
  const chance = w < 2 ? 0 : Math.min(0.6, 0.15 + 0.05 * w);
  let mod = Math.random() < chance ? names[Math.floor(Math.random() * names.length)] : null;
  if (S.enemies.some(e => e.boss === 'shimada') && Math.random() < 0.4) mod = 'healer';   // curanderos acompañan a Shimada
  S.enemies.push(mk(mod ? MODS[mod].hp : 1, (mod && MODS[mod].sp) || 1, mod));
}
export function bossesFor(w) {   // programados + por chance (reina/DIO); máximo MAX_BOSSES, los más prioritarios primero
  const l = Object.keys(BOSSES).filter(k => BOSSES[k].every && w % BOSSES[k].every === 0);
  if (Math.random() * 100 < S.queenCh) { l.push('queen'); S.queenCh = 0; }
  if (S.forceDio || Math.random() * 100 < S.dioCh) { l.push('dio'); S.dioCh = 0; S.forceDio = false; }
  return l.sort((x, y) => (BOSSES[y].pri || BOSSES[y].every) - (BOSSES[x].pri || BOSSES[x].every)).slice(0, MAX_BOSSES);
}
export function spawnBoss(k) {
  const B = BOSSES[k], e = mk(B.hp, B.speed, null);
  e.boss = k; e.rw *= 10; e.pts = 300 + 50 * S.wave;
  Object.assign(e, {ice:{spawnT:3}, buster:{tx:null, ty:null, retarget:0},
    shimada:{dcd:3, deflect:0, ult:0, ultCd:10, slashT:0}, makora:{strikeT:1.5},
    queen:{qs:'move', phT:6, dartT:1.5}, dio:{ph:1, tsCd:6, knifeT:0}}[k]);
  S.enemies.push(e); sfx(B.sfx); toast(B.name + ' aparece'); hud();
}
export function tickSpawns(dt) {
  if (S.phase !== 'wave') return;
  S.spawnT -= dt;
  if (S.queue > 0 && S.spawnT <= 0) { spawn(); S.queue--; S.spawnT = 0.7; }
  if (S.bosses.length) { S.bossT -= dt; if (S.bossT <= 0) { spawnBoss(S.bosses.shift()); S.bossT = 5; } }
}
