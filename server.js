// Punto de entrada del servidor: solo arranca la app.
const app = require('./src/app');
const config = require('./src/config');

app.listen(config.port, config.host, () => console.log(`Juego en http://localhost:${config.port}`));
