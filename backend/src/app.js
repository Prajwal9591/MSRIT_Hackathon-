import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import { config } from './config/environment.js';
import { loggerMiddleware } from './middlewares/loggerMiddleware.js';
import { notFoundMiddleware } from './middlewares/notFoundMiddleware.js';
import { errorMiddleware } from './middlewares/errorMiddleware.js';
import routes from './routes/index.js';

const app = express();

// Security Middlewares (configured to allow inline Swagger UI execution)
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

// CORS Configuration
app.use(
  cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

// Body Parsing Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Logging Middleware
app.use(loggerMiddleware);

// Ignore browser favicon requests
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Serve Interactive Swagger API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use('/api/v1/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API Routes Router
app.use('/api/v1', routes);
app.use('/api', routes);

// Serve frontend static files in production
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const frontendDist = path.resolve(__dirname, '../../frontend/dist');

if (config.nodeEnv === 'production' && fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health') || req.path.startsWith('/api-docs')) {
      return next();
    }
    res.sendFile(path.join(frontendDist, 'index.html'));
  });
} else {
  // Base Route welcome info in development
  app.get('/', (req, res) => {
    res.json({
      service: 'AegisBlast Express API Engine',
      version: '1.0.0',
      status: 'running',
      swaggerDocs: '/api-docs',
      endpoints: [
        '/health',
        '/upload',
        '/analyze',
        '/metadata',
        '/dependency',
        '/impact',
        '/explain',
        '/dashboard'
      ]
    });
  });
  app.use('/', routes);
}

// 404 Handler
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorMiddleware);

export default app;
