const { ZodError } = require('zod');

class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

function notFound(req, res, next) {
  next(new AppError(404, `Route ${req.method} ${req.originalUrl} not found`));
}

function errorHandler(error, req, res, next) { // eslint-disable-line no-unused-vars
  let status = error.status || 500;
  let message = error.message || 'Internal server error';
  let details = error.details;

  if (error instanceof ZodError) {
    status = 422;
    message = 'Validation failed';
    details = error.issues.map(issue => ({
      field: issue.path.join('.'),
      message: issue.message
    }));
  } else if (error.name === 'CastError') {
    status = 400;
    message = 'Invalid resource id';
  } else if (error.code === 11000) {
    status = 409;
    message = `${Object.keys(error.keyPattern || {})[0] || 'Value'} already exists`;
  }

  if (status >= 500) req.log?.error({ err: error }, message);

  res.status(status).json({
    message,
    ...(details && { details }),
    ...(process.env.NODE_ENV !== 'production' && status >= 500
      ? { stack: error.stack }
      : {})
  });
}

module.exports = { AppError, notFound, errorHandler };
