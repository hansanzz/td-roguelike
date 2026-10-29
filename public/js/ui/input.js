// Entrada del jugador: clics en el tablero, teclado y botones.
import { COLS, ROWS, T } from '../config/constants.js';
import { pathCells } from '../config/map.js';
import { TYPES, rollQuality } from '../config/towers.js';
import { $ } from '../core/dom.js';
import { S, avail, cost, ui } from '../core/state.js';
import { startWave, summonDio } from '../systems/progression.js';
import { hud, renderSel, toast } from './hud.js';
import { C } from './render.js';
import { tutEvent } from './tutorial.js';

export function initInput() {
  C.onclick = onBoardClick;
  addEventListener('keydown', onKeyDown);
  $('bWave').onclick = startWave;
  $('bDio').onclick = summonDio;
}
function onKeyDown(e) {
  if (!S) return;
  if (e.key === 'Escape') { S.pend = null; return; }
  const k = avail()[parseInt(e.key) - 1];
  if (k) { ui.pick = k; ui.sel = null; hud(); renderSel(); }
}
function cellOf(e) {
  const r = C.getBoundingClientRect();
  return [Math.floor((e.clientX - r.left) * C.width / r.width / T), Math.floor((e.clientY - r.top) * C.height / r.height / T)];
}
function onBoardClick(e) {
  if (S.over) return;
  const [cx, cy] = cellOf(e);
  if (cx < 0 || cy < 0 || cx >= COLS || cy >= ROWS) return;
  const tower = S.towers.find(t => t.cx === cx && t.cy === cy);
  if (tower) { ui.sel = tower; S.pend = null; renderSel(); return; }
  ui.sel = null; renderSel();
  if (ui.pick !== 'majin' && pathCells.has(cx + ',' + cy)) { S.pend = null; return; }
  if (!S.pend || S.pend.cx !== cx || S.pend.cy !== cy) { S.pend = {cx, cy}; return; }   // 1er clic: marca la zona
  S.pend = null;                                                                          // 2do clic: confirma
  if (ui.pick === 'majin') detonateMajin(cx, cy); else buildTower(cx, cy);
}
function detonateMajin(cx, cy) {   // un solo uso: mata todo en 9x9, gasta TODO el oro y 2 vidas
  if (S.majin < 1) return;
  const x0 = cx*T + T/2, y0 = cy*T + T/2;
  for (const en of S.enemies) if (!en.dead && Math.abs(en.x-x0) <= 4.5*T && Math.abs(en.y-y0) <= 4.5*T) en.hp = en.boss ? en.hp - en.max * 0.3 : 0;
  S.majin--; S.gold = 0; S.lives -= 2; S.fx.push({x:x0, y:y0, r:4.5*T, t:0.6, c:'255,0,200'});
  if (!S.majin) ui.pick = avail()[0];
  hud();
}
function buildTower(cx, cy) {
  if (ui.pick === 'widow' && S.widowCh < 1) { toast('Widow: hay que vencer a un jefe para poder colocarla'); return; }
  const c = cost(TYPES[ui.pick].cost);
  if (S.gold < c) { toast('Oro insuficiente'); return; }
  S.gold -= c; if (ui.pick === 'widow') S.widowCh--;
  S.towers.push({type:ui.pick, cx, cy, cd:0, lv:0, spent:c, wear:0, q:rollQuality()}); hud(); tutEvent('place');
}
