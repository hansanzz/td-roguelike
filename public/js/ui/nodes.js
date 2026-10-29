// Nodos entre oleadas (Blocky): tienda, descanso, evento, élite.
import { RELICS } from '../config/relics.js';
import { rollQuality } from '../config/towers.js';
import { $, btn } from '../core/dom.js';
import { S, ui } from '../core/state.js';
import { giveRelic } from '../systems/progression.js';
import { hud, renderSel, toast } from './hud.js';

const PACTS = [
  {n:'Pacto veloz: enemigos +20% de velocidad  ->  1 reliquia y 4 chispas', f:() => { S.curSpeed *= 1.2; S.sparks += 4; giveRelic(); }},
  {n:'Pacto de acero: enemigos +25% de vida  ->  150 oro y 1 reliquia', f:() => { S.curHp *= 1.25; S.gold += 150; giveRelic(); }},
  {n:'Pacto caro: torres +25% más caras  ->  2 reliquias', f:() => { S.up.cost *= 1.25; giveRelic(); giveRelic(); }},
];
export function showNode(title, text, opts) {   // panel con Blocky (bloqitienda.png)
  S.phase = 'node'; const n = $('node'); n.hidden = false;
  n.innerHTML = `<img src="img/bloqitienda.png" alt="" onerror="this.style.display='none'"><div><b>${title}</b><p>${text}</p><div id="nodeBtns"></div></div>`;
  const box = $('nodeBtns');
  opts.forEach(o => box.appendChild(btn(o.n, () => { if (o.f() !== false) closeNode(); })));
}
export function closeNode() { $('node').hidden = true; S.phase = 'build'; $('bWave').disabled = false; hud(); }
export function openShop() {
  const opts = S.stock.map(r => ({n:`${r.n}: ${r.d} (${r.p} oro)`, f:() => {
    if (S.gold < r.p) { toast('Oro insuficiente'); return false; }
    S.gold -= r.p; S.stock = S.stock.filter(x => x !== r); giveRelic(r.id); openShop(); return false; }}));
  opts.push({n:'Reforjar la torre seleccionada (3 chispas)', f:() => {
    if (!ui.sel) { toast('Primero seleccioná una torre en el mapa'); return false; }
    if (S.sparks < 3) { toast('Te faltan chispas'); return false; }
    S.sparks -= 3; ui.sel.q = rollQuality(); toast('Nueva calidad: ' + ui.sel.q.n); hud(); renderSel(); openShop(); return false; }});
  opts.push({n:'Curar 1 vida (60 oro)', f:() => { if (S.gold < 60) { toast('Oro insuficiente'); return false; } S.gold -= 60; S.lives++; hud(); openShop(); return false; }});
  opts.push({n:'Salir', f:() => true});
  showNode('Tienda de Blocky', `Oro: ${S.gold} | Chispas: ${S.sparks}`, opts);
}
export function openEvent() {
  const ps = [...PACTS].sort(() => Math.random() - .5).slice(0, 2);
  showNode('Evento: un trato', 'Blocky susurra... ¿aceptás un pacto?', [...ps.map(p => ({n:p.n, f:() => { p.f(); return true; }})), {n:'Rechazar', f:() => true}]);
}
export const NODES = {
  elite: {n:'Élite: más vida, pero da una reliquia', run:() => { S.nextElite = true; toast('La próxima oleada será ÉLITE'); return true; }},
  shop:  {n:'Tienda de Blocky', run:() => { S.stock = RELICS.filter(r => !S.relics.has(r.id)).sort(() => Math.random() - .5).slice(0, 2); openShop(); return false; }},
  rest:  {n:'Descanso', run:() => { showNode('Descanso', 'Blocky te deja recuperar el aliento.', [
           {n:'+2 vidas', f:() => { S.lives += 2; return true; }},
           {n:'Limpiar el desgaste de todas las torres', f:() => { S.towers.forEach(t => t.wear = 0); return true; }},
           {n:'+4 chispas', f:() => { S.sparks += 4; return true; }}]); return false; }},
  event: {n:'Evento: un trato', run:() => { openEvent(); return false; }},
};
export function nodeChoice() {
  const ks = Object.keys(NODES).sort(() => Math.random() - .5).slice(0, 2);
  showNode('¿Qué camino tomamos?', 'Elegí tu próximo nodo.', [{n:'Combate normal', f:() => true}, ...ks.map(k => ({n:NODES[k].n, f:NODES[k].run}))]);
}
