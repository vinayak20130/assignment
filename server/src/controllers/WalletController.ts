import { Request, Response } from 'express';
import { WalletService } from '../services/WalletService.js';
import { RechargeService } from '../services/RechargeService.js';

// Controller for wallet-related HTTP endpoints
// Handles request/response logic and delegates business operations to services
export class WalletController {
  constructor(
    private walletService: WalletService,
    private rechargeService: RechargeService
  ) {}

  // Get wallet information for the current user
  getWallet = async (req: Request, res: Response): Promise<void> => {
    try {
      // In a real app, we'd get user ID from authentication token
      const userId = 'user-123';
      
      const wallet = await this.walletService.getWallet(userId);
      res.json(wallet);
    } catch (error) {
      res.status(404).json({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get wallet'
      });
    }
  };

  // Process a coin recharge request
  rechargeWallet = async (req: Request, res: Response): Promise<void> => {
    try {
      const { packId } = req.body;
      
      // Validate request body
      if (!packId || typeof packId !== 'number') {
        res.status(400).json({
          success: false,
          error: 'Pack ID is required and must be a number'
        });
        return;
      }

      // In a real app, we'd get user ID from authentication token
      const userId = 'user-123';
      
      const result = await this.rechargeService.processRecharge(userId, packId);
      res.json(result);
    } catch (error) {
      res.status(400).json({
        success: false,
        error: error instanceof Error ? error.message : 'Recharge failed'
      });
    }
  };

  // Get available coin packs
  getCoinPacks = async (req: Request, res: Response): Promise<void> => {
    try {
      const coinPacks = await this.rechargeService.getAvailablePacks();
      res.json(coinPacks);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get coin packs'
      });
    }
  };
}
