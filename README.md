# TD Roguelike

Tower defense roguelike en el navegador (JS, HTML, CSS) con login y base de datos MySQL (WAMP).
La API es un servidor Node.js por capas; **toda la lógica de datos vive en SQL** (procedimientos almacenados).

## Cómo ejecutarlo

1. Encendé WAMP y, en phpMyAdmin, importá **en este orden**: `sql/01_tablas.sql` y después `sql/02_procedimientos.sql`.
2. En una terminal, dentro de esta carpeta: `npm install` y `node server.js`.
3. Abrí `http://localhost:3000`.

Configuración (opcional, por variables de entorno): `PORT`, `HOST`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`. Ver `src/config.js`.
Tests: `npm test` (no necesitan MySQL ni navegador).
Modo prueba del juego: `http://localhost:3000/?wave=20&gold=5000` (empieza en esa oleada, no guarda puntaje).

## Estructura

```
server.js                    Entrada: arranca la app
src/                         BACKEND (Node + Express), por capas
  config.js                  Configuración central
  app.js                     Arma Express: middlewares, API, estáticos
  routes/                    URL -> controlador            (auth.routes, score.routes, index)
  controllers/               Capa HTTP: lee req, arma res  (auth.controller, score.controller)
  services/                  Reglas de la aplicación       (auth.service, score.service)
  db/                        Acceso a datos (pool y CALL a procedimientos)
  middleware/                Sesión por cookie y manejo de errores
  errors.js, utils/          AppError y asyncHandler
sql/                         01_tablas.sql, 02_procedimientos.sql (validación, hash, sesiones, puntajes)
public/                      FRONTEND
  index.html, style.css, img/, sounds/
  js/
    main.js                  Entrada: conecta módulos y arranca el bucle
    config/                  DATOS puros: constants, map, towers, enemies, relics
    core/                    state (estado S y ui), audio, dom
    api/client.js            Único lugar del front que conoce las URLs de la API
    systems/                 LÓGICA del juego (sin tocar el DOM salvo avisos)
      update.js              Un paso de simulación por frame (orquesta a los demás)
      towers.js              Stats y comportamiento de cada torre
      enemies.js, bosses.js  Turno del enemigo y habilidades de cada jefe
      spawner.js, combat.js  Creación de enemigos / daño, muerte y empuje
      progression.js         Oleadas, reliquias, desbloqueos, game over
    ui/                      Pantalla: render (canvas), hud, input, nodes, tutorial, auth
tests/                       Pruebas con node:test
docs/API.md                  Documentación de los endpoints
```

## Arquitectura

```
Backend:   HTTP -> routes -> controllers -> services -> db/procedures -> procedimientos SQL (MySQL)
Frontend:  input (clics) -> systems (reglas) -> state (S) -> ui/render (dibujo) ; api/client -> backend
```

Decisiones de diseño:

- **Una responsabilidad por capa.** Las rutas solo mapean URLs; los controladores solo traducen HTTP; los servicios coordinan; `db/procedures.js` es el único archivo que habla con MySQL.
- **Lógica en la base.** Registro, login, sesiones, puntajes y ranking son procedimientos SQL. Node solo genera el token aleatorio y reenvía.
- **Errores centralizados.** Los errores de negocio de SQL (`SQLSTATE 45000`) se convierten en `AppError` con su código HTTP; `errorHandler` los responde.
- **Datos separados del comportamiento (front).** `config/` solo tiene datos (torres, jefes, reliquias, constantes). El comportamiento está en `systems/`, en tablas de despacho (`BEHAVIOR` por tipo de torre, `BOSS_AI` por jefe) en lugar de cadenas `if/else`.
- **Estado único y explícito.** `core/state.js` exporta `S` (la partida) y `ui` (selección); no hay variables globales sueltas.
- **Módulos ES.** Cada archivo importa lo que usa; el bucle principal solo está en `main.js`.

## Cómo extender

- **Torre nueva:** agregá su entrada en `config/towers.js` y, si tiene comportamiento propio, una función `tickX` en `systems/towers.js` registrada en `BEHAVIOR`.
- **Jefe nuevo:** entrada en `config/enemies.js` (BOSSES) y una función en `systems/bosses.js` registrada en `BOSS_AI`.
- **Reliquia nueva:** entrada en `config/relics.js` y su efecto donde corresponda (por ejemplo `systems/combat.js`).
- **Endpoint nuevo:** procedimiento en SQL -> función en un servicio -> controlador -> ruta.

Sprites esperados en `public/img/` (ver `img/LEEME.txt`) y audios en `public/sounds/` (ver `sounds/LEEME.txt`).
