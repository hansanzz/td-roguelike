// Camino del enemigo: waypoints, casillas ocupadas y longitud total.
import { T } from './constants.js';

export const WP = [[0,1],[16,1],[16,5],[3,5],[3,9],[19,9]];
export const pathCells = new Set();
for (let i = 0; i < WP.length - 1; i++) {
  let [x,y] = WP[i]; const [tx,ty] = WP[i+1];
  while (x !== tx || y !== ty) { pathCells.add(x+','+y); x += Math.sign(tx-x); y += Math.sign(ty-y); }
}
pathCells.add(WP[WP.length-1].join(','));
export const pts = WP.map(([x,y]) => [x*T+T/2, y*T+T/2]);
export let PATH_LEN = 0;
for (let i = 0; i < pts.length - 1; i++) PATH_LEN += Math.hypot(pts[i+1][0]-pts[i][0], pts[i+1][1]-pts[i][1]);
export const CUM = [0];
for (let i = 0; i < pts.length - 1; i++) CUM.push(CUM[i] + Math.hypot(pts[i+1][0]-pts[i][0], pts[i+1][1]-pts[i][1]));    // radio del olor (px)
