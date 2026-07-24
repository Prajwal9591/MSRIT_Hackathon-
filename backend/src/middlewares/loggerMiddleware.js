import morgan from 'morgan';
import { logger } from '../utils/logger.js';

export const loggerMiddleware = morgan((tokens, req, res) => {
  const status = tokens.status(req, res);
  const logStr = `${tokens.method(req, res)} ${tokens.url(req, res)} ${status} - ${tokens['response-time'](req, res)} ms`;

  if (status >= 400) {
    logger.warn(logStr);
  } else {
    logger.info(logStr);
  }
  return null;
});
