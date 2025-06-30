import React from 'react';

interface GameSession {
  sessionId: string;
  gameId: string;
  gameName: string;
}

interface GameScreenContainerProps {
  gameSession: GameSession;
  onBackToLobby: () => void;
}

interface GameContentProps {
  gameId: string;
  sessionId: string;
}

interface ChallengeConnectGameProps {
  sessionId: string;
}

interface SnakeLadderGameProps {
  sessionId: string;
}

// Pure component for Challenge & Connect game content
const ChallengeConnectGame: React.FC<ChallengeConnectGameProps> = ({ sessionId }) => (
  <div className="game-placeholder">
    <h3>Challenge & Connect</h3>
    <p>Welcome to the challenge arena</p>
    <p>Session ID: {sessionId.slice(0, 8)}...</p>
    <div style={{ margin: '20px 0' }}>
      <p>Find your match and start competing</p>
      <p>Complete challenges to earn rewards</p>
      <p>Connect with other players</p>
    </div>
  </div>
);

// Pure component for Snake & Ladder game content
const SnakeLadderGame: React.FC<SnakeLadderGameProps> = ({ sessionId }) => {
  const createGameBoard = () => {
    return Array.from({ length: 25 }, (_, i) => (
      <div key={i} style={{
        width: '30px',
        height: '30px',
        border: '1px solid #ccc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        background: i === 0 ? '#ff6b35' : i === 24 ? '#22c55e' : '#f9f9f9'
      }}>
        {i === 0 ? 'START' : i === 24 ? 'FINISH' : i + 1}
      </div>
    ));
  };

  return (
    <div className="game-placeholder">
      <h3>Snake & Ladder</h3>
      <p>Classic board game awaits</p>
      <p>Session ID: {sessionId.slice(0, 8)}...</p>
      <div style={{ margin: '20px 0' }}>
        <p>Roll the dice to move forward</p>
        <p>Climb ladders to advance quickly</p>
        <p>Watch out for snakes</p>
      </div>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(5, 1fr)', 
        gap: '5px',
        maxWidth: '200px',
        margin: '20px auto'
      }}>
        {createGameBoard()}
      </div>
    </div>
  );
};

// Pure component that renders appropriate game content based on game ID
const GameContent: React.FC<GameContentProps> = ({ gameId, sessionId }) => {
  const gameComponents = {
    'challenge-connect': () => <ChallengeConnectGame sessionId={sessionId} />,
    'snake-ladder': () => <SnakeLadderGame sessionId={sessionId} />,
  };

  const GameComponent = gameComponents[gameId as keyof typeof gameComponents];
  
  if (GameComponent) {
    return <GameComponent />;
  }

  return (
    <div className="game-placeholder">
      <h3>Game Starting...</h3>
      <p>Loading game content</p>
      <p>Session: {sessionId}</p>
    </div>
  );
};

// Pure component for back navigation
const BackButton: React.FC<{ onBackToLobby: () => void }> = ({ onBackToLobby }) => (
  <button className="back-button" onClick={onBackToLobby}>
    ← Back to Lobby
  </button>
);

// Pure component for game disclaimer
const GameDisclaimer: React.FC = () => (
  <p style={{ color: '#666', fontSize: '14px', margin: '20px 0' }}>
    This is a demo game screen. In a real application, this would be the actual game interface
    with full gameplay functionality.
  </p>
);

// Container component that manages the game screen layout and navigation
const GameScreenContainer: React.FC<GameScreenContainerProps> = ({ gameSession, onBackToLobby }) => {
  return (
    <div className="card">
      <div className="game-screen">
        <h2>Now Playing: {gameSession.gameName}</h2>
        
        <GameContent 
          gameId={gameSession.gameId}
          sessionId={gameSession.sessionId}
        />
        
        <GameDisclaimer />
        
        <BackButton onBackToLobby={onBackToLobby} />
      </div>
    </div>
  );
};

export default GameScreenContainer;
