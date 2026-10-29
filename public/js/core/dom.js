// Helpers de DOM.

export const $ = id => document.getElementById(id);
export function btn(text, fn, style) {
  const b = document.createElement('button'); b.textContent = text; b.onclick = fn;
  if (style) Object.assign(b.style, style); return b;
}
