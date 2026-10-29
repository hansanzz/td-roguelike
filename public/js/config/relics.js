// Reliquias y mejoras de fin de oleada.

export const RELICS = [
  {id:'catclaw',   n:'Garra afilada',      d:'+1 de daño a los gatos', p:140},
  {id:'frostfire', n:'Escarcha ardiente',  d:'el hielo también quema', p:180},
  {id:'thick',     n:'Armadura de bloque', d:'-30% de desgaste', p:150},
  {id:'greed',     n:'Bolsa de oro',       d:'+25% de oro por enemigo', p:160},
  {id:'sparkbag',  n:'Bolsa de chispas',   d:'+2 chispas por oleada', p:140},
  {id:'bossbane',  n:'Cazajefes',          d:'+20% de daño a jefes', p:170},
  {id:'vigor',     n:'Corazón extra',      d:'+3 vidas', p:120},
  {id:'swift',     n:'Gatillo ligero',     d:'+10% de cadencia', p:160},
];
export const UPGRADES = [
  {n:'+25% daño', f:s=>s.up.dmg*=1.25},
  {n:'+15% alcance', f:s=>s.up.rng*=1.15},
  {n:'+20% cadencia', f:s=>s.up.rate*=1.2},
  {n:'+80 oro', f:s=>s.gold+=80},
  {n:'+2 vidas', f:s=>s.lives+=2},
  {n:'Torres y mejoras 15% más baratas', f:s=>s.up.cost*=0.85},
];
