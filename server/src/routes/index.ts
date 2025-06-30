import express from 'express';
import { WalletController } from '../controllers/WalletController.js';
import { GameController } from '../controllers/GameController.js';
import { createWalletRoutes, createCoinPackRoutes } from './walletRoutes.js';
import { createGameRoutes } from './gameRoutes.js';

// Configure all application routes
// This is the main routing setup that connects controllers to endpoints
export function setupRoutes(
  app: express.Application,
  walletController: WalletController,
  gameController: GameController
): void {
  
  // Health check endpoint for monitoring
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'Server is running',
      timestamp: new Date().toISOString(),
      version: '1.0.0'
    });
  });

  // Mount wallet-related routes
  app.use('/api/wallet', createWalletRoutes(walletController));
  app.use('/api/coin-packs', createCoinPackRoutes(walletController));

  // Mount game-related routes
  app.use('/api/games', createGameRoutes(gameController));

  // API documentation endpoint (basic info)
  app.get('/api', (req, res) => {
    res.json({
      name: 'Mini Social App API',
      version: '1.0.0',
      endpoints: {
        wallet: '/api/wallet',
        games: '/api/games',
        coinPacks: '/api/coin-packs',
        health: '/api/health'
      }
    });
  });
}
