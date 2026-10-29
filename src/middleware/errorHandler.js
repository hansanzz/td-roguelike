// Manejo de errores centralizado: AppError -> su código; cualquier otro -> 500.
module.exports = (err, req, res, next) => {
  if (err.status) return res.status(err.status).json({ error: err.message });
  console.error(err);
  res.status(500).json({ error: 'Error del servidor' });
};
