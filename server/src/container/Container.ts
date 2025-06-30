import { WalletRepository } from '../repositories/WalletRepository.js';
import { GameRepository } from '../repositories/GameRepository.js';
import { CoinPackRepository } from '../repositories/CoinPackRepository.js';
import { WalletService } from '../services/WalletService.js';
import { GameService } from '../services/GameService.js';
import { RechargeService } from '../services/RechargeService.js';
import { WalletController } from '../controllers/WalletController.js';
import { GameController } from '../controllers/GameController.js';

// Dependency injection container
// This wires up all our dependencies following the Dependency Inversion Principle
// Makes testing easier and reduces coupling between components
export class Container {
  // Repositories (data layer)
  private walletRepository!: WalletRepository;
  private gameRepository!: GameRepository;
  private coinPackRepository!: CoinPackRepository;

  // Services (business logic layer)
  private walletService!: WalletService;
  private gameService!: GameService;
  private rechargeService!: RechargeService;

  // Controllers (presentation layer)
  private walletController!: WalletController;
  private gameController!: GameController;

  constructor() {
    this.initializeRepositories();
    this.initializeServices();
    this.initializeControllers();
  }

  // Initialize data repositories
  private initializeRepositories(): void {
    this.walletRepository = new WalletRepository();
    this.gameRepository = new GameRepository();
    this.coinPackRepository = new CoinPackRepository();
  }

  // Initialize business logic services
  // Services depend on repositories, so they're created after repositories
  private initializeServices(): void {
    this.walletService = new WalletService(this.walletRepository);
    this.gameService = new GameService(this.gameRepository, this.walletService);
    this.rechargeService = new RechargeService(this.coinPackRepository, this.walletService);
  }

  // Initialize controllers
  // Controllers depend on services, so they're created last
  private initializeControllers(): void {
    this.walletController = new WalletController(this.walletService, this.rechargeService);
    this.gameController = new GameController(this.gameService);
  }

  // Public getters for accessing initialized components
  public getWalletController(): WalletController {
    return this.walletController;
  }

  public getGameController(): GameController {
    return this.gameController;
  }

  // For testing or advanced use cases, expose services
  public getWalletService(): WalletService {
    return this.walletService;
  }

  public getGameService(): GameService {
    return this.gameService;
  }

  public getRechargeService(): RechargeService {
    return this.rechargeService;
  }
}
