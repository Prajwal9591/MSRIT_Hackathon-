import app from './app.js';
import { config } from './config/environment.js';
import { logger } from './utils/logger.js';

let currentPort = Number(config.port || 5000);

const startServer = (portToTry) => {
  const server = app.listen(portToTry, '0.0.0.0', () => {
    logger.info(`⚡ AegisBlast Express Server running on port ${portToTry} [${config.nodeEnv}]`);
    logger.info(`🔗 Available Endpoints: http://127.0.0.1:${portToTry}/health, /upload, /analyze, /metadata, /dependency, /impact, /explain`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.warn(`Port ${portToTry} is already in use. Retrying on port ${portToTry + 1}...`);
      startServer(portToTry + 1);
    } else {
      logger.error(`Server error: ${err.message}`, { stack: err.stack });
      process.exit(1);
    }
  });

  return server;
};

const server = startServer(currentPort);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  logger.error(`Unhandled Rejection: ${err.message}`, { stack: err.stack });
  server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  logger.error(`Uncaught Exception: ${err.message}`, { stack: err.stack });
  process.exit(1);
});
