// Datos de enemigos comunes (MODS) y jefes (BOSSES).

export const MODS = {
  fast:   {color:'#ffd43b', r:8,  hp:0.6, sp:1.8},  // rápido
  statue: {color:'#adb5bd', r:12, hp:1.5},  // se frena invulnerable un rato
  stink:  {color:'#a9b52f', r:11, hp:1.2},  // oloriento: desgasta torres cercanas
  wasp:   {color:'#fab005', r:9,  hp:1},    // avispa: dardos que desgastan; al morir suma chance de abeja reina
  cultist:{color:'#862e9c', r:9,  hp:0.5, sp:1.35}, // cultista: al morir suma chance de DIO
  healer: {color:'#38d9a9', r:10, hp:0.8},  // curandero: al ser atacado cura a los de alrededor
};
export const BOSSES = {   // hp = múltiplo de la vida de un enemigo base de esa oleada. every=null: aparece por chance/botón
  ice:     {name:'Rey helado',  hp:2.5, speed:0.35, r:16, color:'#74c0fc', every:8,  track:'coldfeeling',    sfx:'coldscreech'},
  buster:  {name:'Buster',      hp:2,   speed:3.5,  r:14, color:'#e03131', every:10, track:'incoming',       sfx:'beepbeep!'},
  shimada: {name:'Shimada',     hp:3,   speed:1.8,  r:12, color:'#9775fa', every:15, track:'thedragoncomes', sfx:'ulti'},
  makora:  {name:'Makora',      hp:8,   speed:0.8,  r:18, color:'#c92a2a', every:20, track:'divinegeneral',  sfx:'adaptation'},
  queen:   {name:'Abeja reina', hp:1.5, speed:1,    r:15, color:'#fab005', every:null, pri:99, track:'stickysituation', sfx:'ruidoreinaabeja'},
  dio:     {name:'DIO',         hp:2,   speed:0.9,  r:15, color:'#fcc419', every:null, pri:99, track:'theworld',        sfx:'wryyy'},  // 2 fases de hp x2
};
