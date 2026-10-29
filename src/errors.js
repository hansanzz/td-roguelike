// Error esperado de la API (validación, no logueado...). Lleva su código HTTP.
class AppError extends Error {
  constructor(message, status = 400) { super(message); this.status = status; }
}
module.exports = { AppError };
