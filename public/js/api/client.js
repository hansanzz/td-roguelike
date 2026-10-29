// Cliente HTTP de la API REST. Es el único lugar del front que conoce las URLs.

async function request(path, body) {
  const opts = body === undefined ? {} : {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(body)};
  const res = await fetch('/api/' + path, opts);
  return res.json();
}
export const authApi = {
  register: (username, password) => request('auth/register', {username, password}),
  login:    (username, password) => request('auth/login', {username, password}),
  me:       () => request('auth/me'),
  logout:   () => request('auth/logout', {}),
};
export const scoreApi = {
  save:        (score, wave) => request('scores', {score, wave}),
  leaderboard: () => request('scores/leaderboard'),
};
