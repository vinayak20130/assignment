import { Router } from 'express';
import { WalletController } from '../controllers/WalletController.js';
import { asyncHandler } from '../middleware/errorHandling.js';

// Define wallet-related routes
// These handle all wallet operations including balance and recharge
export function createWalletRoutes(walletController: WalletController): Router {
  const router = Router();

  // GET /api/wallet - Get user's wallet information
  router.get('/', asyncHandler(walletController.getWallet));

  // POST /api/wallet/recharge - Recharge wallet with coin pack
  router.post('/recharge', asyncHandler(walletController.rechargeWallet));

  return router;
}

// Define coin pack routes for recharge options
export function createCoinPackRoutes(walletController: WalletController): Router {
  const router = Router();

  // GET /api/coin-packs - Get available coin packs
  router.get('/', asyncHandler(walletController.getCoinPacks));

  return router;
}
