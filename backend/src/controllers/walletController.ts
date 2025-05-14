import { Request, Response, NextFunction } from 'express';
import { PublicKey } from '@solana/web3.js';
import { bs58 } from 'bs58';
import { nacl } from 'tweetnacl';
import Wallet, { WalletDocument } from '../models/Wallet';
import { logger } from '../utils/logger';
import { connectToSolana } from '../services/solanaService';

// Get wallet information
export const getWalletInfo = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    
    const wallet = await Wallet.findOne({ address });
    
    if (!wallet) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wallet not found' 
      });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        address: wallet.address,
        balance: wallet.balance,
        isVerified: wallet.isVerified,
        createdAt: wallet.createdAt,
        updatedAt: wallet.updatedAt,
        totalDeposits: wallet.get('totalDeposits'),
        totalWithdrawals: wallet.get('totalWithdrawals'),
        transactionCount: wallet.transactions.length
      }
    });
  } catch (error) {
    logger.error(`Error getting wallet info: ${error}`);
    next(error);
  }
};

// Create a new wallet
export const createWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.body;
    
    // Check if wallet already exists
    const existingWallet = await Wallet.findOne({ address });
    
    if (existingWallet) {
      return res.status(400).json({ 
        success: false, 
        error: 'Wallet already exists' 
      });
    }
    
    // Validate Solana address format
    try {
      new PublicKey(address);
    } catch (err) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid Solana wallet address format' 
      });
    }
    
    // Create new wallet
    const wallet = await Wallet.create({
      address,
      balance: 0,
      isVerified: false,
      transactions: []
    });
    
    return res.status(201).json({
      success: true,
      data: wallet
    });
  } catch (error) {
    logger.error(`Error creating wallet: ${error}`);
    next(error);
  }
};

// Deposit funds into a wallet
export const depositFunds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const { amount } = req.body;
    
    // Find the wallet
    const wallet = await Wallet.findOne({ address });
    
    if (!wallet) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wallet not found' 
      });
    }
    
    // Create a transaction record
    const transaction = {
      date: new Date(),
      amount,
      type: 'deposit' as const,
      description: 'Deposit funds',
      status: 'completed' as const
    };
    
    // Update wallet balance and add transaction
    wallet.balance += amount;
    wallet.transactions.push(transaction);
    
    await wallet.save();
    
    return res.status(200).json({
      success: true,
      data: {
        wallet: {
          address: wallet.address,
          balance: wallet.balance,
          isVerified: wallet.isVerified
        },
        transaction
      }
    });
  } catch (error) {
    logger.error(`Error depositing funds: ${error}`);
    next(error);
  }
};

// Withdraw funds from a wallet
export const withdrawFunds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const { amount } = req.body;
    
    // Find the wallet
    const wallet = await Wallet.findOne({ address });
    
    if (!wallet) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wallet not found' 
      });
    }
    
    // Check if wallet has sufficient funds
    if (!wallet.hasSufficientFunds(amount)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Insufficient funds' 
      });
    }
    
    // Create a transaction record
    const transaction = {
      date: new Date(),
      amount,
      type: 'withdrawal' as const,
      description: 'Withdraw funds',
      status: 'completed' as const
    };
    
    // Update wallet balance and add transaction
    wallet.balance -= amount;
    wallet.transactions.push(transaction);
    
    await wallet.save();
    
    return res.status(200).json({
      success: true,
      data: {
        wallet: {
          address: wallet.address,
          balance: wallet.balance,
          isVerified: wallet.isVerified
        },
        transaction
      }
    });
  } catch (error) {
    logger.error(`Error withdrawing funds: ${error}`);
    next(error);
  }
};

// Get transaction history for a wallet
export const getTransactionHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const { page = 1, limit = 20, type } = req.query;
    
    // Find the wallet
    const wallet = await Wallet.findOne({ address });
    
    if (!wallet) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wallet not found' 
      });
    }
    
    // Filter transactions by type if specified
    let transactions = wallet.transactions;
    if (type) {
      transactions = transactions.filter(tx => tx.type === type);
    }
    
    // Sort transactions by date (newest first)
    transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
    
    // Apply pagination
    const startIndex = (Number(page) - 1) * Number(limit);
    const endIndex = Number(page) * Number(limit);
    const paginatedTransactions = transactions.slice(startIndex, endIndex);
    
    return res.status(200).json({
      success: true,
      count: transactions.length,
      data: {
        transactions: paginatedTransactions,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          totalPages: Math.ceil(transactions.length / Number(limit))
        }
      }
    });
  } catch (error) {
    logger.error(`Error getting transaction history: ${error}`);
    next(error);
  }
};

// Verify wallet ownership through signature
export const verifyWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { address } = req.params;
    const { signature, message } = req.body;
    
    // Find the wallet
    const wallet = await Wallet.findOne({ address });
    
    if (!wallet) {
      return res.status(404).json({ 
        success: false, 
        error: 'Wallet not found' 
      });
    }
    
    // Verify signature
    let isValid = false;
    try {
      // Convert signature from base58 to Uint8Array
      const signatureBytes = bs58.decode(signature);
      
      // Convert message to bytes
      const messageBytes = new TextEncoder().encode(message);
      
      // Convert wallet address to PublicKey
      const publicKey = new PublicKey(address);
      
      // Verify signature using Solana web3.js
      isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        publicKey.toBytes()
      );
    } catch (error) {
      logger.error(`Error verifying signature: ${error}`);
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid signature format' 
      });
    }
    
    if (!isValid) {
      return res.status(400).json({ 
        success: false, 
        error: 'Signature verification failed' 
      });
    }
    
    // Update wallet verification status
    wallet.isVerified = true;
    await wallet.save();
    
    return res.status(200).json({
      success: true,
      data: {
        address: wallet.address,
        isVerified: wallet.isVerified
      }
    });
  } catch (error) {
    logger.error(`Error verifying wallet: ${error}`);
    next(error);
  }
};

