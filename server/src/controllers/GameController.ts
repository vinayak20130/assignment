import { Request, Response } from 'express';
import { GameService } from '../services/GameService.js';

// Controller for game-related HTTP endpoints
// Handles game operations like getting available games and joining them
export class GameController {
  constructor(private gameService: GameService) {}

  // Get all available games
  getGames = async (req: Request, res: Response): Promise<void> => {
    try {
      const games = await this.gameService.getAllGames();
      res.json(games);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to get games'
      });
    }
  };

  // Handle a user joining a game
  joinGame = async (req: Request, res: Response): Promise<void> => {
    try {
      const { gameId } = req.body;
      
      // Validate request body
      if (!gameId || typeof gameId !== 'string') {
        res.status(400).json({
          success: false,
          error: 'Game ID is required and must be a string'
        });
        return;
      }

      // In a real app, we'd get user ID from authentication token
      const userId = 'user-123';
      
      const result = await this.gameService.joinGame(userId, gameId);
      res.json(result);
    } catch (error) {
      // Handle specific error cases with appropriate status codes
      const errorMessage = error instanceof Error ? error.message : 'Failed to join game';
      
      if (errorMessage.includes('not found')) {
        res.status(404).json({
          success: false,
          error: errorMessage
        });
      } else if (errorMessage.includes('Insufficient') || errorMessage.includes('full')) {
        res.status(400).json({
          success: false,
          error: errorMessage
        });
      } else {
        res.status(500).json({
          success: false,
          error: errorMessage
        });
      }
    }
  };

  // Check if user can join a specific game (useful for UI state)
  checkGameAvailability = async (req: Request, res: Response): Promise<void> => {
    try {
      const { gameId } = req.params;
      
      if (!gameId) {
        res.status(400).json({
          success: false,
          error: 'Game ID is required'
        });
        return;
      }

      // In a real app, we'd get user ID from authentication token
      const userId = 'user-123';
      
      const availability = await this.gameService.canJoinGame(userId, gameId);
      res.json(availability);
    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to check game availability'
      });
    }
  };
}
