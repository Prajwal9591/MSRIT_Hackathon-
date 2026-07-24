import { ApiError } from '../utils/apiError.js';

export const validateRequestBody = (requiredFields = []) => {
  return (req, res, next) => {
    if (!req.body || typeof req.body !== 'object') {
      return next(ApiError.badRequest('Request body must be a JSON object'));
    }

    const missingFields = requiredFields.filter((field) => !(field in req.body));

    if (missingFields.length > 0) {
      return next(
        ApiError.badRequest(`Missing required field(s): ${missingFields.join(', ')}`, missingFields)
      );
    }

    next();
  };
};
