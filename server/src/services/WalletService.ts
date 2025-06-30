import { WalletRepository } from '../repositories/WalletRepository.js';
import { Wallet, Transaction } from '../types/index.js';

// Service layer for wallet business logic
// Handles all wallet operations including validation and business rules
export class WalletService {
  constructor(private walletRepository: WalletRepository) {}

  // Get wallet information for a user
  async getWallet(userId: string): Promise<Wallet> {
    const wallet = await this.walletRepository.findByUserId(userId);
    
    if (!wallet) {
      throw new Error('Wallet not found for user');
    }

    return wallet;
  }

  // Add coins to a user's wallet
  async creditCoins(userId: string, amount: number, description: string): Promise<Wallet> {
    if (amount <= 0) {
      throw new Error('Credit amount must be positive');
    }

    await this.walletRepository.addTransaction(userId, {
      type: 'credit',
      amount,
      description
    });

    return this.getWallet(userId);
  }

  // Remove coins from a user's wallet
  async debitCoins(userId: string, amount: number, description: string): Promise<Wallet> {
    if (amount <= 0) {
      throw new Error('Debit amount must be positive');
    }

    const wallet = await this.getWallet(userId);

    // Business rule: prevent overdraft
    if (wallet.totalCoins < amount) {
      throw new Error('Insufficient balance');
    }

    await this.walletRepository.addTransaction(userId, {
      type: 'debit',
      amount,
      description
    });

    return this.getWallet(userId);
  }

  // Check if user has sufficient balance for an operation
  async hasSufficientBalance(userId: string, amount: number): Promise<boolean> {
    try {
      const wallet = await this.getWallet(userId);
      return wallet.totalCoins >= amount;
    } catch (error) {
      return false;
    }
  }

  // Get recent transactions for a user
  async getRecentTransactions(userId: string, limit: number = 10): Promise<Transaction[]> {
    const wallet = await this.getWallet(userId);
    return wallet.transactions.slice(0, limit);
  }
}
