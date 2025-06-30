import { Router } from 'express';
import { GameController } from '../controllers/GameController.js';
import { asyncHandler } from '../middleware/errorHandling.js';

// Define game-related routes
// These handle game discovery and joining operations
export function createGameRoutes(gameController: GameController): Router {
  const router = Router();

  // GET /api/games - Get all available games
  router.get('/', asyncHandler(gameController.getGames));

  // POST /api/games/join - Join a specific game
  router.post('/join', asyncHandler(gameController.joinGame));

  // GET /api/games/:gameId/availability - Check if user can join a game
  // This is useful for updating UI state without actually joining
  router.get('/:gameId/availability', asyncHandler(gameController.checkGameAvailability));

  return router;
}
