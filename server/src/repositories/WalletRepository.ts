import { Wallet, Transaction } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

// Repository for wallet data operations
// In a real application, this would interact with a database
// Currently using in-memory storage for demo purposes
export class WalletRepository {
  private wallets = new Map<string, Wallet>();

  constructor() {
    this.initializeDefaultData();
  }

  // Set up initial wallet data for demonstration
  private initializeDefaultData(): void {
    const defaultWallet: Wallet = {
      userId: 'user-123',
      totalCoins: 100,
      transactions: [
        {
          id: uuidv4(),
          type: 'credit',
          amount: 50,
          description: 'Welcome bonus',
          timestamp: new Date('2025-06-25').toISOString()
        },
        {
          id: uuidv4(),
          type: 'credit',
          amount: 50,
          description: 'Daily reward',
          timestamp: new Date('2025-06-26').toISOString()
        }
      ]
    };

    this.wallets.set(defaultWallet.userId, defaultWallet);
  }

  // Retrieve wallet by user ID
  async findByUserId(userId: string): Promise<Wallet | null> {
    return this.wallets.get(userId) || null;
  }

  // Update existing wallet data
  async update(userId: string, wallet: Wallet): Promise<Wallet> {
    this.wallets.set(userId, wallet);
    return wallet;
  }

  // Add a new transaction to user's wallet
  async addTransaction(userId: string, transaction: Omit<Transaction, 'id' | 'timestamp'>): Promise<Transaction> {
    const wallet = await this.findByUserId(userId);
    if (!wallet) {
      throw new Error('Wallet not found');
    }

    const newTransaction: Transaction = {
      id: uuidv4(),
      timestamp: new Date().toISOString(),
      ...transaction
    };

    // Add transaction to the beginning of the array for chronological order
    wallet.transactions.unshift(newTransaction);
    
    // Update wallet balance based on transaction type
    if (transaction.type === 'credit') {
      wallet.totalCoins += transaction.amount;
    } else {
      wallet.totalCoins -= transaction.amount;
    }

    await this.update(userId, wallet);
    return newTransaction;
  }
}
