class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    Error(message);
    this.statCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError