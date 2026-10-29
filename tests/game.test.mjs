// Pruebas de humo del juego (sin navegador): partida, colocación en 2 clics, calidades, nodos y jefes.
import './stubs.mjs';
import { el } from './stubs.mjs';
import test from 'node:test';
import assert from 'node:assert/strict';
import * as state from '../public/js/core/state.js';
import { update } from '../public/js/systems/update.js';
import { draw, C } from '../public/js/ui/render.js';
import { initInput } from '../public/js/ui/input.js';
import { startWave, offerPick, giveRelic } from '../public/js/systems/progression.js';
import { nodeChoice } from '../public/js/ui/nodes.js';
import { renderSel } from '../public/js/ui/hud.js';
import { st } from '../public/js/systems/towers.js';
import { ORDER, QUAL } from '../public/js/config/towers.js';
import { BOSSES } from '../public/js/config/enemies.js';

initInput();
const click = (x, y) => C.onclick({ clientX: x * 40 + 20, clientY: y * 40 + 20 });
const run = (ticks, stop = () => false) => { for (let i = 0; i < ticks && !stop(); i++) update(0.05); };
const armed = wave => {   // run lista para jefes: todas las torres desbloqueadas y varias ya puestas
  state.newRun(); const S = state.S; S.wave = wave - 1; S.unlocked = new Set(ORDER);
  ['sentry', 'basic', 'cat', 'monk', 'poison', 'ice', 'hugger', 'widow'].forEach((type, i) =>
    S.towers.push({ type, cx: 4 + i, cy: 2, cd: 0, lv: 2, spent: 50, wear: 0, q: QUAL[5] }));
  return S;
};

test('una run empieza con 3 torres base al azar', () => {
  state.newRun();
  assert.equal(state.S.unlocked.size, 3);
});
test('colocar torre: 1er clic marca, 2do clic construye (con calidad)', () => {
  state.newRun(); state.S.gold = 500;
  click(5, 3); assert.equal(state.S.towers.length, 0); assert.ok(state.S.pend);
  click(5, 3); assert.equal(state.S.towers.length, 1); assert.ok(state.S.towers[0].q.n);
});
test('mejorar con chispas sube el alcance (todas las torres suben igual)', () => {
  const t = state.S.towers[0], r1 = st(t).rng; t.lv = 1;
  assert.ok(st(t).rng > r1);
});
test('Widow exige un uso (se gana al vencer un jefe)', () => {
  state.newRun(); const S = state.S; S.unlocked.add('widow'); state.ui.pick = 'widow'; S.gold = 999;
  click(6, 3); click(6, 3); assert.equal(S.towers.length, 0);
  S.widowCh = 1; click(6, 3); click(6, 3); assert.equal(S.towers.length, 1);
});
test('flujo de nodos, tienda y reliquias', () => {
  state.newRun(); nodeChoice(); assert.equal(state.S.phase, 'node');
  giveRelic('vigor'); assert.ok(state.S.relics.has('vigor'));
});
test('Majin: 2 clics, borra enemigos, gasta oro y 2 vidas', () => {
  state.newRun(); const S = state.S; S.majin = 1; S.gold = 300; state.ui.pick = 'majin'; const lives = S.lives;
  click(8, 4); click(8, 4);
  assert.equal(S.gold, 0); assert.equal(S.lives, lives - 2); assert.equal(S.majin, 0);
});
for (const [name, wave, extra] of [['Rey helado', 8], ['Buster', 10], ['Shimada', 15], ['Makora', 20], ['Abeja reina', 6, S => (S.queenCh = 100)], ['DIO', 6, S => (S.forceDio = true)]]) {
  test(`jefe ${name}: aparece, juega y se dibuja sin errores`, () => {
    const S = armed(wave); extra?.(S); startWave();
    const seen = new Set(); run(1200, () => { S.enemies.forEach(e => e.boss && seen.add(e.boss)); return S.over; }); draw();
    assert.ok(seen.size >= 1, 'no apareció ningún jefe');
    assert.ok([...seen].every(k => BOSSES[k]));
  });
}
