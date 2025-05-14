import React, { useState } from 'react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useWallet } from '../contexts/WalletContext';
import { Link } from 'react-router-dom';
import { 
  Wallet as WalletIcon, Plus, ExternalLink, CreditCard, History, 
  ArrowDownRight, ArrowUpRight, Check, AlertCircle, ChevronDown, ChevronUp
} from 'lucide-react';

const WalletPage: React.FC = () => {
  const { connected, balance, address, connectWallet, addFunds, withdrawFunds } = useWallet();
  
  const [amount, setAmount] = useState<number>(1000);
  const [showTransactionHistory, setShowTransactionHistory] = useState(false);
  const [isAdding, setIsAdding] = useState(true);
  const [transactionStatus, setTransactionStatus] = useState<'success' | 'error' | null>(null);
  const [statusMessage, setStatusMessage] = useState('');

  // Mock transaction history
  const [transactions, setTransactions] = useState([
    {
      id: 'tx1',
      type: 'deposit',
      amount: 5000,
      date: new Date(2025, 2, 10),
      status: 'completed',
      source: 'Bank Transfer'
    },
    {
      id: 'tx2',
      type: 'withdrawal',
      amount: 1000,
      date: new Date(2025, 2, 8),
      status: 'completed',
      destination: 'External Wallet'
    },
    {
      id: 'tx3',
      type: 'deposit',
      amount: 2000,
      date: new Date(2025, 2, 5),
      status: 'completed',
      source: 'Credit Card'
    }
  ]);

  const handleConnectWallet = () => {
    connectWallet();
  };

  const handleAddFunds = () => {
    if (amount <= 0) {
      setTransactionStatus('error');
      setStatusMessage('Please enter a valid amount');
      return;
    }
    
    addFunds(amount);
    setTransactionStatus('success');
    setStatusMessage(`Successfully added ${amount.toLocaleString()} USDC to your wallet`);
    
    // Add to transaction history
    setTransactions(prev => [
      {
        id: 'tx' + Math.random().toString(36).substring(2, 10),
        type: 'deposit',
        amount: amount,
        date: new Date(),
        status: 'completed',
        source: 'Bank Transfer'
      },
      ...prev
    ]);
    
    setTimeout(() => {
      setTransactionStatus(null);
      setStatusMessage('');
    }, 5000);
  };

  const handleWithdrawFunds = () => {
    if (amount <= 0) {
      setTransactionStatus('error');
      setStatusMessage('Please enter a valid amount');
      return;
    }
    
    if (amount > balance) {
      setTransactionStatus('error');
      setStatusMessage('Insufficient funds in your wallet');
      return;
    }
    
    withdrawFunds(amount);
    setTransactionStatus('success');
    setStatusMessage(`Successfully withdrew ${amount.toLocaleString()} USDC from your wallet`);
    
    // Add to transaction history
    setTransactions(prev => [
      {
        id: 'tx' + Math.random().toString(36).substring(2, 10),
        type: 'withdrawal',
        amount: amount,
        date: new Date(),
        status: 'completed',
        destination: 'External Wallet'
      },
      ...prev
    ]);
    
    setTimeout(() => {
      setTransactionStatus(null);
      setStatusMessage('');
    }, 5000);
  };

  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="h1 mb-2">Stablecoin Wallet</h1>
      <p className="text-slate-400 mb-8">Manage your USDC for mortgage payments</p>

      {!connected ? (
        <Card className="p-8 text-center animated-border">
          <WalletIcon className="w-16 h-16 text-blue-500 mx-auto mb-6" />
          <h2 className="h2 mb-4">Connect Your Wallet</h2>
          <p className="text-slate-300 mb-8 max-w-md mx-auto">
            Connect your wallet to manage your stablecoin mortgages and make payments.
          </p>
          <Button variant="primary" size="lg" onClick={handleConnectWallet}>
            Connect Wallet
          </Button>
        </Card>
      ) : (
        <>
          {/* Wallet Overview */}
          <Card className="p-6 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mr-4">
                  <WalletIcon className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="h3 mb-1">Your Wallet</h2>
                  <p className="text-sm text-slate-400">{address}</p>
                </div>
              </div>
              
              <div className="flex flex-col items-start md:items-end">
                <p className="text-sm text-slate-400 mb-1">Available Balance</p>
                <p className="text-3xl font-bold">{balance.toLocaleString()} USDC</p>
              </div>
            </div>
          </Card>
          
          {/* Transaction Status Notification */}
          {transactionStatus && (
            <div className={`mb-6 p-4 rounded-lg flex items-start
              ${transactionStatus === 'success' ? 'bg-green-500/10 border border-green-500/30' : 
                'bg-red-500/10 border border-red-500/30'}`
            }>
              {transactionStatus === 'success' ? (
                <Check className="w-5 h-5 text-green-400 mr-3" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
              )}
              <p className={transactionStatus === 'success' ? 'text-green-400' : 'text-red-400'}>
                {statusMessage}
              </p>
            </div>
          )}
          
          {/* Add/Withdraw Funds */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                  <Plus className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="h3">Manage Funds</h2>
              </div>
              
              <div className="mb-6">
                <div className="flex p-1 bg-slate-800 rounded-lg mb-4">
                  <button
                    className={`flex-1 py-2 rounded-md text-center transition-colors
                      ${isAdding ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
                    onClick={() => setIsAdding(true)}
                  >
                    Add Funds
                  </button>
                  <button
                    className={`flex-1 py-2 rounded-md text-center transition-colors
                      ${!isAdding ? 'bg-blue-600 text-white' : 'text-slate-300'}`}
                    onClick={() => setIsAdding(false)}
                  >
                    Withdraw
                  </button>
                </div>
                
                <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-2">
                  {isAdding ? 'Amount to Add (USDC)' : 'Amount to Withdraw (USDC)'}
                </label>
                <div className="relative mb-4">
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    min="0"
                    step="100"
                    className="input-field"
                  />
                </div>
                
                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => setAmount(500)}
                    className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-sm transition-colors"
                  >
                    500
                  </button>
                  <button
                    onClick={() => setAmount(1000)}
                    className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-sm transition-colors"
                  >
                    1,000
                  </button>
                  <button
                    onClick={() => setAmount(5000)}
                    className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-sm transition-colors"
                  >
                    5,000
                  </button>
                  <button
                    onClick={() => setAmount(10000)}
                    className="px-3 py-1 rounded-md bg-slate-800 hover:bg-slate-700 text-sm transition-colors"
                  >
                    10,000
                  </button>
                </div>
                
                <Button 
                  variant={isAdding ? 'primary' : 'secondary'} 
                  fullWidth 
                  onClick={isAdding ? handleAddFunds : handleWithdrawFunds}
                  disabled={!isAdding && amount > balance}
                >
                  {isAdding ? 'Add Funds' : 'Withdraw Funds'}
                </Button>
                
                {!isAdding && amount > balance && (
                  <p className="text-sm text-red-400 mt-2">
                    Amount exceeds available balance
                  </p>
                )}
              </div>
            </Card>
            
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                  <CreditCard className="w-5 h-5 text-blue-500" />
                </div>
                <h2 className="h3">Quick Actions</h2>
              </div>
              
              <div className="space-y-4">
                <Link to="/dashboard">
                  <Button variant="outline" fullWidth className="justify-start">
                    View Mortgage Dashboard
                  </Button>
                </Link>
                
                <Link to="/apply">
                  <Button variant="outline" fullWidth className="justify-start">
                    Apply for New Mortgage
                  </Button>
                </Link>
                
                <a href="#" className="block">
                  <Button variant="outline" fullWidth className="justify-start">
                    Connect to Hardware Wallet
                  </Button>
                </a>
                
                <a href="#" className="block">
                  <Button variant="outline" fullWidth className="justify-start text-yellow-500 hover:text-yellow-400">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    View on Solana Explorer
                  </Button>
                </a>
              </div>
            </Card>
          </div>
          
          {/* Transaction History */}
          <Card className="p-6">
            <div 
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setShowTransactionHistory(!showTransactionHistory)}
            >
              <div className="flex items-center">
                <History className="w-5 h-5 mr-3 text-blue-400" />
                <h2 className="h3">Transaction History</h2>
              </div>
              <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                {showTransactionHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>
            </div>
            
            {showTransactionHistory && (
              <div className="mt-4">
                {transactions.length > 0 ? (
                  <div className="space-y-3">
                    {transactions.map(transaction => (
                      <div key={transaction.id} className="p-4 bg-slate-800/50 rounded-lg flex justify-between items-center">
                        <div className="flex items-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3
                            ${transaction.type === 'deposit' 
                              ? 'bg-green-500/20 text-green-400' 
                              : 'bg-blue-500/20 text-blue-400'}`
                          }>
                            {transaction.type === 'deposit' 
                              ? <ArrowDownRight className="w-5 h-5" />
                              : <ArrowUpRight className="w-5 h-5" />
                            }
                          </div>
                          <div>
                            <p className="font-medium">
                              {transaction.type === 'deposit' ? 'Deposit' : 'Withdrawal'}
                            </p>
                            <p className="text-sm text-slate-400">
                              {transaction.date.toLocaleDateString()} • 
                              {transaction.type === 'deposit' 
                                ? ` From ${transaction.source}`
                                : ` To ${transaction.destination}`
                              }
                            </p>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.type === 'deposit' ? 'text-green-400' : 'text-blue-400'
                          }`}>
                            {transaction.type === 'deposit' ? '+' : '-'}{transaction.amount.toLocaleString()} USDC
                          </p>
                          <p className="text-xs text-slate-400">
                            Status: {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-slate-400 py-4">No transaction history available</p>
                )}
              </div>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default WalletPage;