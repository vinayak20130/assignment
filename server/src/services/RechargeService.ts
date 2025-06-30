import { CoinPackRepository } from '../repositories/CoinPackRepository.js';
import { WalletService } from './WalletService.js';
import { RechargeResult } from '../types/index.js';

// Service layer for handling coin recharge operations
// Manages the purchase of coin packs and wallet crediting
export class RechargeService {
  constructor(
    private coinPackRepository: CoinPackRepository,
    private walletService: WalletService
  ) {}

  // Process a coin pack purchase
  async processRecharge(userId: string, packId: number): Promise<RechargeResult> {
    const pack = await this.coinPackRepository.findById(packId);
    
    if (!pack) {
      throw new Error('Invalid coin pack selected');
    }

    // Calculate total coins including bonus
    const totalCoins = this.coinPackRepository.calculateTotalCoins(pack);
    const description = this.coinPackRepository.getPackDescription(pack);

    // In a real application, this is where we would:
    // 1. Process payment with payment gateway
    // 2. Verify payment success
    // 3. Handle payment failures gracefully
    
    // For demo purposes, we'll assume payment always succeeds
    const updatedWallet = await this.walletService.creditCoins(
      userId,
      totalCoins,
      description
    );

    return {
      success: true,
      newBalance: updatedWallet.totalCoins,
      transaction: updatedWallet.transactions[0] // Most recent transaction
    };
  }

  // Get all available coin packs for display
  async getAvailablePacks() {
    return this.coinPackRepository.findAll();
  }

  // Calculate the value proposition of a pack (coins per dollar)
  async getPackValue(packId: number): Promise<number | null> {
    const pack = await this.coinPackRepository.findById(packId);
    
    if (!pack || pack.price === 0) {
      return null;
    }

    const totalCoins = this.coinPackRepository.calculateTotalCoins(pack);
    return totalCoins / pack.price;
  }

  // Get the most valuable pack (best coins per dollar ratio)
  async getBestValuePack() {
    const packs = await this.getAvailablePacks();
    let bestPack = packs[0];
    let bestValue = 0;

    for (const pack of packs) {
      const value = await this.getPackValue(pack.id);
      if (value && value > bestValue) {
        bestValue = value;
        bestPack = pack;
      }
    }

    return bestPack;
  }
}
