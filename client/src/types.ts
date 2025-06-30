export interface Transaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: string;
}

export interface Wallet {
  userId: string;
  totalCoins: number;
  transactions: Transaction[];
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
