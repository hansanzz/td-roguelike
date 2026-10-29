// Tutorial de Blocky (se muestra solo la primera vez).
import { $, btn } from '../core/dom.js';

const TUT = [
  {t:'¡Hola! Soy Blocky. En esta run tenés solo 3 torres, elegidas al azar.', ev:null},
  {t:'Elegí una torre arriba. Clic en un cuadro libre para marcar la zona y otro clic en el mismo para colocarla (cuesta oro).', ev:'place'},
  {t:'¡Bien! Ahora tocá "Iniciar oleada". Matar enemigos da oro.', ev:'wave'},
  {t:'Al terminar cada oleada ganás chispas y elegís una mejora, una torre o una reliquia.', ev:'pick'},
  {t:'Las chispas mejoran torres: clic en una torre y "Mejorar". Cada torre tiene una calidad, de Despreciable a Legendario.', ev:null},
  {t:'Cuidado con el desgaste verde y con los jefes. Entre oleadas elegís nodos: tienda, descanso, evento o élite. ¡Suerte!', ev:null, last:true},
];
let tutI = -1;
export function tutShow(i) {
  tutI = i; const d = $('tut');
  if (i < 0 || i >= TUT.length) { d.hidden = true; return; }
  d.hidden = false;
  d.innerHTML = `<img src="img/bloqi.png" alt="" onerror="this.style.display='none'"><div><p>${TUT[i].t}</p></div>`;
  const row = document.createElement('div');
  if (!TUT[i].ev) row.appendChild(btn(TUT[i].last ? '¡Entendido!' : 'Siguiente', () => tutNext()));
  row.appendChild(btn('Saltar tutorial', () => tutEnd()));
  d.appendChild(row);
}
export function tutNext() { if (tutI + 1 >= TUT.length) tutEnd(); else tutShow(tutI + 1); }
export function tutEnd() { try { localStorage.setItem('td_tut', '1'); } catch (e) {} tutShow(-1); }
export function tutEvent(ev) {
  if (ev === 'start') { let done = false; try { done = localStorage.getItem('td_tut'); } catch (e) {} if (!done) tutShow(0); return; }
  if (tutI >= 0 && TUT[tutI].ev === ev) tutNext();
}
