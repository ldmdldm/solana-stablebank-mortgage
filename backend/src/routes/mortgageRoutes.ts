import express from 'express';
import { body, param } from 'express-validator';
import {
  getMortgages,
  getMortgage,
  createMortgage,
  makeMortgagePayment,
  updateMortgageStatus,
  getMortgagePaymentHistory,
  getAmortizationSchedule
} from '../controllers/mortgageController';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// GET /api/mortgages/user/:walletAddress
// Get all mortgages for a specific user
router.get(
  '/user/:walletAddress',
  [
    param('walletAddress')
      .isString()
      .notEmpty()
      .withMessage('Wallet address is required')
  ],
  validateRequest,
  getMortgages
);

// GET /api/mortgages/:id
// Get a single mortgage by ID
router.get(
  '/:id',
  [
    param('id')
      .isString()
      .notEmpty()
      .withMessage('Mortgage ID is required')
  ],
  validateRequest,
  getMortgage
);

// POST /api/mortgages
// Create a new mortgage
router.post(
  '/',
  [
    body('borrowerWallet')
      .isString()
      .notEmpty()
      .withMessage('Borrower wallet address is required'),
    body('propertyValue')
      .isFloat({ min: 1000 })
      .withMessage('Property value must be at least 1000'),
    body('loanAmount')
      .isFloat({ min: 1000 })
      .withMessage('Loan amount must be at least 1000'),
    body('interestRate')
      .isFloat({ min: 0.1, max: 20 })
      .withMessage('Interest rate must be between 0.1 and 20'),
    body('termYears')
      .isInt({ min: 1, max: 30 })
      .withMessage('Term must be between 1 and 30 years'),
    body('propertyAddress')
      .isString()
      .notEmpty()
      .withMessage('Property address is required')
  ],
  validateRequest,
  createMortgage
);

// POST /api/mortgages/:id/payment
// Make a payment on a mortgage
router.post(
  '/:id/payment',
  [
    param('id')
      .isString()
      .notEmpty()
      .withMessage('Mortgage ID is required'),
    body('amount')
      .isFloat({ min: 0.01 })
      .withMessage('Payment amount must be greater than 0'),
    body('walletAddress')
      .isString()
      .notEmpty()
      .withMessage('Wallet address is required')
  ],
  validateRequest,
  makeMortgagePayment
);

// GET /api/mortgages/:id/payments
// Get payment history for a mortgage
router.get(
  '/:id/payments',
  [
    param('id')
      .isString()
      .notEmpty()
      .withMessage('Mortgage ID is required')
  ],
  validateRequest,
  getMortgagePaymentHistory
);

// GET /api/mortgages/:id/schedule
// Get amortization schedule for a mortgage
router.get(
  '/:id/schedule',
  [
    param('id')
      .isString()
      .notEmpty()
      .withMessage('Mortgage ID is required')
  ],
  validateRequest,
  getAmortizationSchedule
);

// PATCH /api/mortgages/:id/status
// Update mortgage status (admin or automated process)
router.patch(
  '/:id/status',
  [
    param('id')
      .isString()
      .notEmpty()
      .withMessage('Mortgage ID is required'),
    body('status')
      .isIn(['pending', 'approved', 'active', 'defaulted', 'completed'])
      .withMessage('Invalid mortgage status')
  ],
  validateRequest,
  updateMortgageStatus
);

export default router;

