import React, { useState, useEffect } from 'react';
import { Wallet as WalletType, CoinPack, Transaction } from '../types';
import { apiService } from '../apiService';

interface WalletContainerProps {
  onWalletUpdate: (wallet: WalletType) => void;
}

interface WalletDisplayProps {
  wallet: WalletType;
  onRecharge: (packId: number) => void;
  coinPacks: CoinPack[];
  isRecharging: boolean;
}

interface TransactionListProps {
  transactions: Transaction[];
}

interface CoinPackGridProps {
  coinPacks: CoinPack[];
  onRecharge: (packId: number) => void;
  isRecharging: boolean;
}

// Pure display component for wallet balance
const WalletBalance: React.FC<{ totalCoins: number }> = ({ totalCoins }) => (
  <div className="coin-balance">
    <h2>My Wallet</h2>
    <div className="coins">{totalCoins} Coins</div>
  </div>
);

// Pure component for displaying transaction history
const TransactionList: React.FC<TransactionListProps> = ({ transactions }) => {
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="transaction-history">
      <h3>Recent Transactions</h3>
      {transactions.slice(0, 5).map((transaction: Transaction) => (
        <div key={transaction.id} className="transaction">
          <div>
            <div>{transaction.description}</div>
            <div className="date">{formatDate(transaction.timestamp)}</div>
          </div>
          <div className={`amount ${transaction.type}`}>
            {transaction.type === 'credit' ? '+' : '-'}{transaction.amount}
          </div>
        </div>
      ))}
    </div>
  );
};

// Pure component for coin pack selection
const CoinPackGrid: React.FC<CoinPackGridProps> = ({ coinPacks, onRecharge, isRecharging }) => (
  <div className="coin-packs">
    {coinPacks.map((pack) => (
      <div
        key={pack.id}
        className="coin-pack"
        onClick={() => onRecharge(pack.id)}
        style={{ opacity: isRecharging ? 0.6 : 1 }}
      >
        <div className="coins">{pack.coins} coins</div>
        <div className="price">${pack.price}</div>
        {pack.bonus > 0 && (
          <div className="bonus">+{pack.bonus} bonus</div>
        )}
      </div>
    ))}
  </div>
);

// Pure display component that combines all wallet UI elements
const WalletDisplay: React.FC<WalletDisplayProps> = ({ 
  wallet, 
  onRecharge, 
  coinPacks, 
  isRecharging 
}) => (
  <div className="card wallet-card">
    <WalletBalance totalCoins={wallet.totalCoins} />
    <CoinPackGrid 
      coinPacks={coinPacks} 
      onRecharge={onRecharge} 
      isRecharging={isRecharging} 
    />
    <TransactionList transactions={wallet.transactions} />
  </div>
);

// Container component that handles business logic and state
const WalletContainer: React.FC<WalletContainerProps> = ({ onWalletUpdate }) => {
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [coinPacks, setCoinPacks] = useState<CoinPack[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [recharging, setRecharging] = useState(false);

  useEffect(() => {
    initializeWalletData();
  }, []);

  const initializeWalletData = async () => {
    try {
      await Promise.all([
        loadWalletData(),
        loadCoinPacks()
      ]);
    } catch (err) {
      setError('Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const loadWalletData = async () => {
    const walletData = await apiService.getWallet();
    setWallet(walletData);
    onWalletUpdate(walletData);
  };

  const loadCoinPacks = async () => {
    const packs = await apiService.getCoinPacks();
    setCoinPacks(packs);
  };

  const handleRecharge = async (packId: number) => {
    if (recharging) return;
    
    setRecharging(true);
    setError('');
    
    try {
      const result = await apiService.rechargeWallet(packId);
      if (result.success) {
        await loadWalletData();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Recharge failed');
    } finally {
      setRecharging(false);
    }
  };

  if (loading) {
    return <div className="loading">Loading wallet...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  if (!wallet) {
    return <div className="error-message">Failed to load wallet</div>;
  }

  return (
    <>
      {error && <div className="error-message">{error}</div>}
      <WalletDisplay 
        wallet={wallet}
        onRecharge={handleRecharge}
        coinPacks={coinPacks}
        isRecharging={recharging}
      />
    </>
  );
};

export default WalletContainer;
