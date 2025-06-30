import { Game } from '../types/index.js';

// Repository for game data operations
// Manages the available games and their current state
export class GameRepository {
  private games: Game[] = [
    {
      id: 'challenge-connect',
      name: 'Challenge & Connect',
      entryCost: 10,
      currentPlayers: 24,
      maxPlayers: 100,
      description: 'Test your skills and connect with friends',
      icon: 'target'
    },
    {
      id: 'snake-ladder',
      name: 'Snake & Ladder',
      entryCost: 15,
      currentPlayers: 18,
      maxPlayers: 50,
      description: 'Classic board game with a digital twist',
      icon: 'gamepad'
    }
  ];

  // Get all available games
  async findAll(): Promise<Game[]> {
    // Return a copy to prevent external modification
    return [...this.games];
  }

  // Find a specific game by its ID
  async findById(gameId: string): Promise<Game | null> {
    const game = this.games.find(g => g.id === gameId);
    return game ? { ...game } : null;
  }

  // Update game data (typically player count changes)
  async update(gameId: string, updates: Partial<Game>): Promise<Game | null> {
    const gameIndex = this.games.findIndex(g => g.id === gameId);
    
    if (gameIndex === -1) {
      return null;
    }

    // Apply updates to the game
    this.games[gameIndex] = {
      ...this.games[gameIndex],
      ...updates
    };

    return { ...this.games[gameIndex] };
  }

  // Increment player count when someone joins a game
  async incrementPlayerCount(gameId: string): Promise<Game | null> {
    const game = await this.findById(gameId);
    
    if (!game) {
      return null;
    }

    return this.update(gameId, {
      currentPlayers: game.currentPlayers + 1
    });
  }
}
