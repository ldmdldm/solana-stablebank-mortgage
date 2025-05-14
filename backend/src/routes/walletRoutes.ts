import express from 'express';
import { body, param } from 'express-validator';
import {
  getWalletInfo,
  createWallet,
  depositFunds,
  withdrawFunds,
  getTransactionHistory,
  verifyWallet
} from '../controllers/walletController';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// GET /api/wallet/:address
// Get wallet information
router.get(
  '/:address',
  [
    param('address')
      .isString()
      .notEmpty()
      .withMessage('Wallet address is required')
  ],
  validateRequest,
  getWalletInfo
);

// POST /api/wallet
// Create or register a wallet
router.post(
  '/',
  [
    body('address')
      .isString()
      .notEmpty()
      .withMessage('Wallet address is required')
  ],
  validateRequest,
  createWallet
);

// POST /api/wallet/:address/deposit
// Deposit funds to a wallet
router.post(
  '/:address/deposit',
  [
    param('address')
      .isString()
      .notEmpty()
      .withMessage('Wallet address is required'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Deposit amount must be greater than 0')
  ],
  validateRequest,
  depositFunds
);

// POST /api/wallet/:address/withdraw
// Withdraw funds from a wallet
router.post(
  '/:address/withdraw',
  [
    param('address')
      .isString()
      .notEmpty()
      .withMessage('Wallet address is required'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Withdrawal amount must be greater than 0')
  ],
  validateRequest,
  withdrawFunds
);

// GET /api/wallet/:address/transactions
// Get transaction history for a wallet
router.get(
  '/:address/transactions',
  [
    param('address')
      .isString()
      .notEmpty()
      .withMessage('Wallet address is required')
  ],
  validateRequest,
  getTransactionHistory
);

// POST /api/wallet/:address/verify
// Verify wallet ownership through signature
router.post(
  '/:address/verify',
  [
    param('address')
      .isString()
      .notEmpty()
      .withMessage('Wallet address is required'),
    body('signature')
      .isString()
      .notEmpty()
      .withMessage('Signature is required'),
    body('message')
      .isString()
      .notEmpty()
      .withMessage('Message is required')
  ],
  validateRequest,
  verifyWallet
);

export default router;

