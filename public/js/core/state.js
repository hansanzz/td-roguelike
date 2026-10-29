// Estado global de la partida (S) y de la interfaz (ui) + helpers de estado.
import { HP_GROWTH, Q, T, TEST } from '../config/constants.js';
import { BASE, ORDER, TYPES } from '../config/towers.js';
import { stopMusic } from './audio.js';
import { $ } from './dom.js';
import { hud, renderSel, toast } from '../ui/hud.js';
import { tutEvent } from '../ui/tutorial.js';

export let S;                                    // partida actual; se reasigna en newRun() (los demás módulos ven el valor vigente)
export const ui = {pick:'basic', sel:null};        // torre elegida para construir / torre seleccionada en el mapa
export function newRun() {
  S = {gold:+Q.get('gold') || 150, lives:10, wave:Math.max(0, (+Q.get('wave') || 1) - 1), bosses:[], bossT:0, timeStop:0, queenCh:0, dioCh:0, forceDio:false, kStatue:0, kFast:0, majin:TEST ? 2 : 0,
       unlocked:new Set(TEST ? ORDER : [...BASE].sort(() => Math.random() - .5).slice(0, 3)),   // 3 torres base al azar por run
       relics:new Set(), sparks:0, widowCh:TEST ? 3 : 0, nextElite:false, eliteNow:false, curHp:1, curSpeed:1, pend:null, stock:null, score:0, towers:[], enemies:[], beams:[], fx:[],
       up:{dmg:1, rng:1, rate:1, cost:1}, phase:'build', queue:0, spawnT:0, over:false};
  stopMusic(); ui.sel = null; $('pick').hidden = true; $('node').hidden = true; $('bWave').disabled = false;
  ui.pick = [...S.unlocked][0]; hud(); renderSel();
  toast('Tus torres de esta run: ' + avail().map(k => TYPES[k].name).join(', ')); tutEvent('start');
}
export const cost = n => Math.round(n * S.up.cost);
export const ctr = t => [t.cx*T+T/2, t.cy*T+T/2];
export const avail = () => ORDER.filter(k => S.unlocked.has(k));
export const baseHp = () => 20 * Math.pow(HP_GROWTH, S.wave - 1);
export const sellValue = t => Math.floor(t.spent * 0.7 * (1 - t.wear));
