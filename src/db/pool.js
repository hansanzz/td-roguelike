// Pool de conexiones a MySQL (WAMP).
const mysql = require('mysql2/promise');
const config = require('../config');

module.exports = mysql.createPool(config.db);
