/**
 * Mini Social App Server
 **/

import express from 'express';
import cors from 'cors';
import { Container } from './src/container/Container.js';
import { setupRoutes } from './src/routes/index.js';
import { errorHandler, notFoundHandler, requestLogger } from './src/middleware/errorHandling.js';

// Configuration types
interface ServerConfig {
  port: number;
  host: string;
  nodeEnv: 'development' | 'production' | 'test';
  corsOrigin: string | string[];
  corsCredentials: boolean;
  rateLimitWindow: number;
  rateLimitMax: number;
  logLevel: string;
  requestTimeout: number;
  bodyLimit: string;
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  environment: string;
  version: string;
  memory: {
    used: number;
    total: number;
    usage: string;
  };
}

/**
 * Load server configuration from environment variables with defaults
 */
function loadConfiguration(): ServerConfig {
  return {
    port: parseInt(process.env.PORT || '5000'),
    host: process.env.HOST || '0.0.0.0',
    nodeEnv: (process.env.NODE_ENV as any) || 'development',
    corsOrigin: process.env.CORS_ORIGIN 
      ? process.env.CORS_ORIGIN.split(',').map(origin => origin.trim())
      : 'http://localhost:3000',
    corsCredentials: process.env.CORS_CREDENTIALS === 'true',
    rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW || '900000'),
    rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '100'),
    logLevel: process.env.LOG_LEVEL || 'info',
    requestTimeout: parseInt(process.env.REQUEST_TIMEOUT || '30000'),
    bodyLimit: process.env.BODY_LIMIT || '10mb'
  };
}

/**
 * Validate environment configuration
 */
function validateEnvironment(config: ServerConfig): void {
  const errors: string[] = [];
  
  if (isNaN(config.port) || config.port < 1 || config.port > 65535) {
    errors.push('PORT must be a valid number between 1 and 65535');
  }
  
  if (!['development', 'production', 'test'].includes(config.nodeEnv)) {
    errors.push('NODE_ENV must be one of: development, production, test');
  }
  
  if (isNaN(config.rateLimitWindow) || config.rateLimitWindow < 1000) {
    errors.push('RATE_LIMIT_WINDOW must be a valid number >= 1000ms');
  }
  
  if (isNaN(config.rateLimitMax) || config.rateLimitMax < 1) {
    errors.push('RATE_LIMIT_MAX must be a valid number >= 1');
  }
  
  if (errors.length > 0) {
    console.error('Environment validation failed:');
    errors.forEach(error => console.error(`  - ${error}`));
    throw new Error('Invalid environment configuration');
  }
}

/**
 * Configure basic security headers and rate limiting
 */
function setupSecurityMiddleware(app: express.Application, config: ServerConfig): void {
  // Basic security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    if (config.nodeEnv === 'production') {
      res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    }
    next();
  });
  
  // Simple rate limiting implementation
  const requestCounts = new Map<string, { count: number; resetTime: number }>();
  
  app.use('/api/', (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const now = Date.now();
    const windowStart = now - config.rateLimitWindow;
    
    // Clean expired entries
    for (const [key, value] of requestCounts.entries()) {
      if (value.resetTime < windowStart) {
        requestCounts.delete(key);
      }
    }
    
    const currentRequest = requestCounts.get(ip);
    if (!currentRequest) {
      requestCounts.set(ip, { count: 1, resetTime: now });
      next();
    } else if (currentRequest.resetTime < windowStart) {
      requestCounts.set(ip, { count: 1, resetTime: now });
      next();
    } else if (currentRequest.count >= config.rateLimitMax) {
      console.warn(`Rate limit exceeded for IP: ${ip} - ${req.method} ${req.path}`);
      res.status(429).json({
        success: false,
        error: 'Too many requests from this IP, please try again later',
        retryAfter: Math.ceil(config.rateLimitWindow / 1000)
      });
    } else {
      currentRequest.count++;
      next();
    }
  });
}

/**
 * Configure basic Express middleware
 */
function setupBasicMiddleware(app: express.Application, config: ServerConfig): void {
  // CORS configuration
  app.use(cors({
    origin: config.corsOrigin,
    credentials: config.corsCredentials,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
  }));
  
  // Body parsing
  app.use(express.json({ 
    limit: config.bodyLimit,
    type: 'application/json'
  }));
  
  app.use(express.urlencoded({ 
    extended: true, 
    limit: config.bodyLimit 
  }));
  
  // Request timeout handling
  app.use((req, res, next) => {
    req.setTimeout(config.requestTimeout, () => {
      console.warn(`Request timeout: ${req.method} ${req.path}`);
      if (!res.headersSent) {
        res.status(408).json({
          success: false,
          error: 'Request timeout'
        });
      }
    });
    next();
  });
  
  // Request logging in development
  if (config.nodeEnv === 'development') {
    app.use(requestLogger);
  }
}

