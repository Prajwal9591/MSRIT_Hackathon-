import { ApiError } from '../utils/apiError.js';

/**
 * Universal Request Validation Middleware
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    const errors = [];

    // Validate body rules
    if (schema.body) {
      Object.keys(schema.body).forEach((key) => {
        const rule = schema.body[key];
        const val = req.body?.[key];

        if (rule.required && (val === undefined || val === null || val === '')) {
          errors.push(`Field '${key}' in body is required`);
        } else if (val !== undefined && rule.type && typeof val !== rule.type && !Array.isArray(val)) {
          errors.push(`Field '${key}' in body must be of type ${rule.type}`);
        }
      });
    }

    // Validate query parameters rules
    if (schema.query) {
      Object.keys(schema.query).forEach((key) => {
        const rule = schema.query[key];
        const val = req.query?.[key];

        if (rule.required && (!val || val === '')) {
          errors.push(`Query parameter '${key}' is required`);
        }
      });
    }

    if (errors.length > 0) {
      return next(ApiError.badRequest(`Validation Failed: ${errors.join(', ')}`));
    }

    next();
  };
};
