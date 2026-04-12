const errorMiddleware = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  console.error(err);

  // Sequelize validation error
  if (err.name === 'SequelizeValidationError') {
    const message = err.errors.map(e => e.message).join(', ');
    error = { message, statusCode: 400 };
  }

  // Sequelize unique constraint error
  if (err.name === 'SequelizeUniqueConstraintError') {
    const message = 'Duplicate field value entered';
    error = { message, statusCode: 400 };
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    const message = 'Invalid token';
    error = { message, statusCode: 401 };
  }

  if (err.name === 'TokenExpiredError') {
    const message = 'Token expired';
    error = { message, statusCode: 401 };
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });
};

module.exports = { errorMiddleware };