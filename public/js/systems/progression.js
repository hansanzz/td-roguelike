// Progreso de la run: iniciar oleada, fin de oleada, reliquias, desbloqueos, game over.
import { scoreApi } from '../api/client.js';
import { TEST } from '../config/constants.js';
import { RELICS, UPGRADES } from '../config/relics.js';
import { BASE, TYPES } from '../config/towers.js';
import { stopMusic } from '../core/audio.js';
import { $, btn } from '../core/dom.js';
import { S, newRun } from '../core/state.js';
import { bossesFor } from './spawner.js';
import { loadTop, updateBest } from '../ui/auth.js';
import { hud, toast } from '../ui/hud.js';
import { nodeChoice } from '../ui/nodes.js';
import { tutEvent } from '../ui/tutorial.js';

export function giveRelic(id) {
  const left = RELICS.filter(r => !S.relics.has(r.id));
  const r = id ? RELICS.find(x => x.id === id) : left[Math.floor(Math.random() * left.length)];
  if (!r) { S.sparks += 3; return; }
  S.relics.add(r.id);
  if (r.id === 'vigor') S.lives += 3;
  if (r.id === 'swift') S.up.rate *= 1.1;
  toast('Reliquia: ' + r.n); hud();
}
export function unlock(k) { if (S.unlocked.has(k)) return; S.unlocked.add(k); toast('¡Nueva torre: ' + TYPES[k].name + '!'); hud(); }
export function offerPick() {
  S.phase = 'pick'; S.score += S.wave * 50; S.towers.forEach(t => t.chanceB = 0);
  S.sparks += 3 + Math.floor(S.wave / 3) + (S.relics.has('sparkbag') ? 2 : 0);   // chispas por pasar de oleada
  if (S.eliteNow) { S.eliteNow = false; giveRelic(); }
  const unl = [...BASE.filter(k => !S.unlocked.has(k)), ...['medico','anhelante'].filter(k => !S.unlocked.has(k)),
    ...(S.wave % 5 === 0 && !S.unlocked.has('widow') ? ['widow'] : [])];   // Widow solo cada 5 oleadas
  const pool = [...UPGRADES, {n:'Majin V. (1 uso): elimina todo en 9x9, pero gasta TODO tu oro y 2 vidas', f:s => s.majin++},
    ...unl.map(k => ({n:'Desbloquear torre: ' + TYPES[k].name, f:() => unlock(k)})),
    ...RELICS.filter(r => !S.relics.has(r.id)).map(r => ({n:'Reliquia: ' + r.n + ' (' + r.d + ')', f:() => giveRelic(r.id)}))];
  const opts = pool.sort(() => Math.random() - .5).slice(0, 3);
  $('pick').hidden = false;
  $('pick').innerHTML = '<b>Elige una mejora:</b>';
  opts.forEach(o => $('pick').appendChild(btn(o.n, () => { o.f(S); $('pick').hidden = true; nodeChoice(); hud(); tutEvent('pick'); })));
  hud();
}
export function startWave() {
  if (S.phase !== 'build') return;
  S.wave++; S.phase = 'wave'; S.queue = 4 + S.wave; S.bosses = bossesFor(S.wave); S.bossT = 2; S.spawnT = 0; $('bWave').disabled = true;
  S.eliteNow = S.nextElite; S.nextElite = false; if (S.eliteNow) toast('¡Oleada ÉLITE!'); hud(); tutEvent('wave');
}
export function summonDio() { if (S.phase !== 'build' || S.over) return; S.forceDio = true; toast('DIO vendrá en la próxima oleada'); }
export async function gameOver() {
  S.over = true; stopMusic();
  const d = TEST ? {error:1} : await scoreApi.save(S.score, S.wave);   // en modo prueba no se guarda
  if (!d.error) { updateBest(d); loadTop(); }
  setTimeout(() => { alert(`Fin. Oleada ${S.wave}, ${S.score} puntos`); newRun(); }, 50);
}
