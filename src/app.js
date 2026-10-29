// Arma la aplicación Express: middlewares, API y archivos estáticos.
const express = require('express');
const config = require('./config');
const apiRouter = require('./routes');
const { AppError } = require('./errors');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.use(express.json());
app.use(express.static(config.publicDir));
app.use('/api', apiRouter);
app.use('/api', (req, res, next) => next(new AppError('Ruta no encontrada', 404)));
app.use(errorHandler);

module.exports = app;