/**
 * Get current system health status
 */
function getHealthStatus(): HealthStatus {
  const memUsage = process.memoryUsage();
  const totalMem = memUsage.heapTotal;
  const usedMem = memUsage.heapUsed;
  
  return {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    memory: {
      used: usedMem,
      total: totalMem,
      usage: `${Math.round((usedMem / totalMem) * 100)}%`
    }
  };
}

/**
 * Setup health monitoring endpoints
 */
function setupHealthEndpoints(app: express.Application): void {
  app.get('/health', (req, res) => {
    const health = getHealthStatus();
    res.json(health);
  });
  
  app.get('/health/detailed', (req, res) => {
    const health = getHealthStatus();
    const detailed = {
      ...health,
      system: {
        platform: process.platform,
        arch: process.arch,
        nodeVersion: process.version,
        pid: process.pid
      }
    };
    res.json(detailed);
  });
  
  app.get('/ready', (req, res) => {
    res.status(200).json({ status: 'ready' });
  });
  
  app.get('/live', (req, res) => {
    res.status(200).json({ status: 'alive' });
  });
}

/**
 * Create and configure the Express application
 */
function createApplication(config: ServerConfig): express.Application {
  const app = express();
  
  setupSecurityMiddleware(app, config);
  setupBasicMiddleware(app, config);
  setupHealthEndpoints(app);
  
  console.log('Initializing dependency injection container...');
  const container = new Container();
  console.log('Container initialized');
  
  console.log('Setting up API routes...');
  setupRoutes(
    app,
    container.getWalletController(),
    container.getGameController()
  );
  console.log('Routes configured');
  
  // Error handling middleware (must be last)
  app.use(notFoundHandler);
  app.use(errorHandler);
  
  return app;
}

/**
 * Setup graceful shutdown handling
 */
function setupGracefulShutdown(server: any): void {
  const shutdown = (signal: string) => {
    console.log(`\n${signal} received, shutting down gracefully...`);
    
    server.close((err: any) => {
      if (err) {
        console.error('Error during server shutdown:', err);
        process.exit(1);
      }
      
      console.log('Server closed successfully');
      process.exit(0);
    });
    
    // Force shutdown after 10 seconds
    setTimeout(() => {
      console.error('Forced shutdown after timeout');
      process.exit(1);
    }, 10000);
  };
  
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGQUIT', () => shutdown('SIGQUIT'));
}

/**
 * Setup global error handlers
 */
function setupGlobalErrorHandlers(): void {
  process.on('uncaughtException', (error: Error) => {
    console.error('Uncaught Exception:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
  });
  
  process.on('unhandledRejection', (reason: any, promise: Promise<any>) => {
    console.error('Unhandled Rejection at:', promise);
    console.error('Reason:', reason);
  });
}

/**
 * Start the server
 */
async function startServer(): Promise<void> {
  console.log('Mini Social App Server');
  console.log('Starting up...');
  
  try {
    console.log('Loading configuration...');
    const config = loadConfiguration();
    validateEnvironment(config);
    console.log('Configuration validated');
    
    setupGlobalErrorHandlers();
    
    console.log('Creating Express application...');
    const app = createApplication(config);
    console.log('Application created');
    
    console.log('Starting HTTP server...');
    const server = app.listen(config.port, () => {
      console.log('\nServer started successfully');
      console.log(`Server running on: http://localhost:${config.port}`);
      console.log(`Environment: ${config.nodeEnv}`);
      console.log(`CORS enabled for: ${Array.isArray(config.corsOrigin) ? config.corsOrigin.join(', ') : config.corsOrigin}`);
      console.log(`Memory usage: ${getHealthStatus().memory.usage}`);
      console.log('\nAvailable endpoints:');
      console.log(`  Health: http://localhost:${config.port}/health`);
      console.log(`  API: http://localhost:${config.port}/api`);
      console.log(`  Wallet: http://localhost:${config.port}/api/wallet`);
      console.log(`  Games: http://localhost:${config.port}/api/games`);
      console.log('\nReady to accept connections');
    });
    
    setupGracefulShutdown(server);
    
    console.log(`Startup completed in ${Math.round(process.uptime() * 1000)}ms`);
    
  } catch (error) {
    console.error('\nFailed to start server:', error);
    
    if (error instanceof Error) {
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        timestamp: new Date().toISOString()
      });
    }
    
    process.exit(1);
  }
}

// Start the server immediately when this file is run
startServer().catch((error) => {
  console.error('Fatal error during startup:', error);
  process.exit(1);
});

export { 
  startServer, 
  createApplication, 
  loadConfiguration, 
  validateEnvironment,
  getHealthStatus,
  type ServerConfig,
  type HealthStatus 
};
