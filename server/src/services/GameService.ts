import { GameRepository } from '../repositories/GameRepository.js';
import { WalletService } from './WalletService.js';
import { Game, GameSession, JoinGameResult } from '../types/index.js';
import { v4 as uuidv4 } from 'uuid';

// Service layer for game business logic
// Handles game operations including joining games and managing player counts
export class GameService {
  constructor(
    private gameRepository: GameRepository,
    private walletService: WalletService
  ) {}

  // Get all available games
  async getAllGames(): Promise<Game[]> {
    return this.gameRepository.findAll();
  }

  // Get a specific game by ID
  async getGameById(gameId: string): Promise<Game> {
    const game = await this.gameRepository.findById(gameId);
    
    if (!game) {
      throw new Error('Game not found');
    }

    return game;
  }

  // Handle a user joining a game
  async joinGame(userId: string, gameId: string): Promise<JoinGameResult> {
    const game = await this.getGameById(gameId);

    // Business rule validation: check if game is full
    if (game.currentPlayers >= game.maxPlayers) {
      throw new Error('Game is full');
    }

    // Business rule validation: check if user has sufficient coins
    const hasFunds = await this.walletService.hasSufficientBalance(userId, game.entryCost);
    if (!hasFunds) {
      throw new Error('Insufficient coins to join this game');
    }

    // Deduct entry cost from user's wallet
    const updatedWallet = await this.walletService.debitCoins(
      userId,
      game.entryCost,
      `Joined ${game.name}`
    );

    // Update game player count
    const updatedGame = await this.gameRepository.incrementPlayerCount(gameId);
    
    if (!updatedGame) {
      // This shouldn't happen, but handle gracefully
      throw new Error('Failed to update game state');
    }

    // Create game session for the user
    const gameSession: GameSession = {
      sessionId: uuidv4(),
      gameId: game.id,
      gameName: game.name
    };

    return {
      success: true,
      message: `Successfully joined ${game.name}`,
      newBalance: updatedWallet.totalCoins,
      transaction: updatedWallet.transactions[0], // Most recent transaction
      gameSession
    };
  }

  // Check if a user can join a specific game
  async canJoinGame(userId: string, gameId: string): Promise<{ canJoin: boolean; reason?: string }> {
    try {
      const game = await this.getGameById(gameId);
      
      // Check if game is full
      if (game.currentPlayers >= game.maxPlayers) {
        return { canJoin: false, reason: 'Game is full' };
      }

      // Check if user has sufficient balance
      const hasFunds = await this.walletService.hasSufficientBalance(userId, game.entryCost);
      if (!hasFunds) {
        return { canJoin: false, reason: 'Insufficient coins' };
      }

      return { canJoin: true };
    } catch (error) {
      return { canJoin: false, reason: 'Game not available' };
    }
  }
}
