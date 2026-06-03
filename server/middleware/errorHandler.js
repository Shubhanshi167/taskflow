const errorHandler = (
  err,
  req,
  res,
  next
) => {
  const statusCode =
    err.statusCode || 500;

  const message =
    err.message ||
    'Internal Server Error';

  console.error(
    `[ERROR] ${req.method} ${req.url} → ${statusCode}: ${message}`
  );

  res.status(statusCode).json({
    success: false,
    message,
    stack:
      process.env.NODE_ENV ===
      'development'
        ? err.stack
        : undefined,
  });
};

const notFound = (
  req,
  res,
  next
) => {
  const err = new Error(
    `Route not found: ${req.originalUrl}`
  );

  err.statusCode = 404;

  next(err);
};

export {
  errorHandler,
  notFound,
};