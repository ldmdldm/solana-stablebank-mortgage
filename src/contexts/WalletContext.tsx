import React, { createContext, useContext, useState, useEffect } from 'react';
import { Connection, PublicKey, Transaction, VersionedTransaction } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolflareWalletAdapter } from '@solana/wallet-adapter-solflare';
import { WalletReadyState, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import * as api from '../services/api';

// Define the shape of the wallet context
interface WalletContextType {
  address: string | null;
  balance: number;
  connected: boolean;
  connecting: boolean;
  loading: boolean;
  error: string | null;
  walletAdapter: PhantomWalletAdapter | SolflareWalletAdapter | null;
  
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  depositFunds: (amount: number) => Promise<boolean>;
  withdrawFunds: (amount: number) => Promise<boolean>;
  getTransactionHistory: (page?: number, limit?: number) => Promise<api.TransactionResponse>;
  signMessage: (message: string) => Promise<string | null>;
  sendTransaction: (transaction: Transaction | VersionedTransaction) => Promise<string | null>;
}

// Create the context
const WalletContext = createContext<WalletContextType | undefined>(undefined);

// Endpoint for Solana network
const ENDPOINT = 'https://api.devnet.solana.com';

// WalletProvider component
export function WalletProvider({ children }: { children: React.ReactNode }) {
  // Initialize wallet state
  const [address, setAddress] = useState<string | null>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [walletAdapter, setWalletAdapter] = useState<PhantomWalletAdapter | SolflareWalletAdapter | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [connected, setConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [connection, setConnection] = useState<Connection | null>(null);

  // Initialize connection to Solana network
  useEffect(() => {
    const conn = new Connection(ENDPOINT, 'confirmed');
    setConnection(conn);
  }, []);

  // Register and initialize the wallet adapters
  useEffect(() => {
    const initWalletAdapters = async () => {
      const storedWalletType = localStorage.getItem('walletType');
      let adapter;

      if (storedWalletType === 'phantom') {
        adapter = new PhantomWalletAdapter();
      } else if (storedWalletType === 'solflare') {
        adapter = new SolflareWalletAdapter();
      } else {
        // Default to Phantom
        adapter = new PhantomWalletAdapter();
      }

      setWalletAdapter(adapter);
      
      // Setup event listeners
      adapter.on('connect', (publicKey: PublicKey) => {
        setPublicKey(publicKey);
        setAddress(publicKey.toString());
        setConnected(true);
        setConnecting(false);
      });
      
      adapter.on('disconnect', () => {
        setPublicKey(null);
        setAddress(null);
        setConnected(false);
      });
      
      adapter.on('error', (error) => {
        setError(error.message);
        setConnecting(false);
      });
      
      // Auto-connect if previously connected
      if (adapter.readyState === WalletReadyState.Installed && storedWalletType) {
        try {
          setConnecting(true);
          await adapter.connect();
        } catch (error) {
          console.error('Failed to auto-connect wallet', error);
          setConnecting(false);
        }
      }
    };
    
    initWalletAdapters();
    
    // Cleanup event listeners on unmount
    return () => {
      if (walletAdapter) {
        walletAdapter.removeAllListeners();
      }
    };
  }, []);
  
  // Fetch wallet details when connected
  useEffect(() => {
    const fetchWalletData = async () => {
      if (!address || !connection) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Register wallet in backend if not already registered
        try {
          await api.createWallet(address);
        } catch (err) {
          // If wallet already exists, this is fine
          console.log('Wallet might already exist in backend');
        }
        
        // Get wallet information from backend
        const walletInfo = await api.getWalletInfo(address);
        setBalance(walletInfo.balance);
        
        // Also fetch native SOL balance from Solana
        if (publicKey) {
          const solBalance = await connection.getBalance(publicKey);
          console.log(`SOL Balance: ${solBalance / 1e9} SOL`);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch wallet data');
        console.error('Error fetching wallet data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchWalletData();
  }, [address, connection, publicKey]);
  
  // Connect to wallet
  const connect = async (): Promise<void> => {
    if (!walletAdapter) {
      setError('Wallet adapter not initialized');
      return;
    }
    
    setConnecting(true);
    setError(null);
    
    try {
      if (walletAdapter.readyState !== WalletReadyState.Installed) {
        throw new Error(`Please install ${walletAdapter.name} wallet`);
      }
      
      await walletAdapter.connect();
      localStorage.setItem('walletType', walletAdapter.name.toLowerCase());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect wallet');
      console.error('Error connecting wallet:', err);
    } finally {
      setConnecting(false);
    }
  };
  
  // Disconnect from wallet
  const disconnect = async (): Promise<void> => {
    if (!walletAdapter) return;
    
    try {
      await walletAdapter.disconnect();
      localStorage.removeItem('walletType');
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
    }
  };
  
  // Deposit funds to wallet
  const depositFunds = async (amount: number): Promise<boolean> => {
    if (!address) {
      setError('Wallet not connected');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.depositFunds(address, amount);
      setBalance(result.wallet.balance);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deposit funds');
      console.error('Error depositing funds:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Withdraw funds from wallet
  const withdrawFunds = async (amount: number): Promise<boolean> => {
    if (!address) {
      setError('Wallet not connected');
      return false;
    }
    
    if (balance < amount) {
      setError('Insufficient funds');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await api.withdrawFunds(address, amount);
      setBalance(result.wallet.balance);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to withdraw funds');
      console.error('Error withdrawing funds:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };
  
  // Get transaction history
  const getTransactionHistory = async (
    page?: number, 
    limit?: number
  ): Promise<api.TransactionResponse> => {
    if (!address) {
      throw new Error('Wallet not connected');
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const transactions = await api.getTransactionHistory(address, page, limit);
      return transactions;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch transaction history');
      console.error('Error fetching transaction history:', err);
      throw err;
    } finally {
      setLoading(false);
    }
  };
  
  // Sign a message with the wallet
  const signMessage = async (message: string): Promise<string | null> => {
    if (!walletAdapter || !walletAdapter.connected) {
      setError('Wallet not connected');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create UTF-8 encoded message
      const encodedMessage = new TextEncoder().encode(message);
      
      // Sign the message
      const signatureBytes = await walletAdapter.signMessage(encodedMessage);
      
      // Convert signature to base58 string
      const signature = bs58.encode(signatureBytes);
      
      // Verify the wallet in the backend
      await api.verifyWallet(address!, signature, message);
      
      return signature;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign message');
      console.error('Error signing message:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Send a transaction
  const sendTransaction = async (
    transaction: Transaction | VersionedTransaction
  ): Promise<string | null> => {
    if (!walletAdapter || !walletAdapter.connected) {
      setError('Wallet not connected');
      return null;
    }
    
    if (!connection) {
      setError('Solana connection not established');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const signature = await walletAdapter.sendTransaction(transaction, connection);
      
      // Wait for confirmation
      await connection.confirmTransaction(signature, 'confirmed');
      
      return signature;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send transaction');
      console.error('Error sending transaction:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  // Create context value
  const value: WalletContextType = {
    address,
    balance,
    connected,
    connecting,
    loading,
    error,
    walletAdapter,
    connect,
    disconnect,
    depositFunds,
    withdrawFunds,
    getTransactionHistory,
    signMessage,
    sendTransaction
  };
  
  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
}

// Custom hook to use the wallet context
export function useWallet(): WalletContextType {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
}
