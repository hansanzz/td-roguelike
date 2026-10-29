// Simula lo mínimo del navegador para poder probar la lógica del juego con Node.
function mockEl() {
  const own = {};
  return new Proxy(own, {
    get: (o, k) => k in o ? o[k] : k === 'style' ? (o.style = {}) : k === 'querySelectorAll' ? () => [] :
      k === 'getBoundingClientRect' ? () => ({left:0, top:0, width:800, height:440}) : () => mockEl(),
    set: (o, k, v) => { o[k] = v; return true; },
  });
}
const els = {};
globalThis.document = { getElementById: id => els[id] ||= mockEl(), createElement: () => mockEl() };
globalThis.location = { search: '' };
globalThis.addEventListener = () => {};
globalThis.requestAnimationFrame = () => {};
globalThis.alert = () => {};
globalThis.fetch = async url => ({ json: async () => String(url).includes('leaderboard') ? [] : { logged: false } });
els.c = mockEl(); els.c.width = 800; els.c.height = 440;
export const el = id => els[id];
