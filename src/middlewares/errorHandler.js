const ApiError = require('../utils/ApiError');
const { logError } = require('../utils/logger');

const isApiRequest = (req) => {
  if (req.originalUrl.startsWith('/api')) {
    return true;
  }

  const acceptHeader = req.get('accept') || '';
  return !acceptHeader.includes('text/html');
};

const statusTitles = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Page Not Found',
  405: 'Method Not Allowed',
  408: 'Request Timeout',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout'
};

const notFound = (req, res, next) => {
  next(new ApiError(404, 'Resource not found'));
};

const errorHandler = (error, req, res, next) => {
  const isCsrfError = error.code === 'EBADCSRFTOKEN';
  const normalizedError = isCsrfError ? new ApiError(403, 'Invalid CSRF token') : error;
  const statusCode = normalizedError.statusCode || 500;
  const isOperational = normalizedError instanceof ApiError;
  const message = isOperational ? normalizedError.message : 'Internal server error';

  logError(normalizedError, {
    path: req.path,
    method: req.method,
    ip: req.ip,
    requestId: req.id
  });

  if (res.headersSent) {
    return next(normalizedError);
  }

  if (isApiRequest(req)) {
    return res.status(statusCode).json({
      success: false,
      message,
      ...(normalizedError.details ? { details: normalizedError.details } : {})
    });
  }

  return res.status(statusCode).render('pages/error', {
    title: `EngineerHub - ${statusTitles[statusCode] || 'Error'}`,
    page: 'error',
    statusCode,
    statusTitle: statusTitles[statusCode] || 'Something went wrong',
    message,
    details: normalizedError.details
  });
};

module.exports = { notFound, errorHandler };