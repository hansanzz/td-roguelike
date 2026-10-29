// Pruebas de la API sin MySQL ni Express: se reemplaza la capa de base de datos por un doble.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const calls = [];
const procPath = require.resolve('../src/db/procedures');
require.cache[procPath] = { id: procPath, filename: procPath, loaded: true, exports: {
  call: async (name, args) => {
    calls.push([name, args]);
    if (name === 'sp_me') return args[0] === 'tok' ? [{ username: 'ana', best_score: 5, best_wave: 2 }] : [];
    if (name === 'sp_leaderboard') return [{ username: 'ana', best_score: 5, best_wave: 2 }];
    return [{ username: 'ana', best_score: 0, best_wave: 0 }];
  } } };

const auth = require('../src/controllers/auth.controller');
const scores = require('../src/controllers/score.controller');
const errorHandler = require('../src/middleware/errorHandler');
const { AppError } = require('../src/errors');
const wrap = require('../src/utils/asyncHandler');

const fakeRes = () => ({ headers: {}, setHeader(k, v) { this.headers[k] = v; }, status(c) { this.code = c; return this; }, json(b) { this.body = b; return this; } });

test('register: crea sesión (cookie HttpOnly) y responde 201', async () => {
  const res = fakeRes();
  await auth.register({ body: { username: ' ana ', password: 'secreto' } }, res);
  assert.equal(res.code, 201); assert.equal(res.body.ok, true);
  assert.match(res.headers['Set-Cookie'], /^tk=[0-9a-f]{64}; HttpOnly/);
  assert.deepEqual(calls.at(-1)[1].slice(0, 2), ['ana', 'secreto']);
});
test('me: con token válido devuelve el usuario, sin token no está logueado', async () => {
  const ok = fakeRes(); await auth.me({ headers: { cookie: 'tk=tok' } }, ok); assert.equal(ok.body.logged, true);
  const no = fakeRes(); await auth.me({ headers: {} }, no); assert.deepEqual(no.body, { logged: false });
});
test('puntajes: save y leaderboard', async () => {
  const s = fakeRes(); await scores.save({ headers: { cookie: 'tk=tok' }, body: { score: '120', wave: '7' } }, s);
  assert.deepEqual(calls.at(-1), ['sp_save_score', ['tok', 120, 7]]);
  const l = fakeRes(); await scores.leaderboard({}, l); assert.equal(l.body.length, 1);
});
test('errores: AppError conserva su código y lo demás es 500', async () => {
  const a = fakeRes(); errorHandler(new AppError('No logueado', 401), {}, a); assert.equal(a.code, 401);
  const b = fakeRes(); const log = console.error; console.error = () => {}; errorHandler(new Error('x'), {}, b); console.error = log;
  assert.equal(b.code, 500);
  let got; await wrap(async () => { throw new AppError('boom'); })({}, {}, e => { got = e; }); assert.equal(got.message, 'boom');
});
