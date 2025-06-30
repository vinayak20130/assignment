import { Wallet, Game, CoinPack } from './types';

// Define interfaces for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface RechargeResponse {
  success: boolean;
  newBalance: number;
  transaction: any;
}

interface JoinGameResponse {
  success: boolean;
  message: string;
  newBalance: number;
  transaction: any;
  gameSession: any;
}

// Configuration interface
interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

// HTTP client abstraction
class HttpClient {
  private config: ApiConfig;

  constructor(config: ApiConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    const controller = new AbortController();
    
    // Set timeout
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: `HTTP ${response.status}: ${response.statusText}` 
        }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error('Request timeout');
        }
        throw error;
      }
      
      throw new Error('Unknown error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }
}

// Repository pattern for API operations
class WalletRepository {
  constructor(private httpClient: HttpClient) {}

  async getWallet(): Promise<Wallet> {
    return this.httpClient.get<Wallet>('/api/wallet');
  }

  async rechargeWallet(packId: number): Promise<RechargeResponse> {
    return this.httpClient.post<RechargeResponse>('/api/wallet/recharge', { packId });
  }
}

class GameRepository {
  constructor(private httpClient: HttpClient) {}

  async getGames(): Promise<Game[]> {
    return this.httpClient.get<Game[]>('/api/games');
  }

  async joinGame(gameId: string): Promise<JoinGameResponse> {
    return this.httpClient.post<JoinGameResponse>('/api/games/join', { gameId });
  }
}

class CoinPackRepository {
  constructor(private httpClient: HttpClient) {}

  async getCoinPacks(): Promise<CoinPack[]> {
    return this.httpClient.get<CoinPack[]>('/api/coin-packs');
  }
}

// Main API service that orchestrates all repositories
class ApiService {
  private walletRepository: WalletRepository;
  private gameRepository: GameRepository;
  private coinPackRepository: CoinPackRepository;

  constructor() {
    const httpClient = new HttpClient({
      baseUrl: '',
      timeout: 10000
    });

    this.walletRepository = new WalletRepository(httpClient);
    this.gameRepository = new GameRepository(httpClient);
    this.coinPackRepository = new CoinPackRepository(httpClient);
  }

  // Wallet operations
  async getWallet(): Promise<Wallet> {
    return this.walletRepository.getWallet();
  }

  async rechargeWallet(packId: number): Promise<RechargeResponse> {
    return this.walletRepository.rechargeWallet(packId);
  }

  // Game operations
  async getGames(): Promise<Game[]> {
    return this.gameRepository.getGames();
  }

  async joinGame(gameId: string): Promise<JoinGameResponse> {
    return this.gameRepository.joinGame(gameId);
  }

  // Coin pack operations
  async getCoinPacks(): Promise<CoinPack[]> {
    return this.coinPackRepository.getCoinPacks();
  }
}

// Export singleton instance
export const apiService = new ApiService();
