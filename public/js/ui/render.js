// Dibujo del tablero en el canvas (tiles, torres, enemigos, efectos).
import { COLS, H, ROWS, STINK_R, T, W } from '../config/constants.js';
import { BOSSES, MODS } from '../config/enemies.js';
import { pathCells } from '../config/map.js';
import { QUAL, TYPES } from '../config/towers.js';
import { $ } from '../core/dom.js';
import { S, ctr, ui } from '../core/state.js';
import { st } from '../systems/towers.js';

export const C = $('c');
export const g = C.getContext('2d');
export const IMG = {};   // sprites de 16x16 en public/img (si faltan, se dibujan colores)
if (typeof Image !== 'undefined') for (const [k, f] of Object.entries({tile:'torretacasas.gif', road:'malotecamina.gif', marker:'marker.gif'})) { IMG[k] = new Image(); IMG[k].src = 'img/' + f; }
export const imgOk = k => IMG[k] && IMG[k].complete && IMG[k].naturalWidth > 0;
export function circle(x, y, r, fill, stroke) {
  g.beginPath(); g.arc(x, y, r, 0, 7);
  if (fill) { g.fillStyle = fill; g.fill(); }
  if (stroke) { g.strokeStyle = stroke; g.lineWidth = 1; g.stroke(); }
}
// casillas: sprites 16x16 (o colores si faltan)
function drawBoard() {
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, W, H);
  for (let y = 0; y < ROWS; y++) for (let x = 0; x < COLS; x++) {
    const road = pathCells.has(x+','+y), k = road ? 'road' : 'tile';
    if (imgOk(k)) g.drawImage(IMG[k], x*T, y*T, T, T);
    else { g.fillStyle = road ? '#3a3f55' : ((x + y) % 2 ? '#1f2535' : '#232a3d'); g.fillRect(x*T, y*T, T, T); }
  }
}
// marcador del 1er clic: bloque parpadeante (o marker.gif)
function drawMarker() {
  if (S.pend) {   // marcador del 1er clic: bloque parpadeante (o marker.gif)
    const mx = S.pend.cx*T, my = S.pend.cy*T;
    if (ui.pick === 'majin') { g.strokeStyle = 'rgba(255,60,200,.8)'; g.lineWidth = 3; g.strokeRect(mx + T/2 - 4.5*T, my + T/2 - 4.5*T, 9*T, 9*T); }
    else if (TYPES[ui.pick]) circle(mx + T/2, my + T/2, Math.min(300, TYPES[ui.pick].lv[0].rng * S.up.rng), 'rgba(255,255,255,.07)', 'rgba(255,255,255,.5)');
    if (imgOk('marker')) g.drawImage(IMG.marker, mx, my, T, T);
    else { g.fillStyle = `rgba(255,255,255,${0.35 + 0.35 * Math.abs(Math.sin(Date.now() / 250))})`; g.fillRect(mx + 4, my + 4, T - 8, T - 8); }
  }
}
// torres, auras y rayos
function drawTowers() {
  for (const e of S.enemies) if (e.mod === 'stink') circle(e.x, e.y, STINK_R, 'rgba(140,160,30,.15)');
  for (const t of S.towers) {
    const [px,py] = ctr(t);
    if (t.type === 'ice') circle(px, py, st(t).rng, 'rgba(116,192,252,.12)');
    if (t === ui.sel) circle(px, py, st(t).rng, null, '#fff');
    g.fillStyle = TYPES[t.type].color; g.fillRect(t.cx*T+6, t.cy*T+6, T-12, T-12);
    g.strokeStyle = (t.q || QUAL[2]).c; g.lineWidth = 2; g.strokeRect(t.cx*T+5, t.cy*T+5, T-10, T-10);
    if (t.wear > 0) { g.fillStyle = `rgba(110,130,20,${t.wear})`; g.fillRect(t.cx*T+6, t.cy*T+6, T-12, T-12); }
    if (t.target && !t.target.dead) { g.strokeStyle = TYPES.hugger.color; g.lineWidth = 3; g.beginPath(); g.moveTo(px,py); g.lineTo(t.target.x, t.target.y); g.stroke(); }
    for (const r of (t.rays || [])) {
      g.strokeStyle = r.f === 1 ? 'rgba(255,120,200,.55)' : 'rgba(255,170,220,.35)'; g.lineWidth = r.f === 1 ? 16 : 8; g.beginPath();
      const reach = (r.ax === 'row' ? COLS : ROWS) * T / 2;
      if (r.ax === 'row') { g.moveTo(r.half ? px : 0, py); g.lineTo(r.half ? px + r.dir * reach : W, py); }
      else { g.moveTo(px, r.half ? py : 0); g.lineTo(px, r.half ? py + r.dir * reach : H); }
      g.stroke();
    }
    g.fillStyle = '#111'; g.font = 'bold 12px sans-serif'; g.textAlign = 'center';
    g.fillText(t.lv + 1, px, py + 4);
  }
}
// disparos y explosiones
function drawEffects() {
  for (const b of S.beams) { g.strokeStyle = b.c; g.lineWidth = 2; g.beginPath(); g.moveTo(b.x1,b.y1); g.lineTo(b.x2,b.y2); g.stroke(); }
  for (const f of S.fx) circle(f.x, f.y, f.r, `rgba(${f.c || '255,150,50'},${Math.min(1, f.t*2)})`);
}
// enemigos y jefes
function drawEnemies() {
  for (const e of S.enemies) {
    const bd = e.boss ? BOSSES[e.boss] : null;
    const col = e.slow < 1 ? '#a5d8ff' : e.dotT > 0 ? '#c0eb75' : (bd ? bd.color : e.mod ? MODS[e.mod].color : '#ff6b6b');
    const rad = (bd ? bd.r : e.mod ? MODS[e.mod].r : 10) * e.scale;
    if (e.boss === 'ice') circle(e.x, e.y, 140, 'rgba(116,192,252,.1)');
    if (e.boss === 'shimada' && e.ult > 0) circle(e.x, e.y, 110, 'rgba(255,60,60,.15)');
    if (e.boss === 'buster' && e.tx != null) { g.strokeStyle = 'rgba(255,60,60,.6)'; g.lineWidth = 2; g.strokeRect(e.tx - 4.5*T, e.ty - 4.5*T, 9*T, 9*T); }
    circle(e.x, e.y, rad, col, e.inv || e.deflect > 0 ? '#fff' : null);
    if (e.inv || e.deflect > 0) { g.lineWidth = 3; g.stroke(); }
    if (bd) { g.fillStyle = '#fff'; g.font = 'bold 11px sans-serif'; g.textAlign = 'center'; g.fillText(bd.name, e.x, e.y - rad - 10); }
    g.fillStyle = '#2b8a3e'; g.fillRect(e.x-rad, e.y-rad-6, 2*rad * Math.max(0, e.hp/e.max), 3);
  }
}
// pantalla del tiempo detenido (DIO)
function drawOverlay() {
  if (S.timeStop > 0) { g.fillStyle = 'rgba(60,60,140,.35)'; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.font = 'bold 28px sans-serif'; g.textAlign = 'center'; g.fillText('ZA WARUDO', W/2, H/2); }
}
export function draw() {
  drawBoard(); drawMarker(); drawTowers(); drawEffects(); drawEnemies(); drawOverlay();
}
