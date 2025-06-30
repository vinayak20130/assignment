import React, { useState, useEffect } from 'react';
import { Game, Wallet as WalletType } from '../types';
import { apiService } from '../apiService';

interface GameLobbyContainerProps {
  wallet: WalletType | null;
  onWalletUpdate: (wallet: WalletType) => void;
  onGameJoin: (gameSession: any) => void;
}

interface GameListProps {
  games: Game[];
  wallet: WalletType | null;
  onJoinGame: (game: Game) => void;
  joiningGameId: string;
}

interface GameCardProps {
  game: Game;
  wallet: WalletType | null;
  onJoinGame: (game: Game) => void;
  isJoining: boolean;
}

interface GameStatsProps {
  entryCost: number;
  currentPlayers: number;
  maxPlayers: number;
}

interface JoinButtonProps {
  game: Game;
  wallet: WalletType | null;
  onJoinGame: (game: Game) => void;
  isJoining: boolean;
}

// Pure component for displaying game statistics
const GameStats: React.FC<GameStatsProps> = ({ entryCost, currentPlayers, maxPlayers }) => (
  <div className="game-stats">
    <div className="entry-cost">
      {entryCost} coins
    </div>
    <div className="players-count">
      {currentPlayers}/{maxPlayers} players
    </div>
  </div>
);

// Pure component for join button with business logic for enabling/disabling
const JoinButton: React.FC<JoinButtonProps> = ({ game, wallet, onJoinGame, isJoining }) => {
  const getButtonState = () => {
    if (isJoining) return { text: 'Joining...', disabled: true };
    if (!wallet) return { text: 'Loading...', disabled: true };
    if (wallet.totalCoins < game.entryCost) return { text: 'Insufficient Coins', disabled: true };
    if (game.currentPlayers >= game.maxPlayers) return { text: 'Game Full', disabled: true };
    return { text: 'Join Game', disabled: false };
  };

  const buttonState = getButtonState();

  return (
    <button
      className="join-button"
      onClick={() => onJoinGame(game)}
      disabled={buttonState.disabled}
    >
      {buttonState.text}
    </button>
  );
};

// Pure component for individual game card
const GameCard: React.FC<GameCardProps> = ({ game, wallet, onJoinGame, isJoining }) => (
  <div className="game-card">
    <div className="game-header">
      <div className="game-icon">{game.icon === 'target' ? '🎯' : '🎮'}</div>
      <div className="game-info">
        <h3>{game.name}</h3>
        <p>{game.description}</p>
      </div>
    </div>

    <GameStats 
      entryCost={game.entryCost}
      currentPlayers={game.currentPlayers}
      maxPlayers={game.maxPlayers}
    />

    <JoinButton 
      game={game}
      wallet={wallet}
      onJoinGame={onJoinGame}
      isJoining={isJoining}
    />
  </div>
);

// Pure component for displaying list of games
const GameList: React.FC<GameListProps> = ({ games, wallet, onJoinGame, joiningGameId }) => {
  if (games.length === 0) {
    return <div className="error-message">No games available at the moment</div>;
  }

  return (
    <>
      {games.map((game) => (
        <GameCard
          key={game.id}
          game={game}
          wallet={wallet}
          onJoinGame={onJoinGame}
          isJoining={joiningGameId === game.id}
        />
      ))}
    </>
  );
};

// Container component that handles business logic and state management
const GameLobbyContainer: React.FC<GameLobbyContainerProps> = ({ 
  wallet, 
  onWalletUpdate, 
  onGameJoin 
}) => {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [joiningGame, setJoiningGame] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = async () => {
    try {
      const gamesData = await apiService.getGames();
      setGames(gamesData);
    } catch (err) {
      setError('Failed to load games');
    } finally {
      setLoading(false);
    }
  };

  const validateGameJoin = (game: Game): string | null => {
    if (!wallet) return 'Wallet not loaded';
    if (wallet.totalCoins < game.entryCost) {
      return `You need ${game.entryCost} coins to join ${game.name}. You only have ${wallet.totalCoins} coins.`;
    }
    return null;
  };

  const handleJoinGame = async (game: Game) => {
    if (joiningGame) return;

    const validationError = validateGameJoin(game);
    if (validationError) {
      setError(validationError);
      return;
    }

    setJoiningGame(game.id);
    setError('');
    setSuccessMessage('');

    try {
      const result = await apiService.joinGame(game.id);
      if (result.success) {
        setSuccessMessage(result.message);
        
        // Update wallet and games data
        const [updatedWallet] = await Promise.all([
          apiService.getWallet(),
          loadGames()
        ]);
        
        onWalletUpdate(updatedWallet);
        
        // Navigate to game session after a brief delay
        setTimeout(() => {
          onGameJoin(result.gameSession);
        }, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join game');
    } finally {
      setJoiningGame('');
    }
  };

  if (loading) {
    return <div className="loading">Loading games...</div>;
  }

  return (
    <div className="card">
      <div className="games-lobby">
        <h2>Game Lobby</h2>
        
        {error && <div className="error-message">{error}</div>}
        {successMessage && <div className="success-message">{successMessage}</div>}

        <GameList 
          games={games}
          wallet={wallet}
          onJoinGame={handleJoinGame}
          joiningGameId={joiningGame}
        />
      </div>
    </div>
  );
};

export default GameLobbyContainer;
