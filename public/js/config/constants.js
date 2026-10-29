// Constantes del tablero y de dificultad. Ajustá estos números para balancear el juego.

export const T = 40;                  // tamaño de una casilla en px (sprite de 16x16 escalado)
export const COLS = 20;
export const ROWS = 11;
export const W = COLS * T;               // 800 px
export const H = ROWS * T;               // 440 px
// ---- Dificultad (ajustá estos números) ----
export const HP_GROWTH = 2;   // la vida base se multiplica por esto en cada oleada
export const REWARD_GROWTH = 1.5; // el oro por enemigo crece así por oleada (menor que HP_GROWTH: la economía aprieta)
export const STINK_R = 70;
export const REFLECT = 0.5;        // el monje devuelve esta fracción del ataque (como % de vida máx. del atacante)
export const PUSH = 5 * T;         // empuje del monje: 5 casillas
export const MAX_BOSSES = 2;       // jefes máximos por oleada
export const Q = new URLSearchParams(location.search);
export const TEST = Q.has('wave'); // modo prueba: ?wave=20&gold=5000 (no guarda puntaje)
