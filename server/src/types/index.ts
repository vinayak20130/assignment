// Core domain models for the application
// These interfaces define the shape of our data without implementation details

export interface User {
  id: string;
  email: string;
  name: string;
  createdAt: string;
}

export interface Wallet {
  userId: string;
  totalCoins: number;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: string;
}

export interface Game {
  id: string;
  name: string;
  entryCost: number;
  currentPlayers: number;
  maxPlayers: number;
  description: string;
  icon: string;
}

export interface CoinPack {
  id: number;
  coins: number;
  price: number;
  bonus: number;
}

export interface GameSession {
  sessionId: string;
  gameId: string;
  gameName: string;
}

// Service response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface RechargeResult {
  success: boolean;
  newBalance: number;
  transaction: Transaction;
}

export interface JoinGameResult {
  success: boolean;
  message: string;
  newBalance: number;
  transaction: Transaction;
  gameSession: GameSession;
}
