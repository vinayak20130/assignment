import React, { useState } from 'react';
import './App.css';
import WalletContainer from './components/Wallet';
import GameLobbyContainer from './components/GameLobby';
import GameScreenContainer from './components/GameScreen';

import { Wallet as WalletType } from './types';

interface GameSession {
  sessionId: string;
  gameId: string;
  gameName: string;
}

function App() {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [currentGameSession, setCurrentGameSession] = useState<GameSession | null>(null);

  const handleWalletUpdate = (updatedWallet: WalletType) => {
    setWallet(updatedWallet);
  };

  const handleGameJoin = (gameSession: GameSession) => {
    setCurrentGameSession(gameSession);
  };

  const handleBackToLobby = () => {
    setCurrentGameSession(null);
  };

  return (
    <div className="app">
      <header className="header">
        <h1>Mini Social App</h1>
        <p>Play games, earn coins, have fun</p>
      </header>

      <main className="main-content">
        {currentGameSession ? (
          <GameScreenContainer 
            gameSession={currentGameSession}
            onBackToLobby={handleBackToLobby}
          />
        ) : (
          <>
            <WalletContainer onWalletUpdate={handleWalletUpdate} />
            <GameLobbyContainer 
              wallet={wallet}
              onWalletUpdate={handleWalletUpdate}
              onGameJoin={handleGameJoin}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
