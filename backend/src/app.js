import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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

// Base Route welcome info
app.get('/', (req, res) => {
  res.json({
    service: 'AegisBlast Express API Engine',
    version: '1.0.0',
    status: 'running',
    swaggerDocs: 'http://localhost:5000/api-docs',
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

// API Routes Router
app.use('/api/v1', routes);
app.use('/', routes); // Also mount at root for direct /upload, /analyze, etc.

// 404 Handler
app.use(notFoundMiddleware);

// Global Error Handler
app.use(errorMiddleware);

export default app;
