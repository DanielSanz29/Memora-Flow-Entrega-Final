export function notFoundHandler(req, res, next) {
  res.status(404).json({ message: 'Ruta no encontrada' });
}

export function errorHandler(error, req, res, next) {
  const status = error.statusCode || 500;
  const message = status === 500 ? 'Error interno del servidor' : error.message;

  if (status === 500) {
    console.error(error);
  }

  res.status(status).json({
    message,
    ...(process.env.NODE_ENV === 'development' && { detail: error.message })
  });
}
