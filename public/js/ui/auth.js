// Pantalla de login/registro y ranking.
import { authApi, scoreApi } from '../api/client.js';
import { $ } from '../core/dom.js';
import { newRun } from '../core/state.js';

export const account = {user:null};     // usuario logueado y sus récords

function renderUser() {
  const u = account.user;
  $('user').textContent = `${u.username} | Mejor: ${u.best_score} pts, oleada ${u.best_wave}`;
}
export function updateBest(d) { Object.assign(account.user, {best_score:d.best_score, best_wave:d.best_wave}); renderUser(); }
export async function loadTop() {
  const t = await scoreApi.leaderboard();
  $('top').innerHTML = t.map(r => `<li>${r.username}: ${r.best_score} pts (oleada ${r.best_wave})</li>`).join('');
}
function showGame(user) {
  account.user = user; $('auth').hidden = true; $('game').hidden = false;
  renderUser(); loadTop(); newRun();
}
async function submit(kind) {
  const d = await authApi[kind]($('u').value, $('p').value);
  d.error ? $('msg').textContent = d.error : showGame(d);
}
export function initAuth() {
  $('bLogin').onclick = () => submit('login');
  $('bReg').onclick = () => submit('register');
  $('bOut').onclick = async () => { await authApi.logout(); location.reload(); };
  authApi.me().then(d => d.logged && showGame(d));   // sesión previa por cookie
}
