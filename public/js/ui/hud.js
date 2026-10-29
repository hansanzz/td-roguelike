// HUD, panel de la torre seleccionada, barra de jefe y avisos.
import { BOSSES } from '../config/enemies.js';
import { RELICS } from '../config/relics.js';
import { QUAL, TYPES, UPG_SPARKS } from '../config/towers.js';
import { $, btn } from '../core/dom.js';
import { S, avail, cost, sellValue, ui } from '../core/state.js';
import { destroyTower, releaseHug } from '../systems/towers.js';

export function hud() {
  $('hud').textContent = `Oleada ${S.wave} | Oro ${S.gold} | Vidas ${S.lives} | Chispas ${S.sparks} | Puntos ${S.score}` + S.enemies.filter(e => e.boss).map(e => ' | JEFE: ' + BOSSES[e.boss].name).join('');
  const shop = $('shop'); shop.innerHTML = '';
  avail().forEach((k, i) => shop.appendChild(btn(`${i+1}. ${TYPES[k].name} (${cost(TYPES[k].cost)})${k === 'widow' ? ' x' + S.widowCh : ''}`,
    () => { ui.pick = k; ui.sel = null; hud(); renderSel(); },
    {background:TYPES[k].color, color:'#111', outline: ui.pick === k ? '3px solid #fff' : 'none'})));
  if (S.majin > 0) shop.appendChild(btn(`Majin V. (x${S.majin})`, () => { ui.pick = 'majin'; ui.sel = null; hud(); renderSel(); },
    {background:'#f03e3e', color:'#fff', outline: ui.pick === 'majin' ? '3px solid #fff' : 'none'}));
  $('relics').textContent = S.relics.size ? 'Reliquias: ' + [...S.relics].map(id => RELICS.find(r => r.id === id).n).join(', ') : '';
}
export function refreshSel() {
  if (!ui.sel) return;
  const i = $('selInfo'); if (i) i.textContent = ` | Desgaste ${Math.round(ui.sel.wear*100)}%` + (ui.sel.type === 'cat' ? ` | Daño ${(3 + (ui.sel.bonus||0)).toFixed(1)} | Barrage ${(10 + (ui.sel.chanceB||0)).toFixed(1)}%` : '');
  const bs = $('sel').querySelectorAll('button');
  if (bs.length) bs[bs.length-1].textContent = `Vender (+${sellValue(ui.sel)})`;
}
export function renderSel() {
  const p = $('sel');
  if (!ui.sel) { p.hidden = true; return; }
  p.hidden = false;
  const D = TYPES[ui.sel.type], q = ui.sel.q || QUAL[2];
  p.innerHTML = `<b style="color:${q.c}">${q.n}</b> <b>${D.name}</b> nivel ${ui.sel.lv+1}/3<span id="selInfo"></span> `;
  if (ui.sel.lv < 2) p.appendChild(btn(`Mejorar (${cost(UPG_SPARKS[ui.sel.lv])} chispas)`, () => {
    const c = cost(UPG_SPARKS[ui.sel.lv]); if (S.sparks < c) { toast('Te faltan chispas'); return; }
    S.sparks -= c; ui.sel.lv++; hud(); renderSel();
  }));
  p.appendChild(btn(`Sacrificar (+${3 + ui.sel.lv * 2} chispas)`, () => { S.sparks += 3 + ui.sel.lv * 2; destroyTower(ui.sel); hud(); renderSel(); }));
  p.appendChild(btn(`Vender (+${sellValue(ui.sel)})`, () => {
    releaseHug(ui.sel); S.gold += sellValue(ui.sel); S.towers = S.towers.filter(x => x !== ui.sel);
    ui.sel = null; hud(); renderSel();
  }));
  refreshSel();
}
export function toast(m) { $('toast').textContent = m; setTimeout(() => { $('toast').textContent = ''; }, 3000); }
export function bossBar() {
  $('bossbar').innerHTML = S.enemies.filter(e => e.boss).map(e => {
    const f = e.boss === 'dio' ? (e.ph === 1 ? e.max + Math.max(0, e.hp) : Math.max(0, e.hp)) / (2 * e.max) : Math.max(0, e.hp) / e.max;
    const p = Math.max(0, Math.round(f * 100));
    return `<div class="bb"><div class="bf" style="width:${p}%"></div><span>${BOSSES[e.boss].name} - ${p}%</span></div>`;
  }).join('');
}
