import express from 'express';
import cors from 'cors';
import { Container } from './container/Container.js';
import { setupRoutes } from './routes/index.js';
import { errorHandler, notFoundHandler, requestLogger } from './middleware/errorHandling.js';

// Application configuration
interface ServerConfig {
  port: number;
  corsOrigin: string;
  nodeEnv: string;
}

// Load configuration from environment variables with sensible defaults
function getConfig(): ServerConfig {
  return {
    port: parseInt(process.env.PORT || '5000'),
    corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:3000',
    nodeEnv: process.env.NODE_ENV || 'development'
  };
}

// Initialize and configure the Express application
function createApp(config: ServerConfig): express.Application {
  const app = express();

  // Basic middleware setup
  app.use(cors({ 
    origin: config.corsOrigin,
    credentials: true 
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Add request logging in development
  if (config.nodeEnv === 'development') {
    app.use(requestLogger);
  }

  return app;
}

// Main application bootstrap function
function startServer(): void {
  const config = getConfig();
  const app = createApp(config);

  // Initialize dependency injection container
  // This creates all our repositories, services, and controllers
  const container = new Container();

  // Set up all API routes
  setupRoutes(
    app,
    container.getWalletController(),
    container.getGameController()
  );

  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);

  // Start the server
  const server = app.listen(config.port, () => {
    console.log(`Server running on http://localhost:${config.port}`);
    console.log(`Environment: ${config.nodeEnv}`);
    console.log(`CORS enabled for: ${config.corsOrigin}`);
  });

  // Graceful shutdown handling
  process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    server.close(() => {
      console.log('Server closed');
      process.exit(0);
    });
  });
}

// Start the application
// Only run if this file is executed directly (not imported)
if (import.meta.url === `file://${process.argv[1]}`) {
  startServer();
}

export { startServer, createApp, getConfig };
