import { ApiError } from '../utils/apiError.js';

export const notFoundMiddleware = (req, res, next) => {
  const error = ApiError.notFound(`Route not found: ${req.originalUrl}`);
  next(error);
};
