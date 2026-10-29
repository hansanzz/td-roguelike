// Datos de torres: tipos, niveles, calidades (estilo Terraria).
import { T } from './constants.js';

// Cada torre: cost, color y niveles. "up" = oro para subir a ese nivel. rate = disparos/seg.
export const TYPES = {
  basic:   {name:'Básica', cost:50, color:'#4dabf7', lv:[{dmg:10, rate:1.6, rng:100}]},
  sentry:  {name:'Sentry (TF2)', cost:70, color:'#f59f00', lv:[{dmg:5, rate:3, rng:90}]},
  poison:  {name:'Veneno', cost:80, color:'#82c91e', lv:[{dot:6, dotT:4, rate:0.5, rng:110}]},
  ice:     {name:'Hielo', cost:60, color:'#74c0fc', lv:[{slow:0.5, rng:90}]},
  creeper: {name:'Creeper (MC)', cost:90, color:'#2f9e44', lv:[{dmg:25, splash:50, rate:0.7, rng:110}]},
  cat:     {name:'Gato', cost:40, color:'#f783ac', lv:[{dmg:3, rate:0.4, rng:1.5*T}]},       // 3 casillas de ancho
  hugger:  {name:'Hugger', cost:70, color:'#e599f7', lv:[{dmg:1, rate:10/3, rng:55}]},      // 1 de vida cada 0.3 s
  monk:    {name:'Monje', cost:100, color:'#ffa94d', lv:[{rate:0.2, rng:100}]},             // empuja cada 5 s
  medico:    {name:'Médico', cost:180, color:'#69db7c', lv:[{dmg:8, rate:1.5, rng:100, heal:0.02}]},      // más cara que Sentry nv.2 (160 en total)
  anhelante: {name:'Anhelante de postre', cost:160, color:'#ff8cc6', lv:[{rate:0.25, rng:0}]},            // rayo cada 4 s
  widow:     {name:'Widow', cost:200, color:'#845ef7', lv:[{rate:2, rng:9999}]},                          // francotiradora sin límite de rango
};
export const ORDER = Object.keys(TYPES);
export const BASE = ['basic','sentry','poison','ice','creeper','cat','hugger','monk'];
export const UPG_SPARKS = [3, 6];   // chispas para subir a nivel 2 y 3 (todas las torres mejoran igual)
export const LVM = [{d:1, r:1, g:1, s:1}, {d:1.5, r:1.15, g:1.08, s:1.2}, {d:2.2, r:1.3, g:1.15, s:1.4}];   // multiplicadores por nivel
export const QUAL = [   // calidad al estilo Terraria: w=peso, d=daño, r=cadencia, g=alcance, k=% crítico (x2)
  {n:'Despreciable', w:10, c:'#868e96', d:0.80, r:0.90, g:0.90, k:0},
  {n:'Mala',         w:20, c:'#adb5bd', d:0.92, r:0.95, g:1,    k:0},
  {n:'Normal',       w:35, c:'#e9ecef', d:1,    r:1,    g:1,    k:4},
  {n:'Buena',        w:20, c:'#69db7c', d:1.10, r:1.05, g:1.05, k:6},
  {n:'Excelente',    w:11, c:'#4dabf7', d:1.20, r:1.12, g:1.08, k:9},
  {n:'Legendario',   w:4,  c:'#ffd43b', d:1.35, r:1.20, g:1.12, k:14},
];
export function rollQuality() { let x = Math.random() * 100; for (const q of QUAL) if ((x -= q.w) < 0) return q; return QUAL[2]; }
