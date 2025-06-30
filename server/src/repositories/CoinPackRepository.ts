import { CoinPack } from '../types/index.js';

// Repository for coin pack data
// Manages the available recharge options
export class CoinPackRepository {
  private coinPacks: CoinPack[] = [
    { id: 1, coins: 50, price: 0.99, bonus: 0 },
    { id: 2, coins: 100, price: 1.99, bonus: 10 },
    { id: 3, coins: 250, price: 4.99, bonus: 50 },
    { id: 4, coins: 500, price: 9.99, bonus: 150 }
  ];

  // Get all available coin packs
  async findAll(): Promise<CoinPack[]> {
    return [...this.coinPacks];
  }

  // Find a specific coin pack by ID
  async findById(packId: number): Promise<CoinPack | null> {
    const pack = this.coinPacks.find(p => p.id === packId);
    return pack ? { ...pack } : null;
  }

  // Calculate total coins including bonus for a pack
  calculateTotalCoins(pack: CoinPack): number {
    return pack.coins + pack.bonus;
  }

  // Get pack description for transaction records
  getPackDescription(pack: CoinPack): string {
    if (pack.bonus > 0) {
      return `Recharge: ${pack.coins} coins + ${pack.bonus} bonus`;
    }
    return `Recharge: ${pack.coins} coins`;
  }
}
