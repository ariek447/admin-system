const notFound = (req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON inválido' });
  }

  console.error(err);
  return res.status(500).json({ error: 'Error interno del servidor' });
};

module.exports = { notFound, errorHandler };
