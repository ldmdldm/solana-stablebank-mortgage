import { Request, Response, NextFunction } from 'express';
import Mortgage, { MortgageDocument } from '../models/Mortgage';
import { connectToSolana, initializeProgram } from '../services/solanaService';
import { logger } from '../utils/logger';
import { calculateMonthlyPayment } from '../utils/mortgageUtils';

// Get all mortgages for a user
export const getMortgages = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress) {
      return res.status(400).json({ success: false, error: 'Wallet address is required' });
    }
    
    const mortgages = await Mortgage.find({ borrowerWallet: walletAddress });
    
    return res.status(200).json({
      success: true,
      count: mortgages.length,
      data: mortgages
    });
  } catch (error) {
    logger.error(`Error getting mortgages: ${error}`);
    next(error);
  }
};

// Get a single mortgage by ID
export const getMortgage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const mortgage = await Mortgage.findById(id);
    
    if (!mortgage) {
      return res.status(404).json({ success: false, error: 'Mortgage not found' });
    }
    
    return res.status(200).json({
      success: true,
      data: mortgage
    });
  } catch (error) {
    logger.error(`Error getting mortgage: ${error}`);
    next(error);
  }
};

// Create a new mortgage
export const createMortgage = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      borrowerWallet,
      propertyValue,
      loanAmount,
      interestRate,
      termYears,
      propertyAddress
    } = req.body;
    
    // Validate loan-to-value ratio (LTV)
    if (loanAmount > propertyValue * 0.8) {
      return res.status(400).json({ 
        success: false, 
        error: 'Loan amount cannot exceed 80% of property value' 
      });
    }
    
    // Calculate monthly payment
    const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, termYears);
    
    // Set next payment date to 30 days from now
    const nextPaymentDate = new Date();
    nextPaymentDate.setDate(nextPaymentDate.getDate() + 30);
    
    // Create new mortgage in database
    const mortgage = await Mortgage.create({
      borrowerWallet,
      propertyValue,
      loanAmount,
      interestRate,
      termYears,
      monthlyPayment,
      propertyAddress,
      nextPaymentDate,
      remainingPayments: termYears * 12,
      collateralizationRatio: (loanAmount / propertyValue) * 100,
      paymentHistory: []
    });
    
    // Create mortgage on Solana blockchain
    try {
      const { program, wallet } = await initializeProgram();
      
      // TODO: Implement Solana smart contract interaction
      // This is where you would call the appropriate Solana program instruction
      // to create the mortgage on-chain
      
      // For now, just log the intention
      logger.info(`Created mortgage in database, will submit to Solana blockchain: ${mortgage.id}`);
      
      // After blockchain confirmation, we would update the onChainMortgageId
      
    } catch (solanaError) {
      logger.error(`Error creating mortgage on Solana: ${solanaError}`);
      // Continue even if Solana interaction fails - we'll handle it asynchronously
    }
    
    return res.status(201).json({
      success: true,
      data: mortgage
    });
  } catch (error) {
    logger.error(`Error creating mortgage: ${error}`);
    next(error);
  }
};

// Make a payment on a mortgage
export const makeMortgagePayment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { amount, walletAddress } = req.body;
    
    // Find the mortgage
    const mortgage = await Mortgage.findById(id);
    
    if (!mortgage) {
      return res.status(404).json({ success: false, error: 'Mortgage not found' });
    }
    
    // Verify that the wallet making the payment is the borrower
    if (mortgage.borrowerWallet !== walletAddress) {
      return res.status(403).json({ 
        success: false, 
        error: 'Only the borrower can make payments on this mortgage' 
      });
    }
    
    // Verify the mortgage is active
    if (mortgage.status !== 'active' && mortgage.status !== 'approved') {
      return res.status(400).json({ 
        success: false, 
        error: `Cannot make payment on a mortgage with status: ${mortgage.status}` 
      });
    }
    
    // Calculate principal and interest
    const { principal, interest } = calculatePrincipalAndInterest(
      mortgage.loanAmount,
      mortgage.interestRate,
      mortgage.monthlyPayment
    );
    
    // Create a payment record
    const payment = {
      date: new Date(),
      amount,
      status: 'completed' as const,
      principal,
      interest
    };
    
    // Try to process the payment on the blockchain
    try {
      const result = await makePaymentOnChain(
        walletAddress,
        mortgage.onChainMortgageId || '',
        amount
      );
      
      // Add transaction ID to payment record if successful
      payment.transactionId = result.transactionSignature;
      
    } catch (solanaError) {
      logger.error(`Error making payment on Solana: ${solanaError}`);
      // Continue with database update even if blockchain operation fails
      // We'll reconcile later if needed
    }
    
    // Update the mortgage in the database
    const nextPaymentDate = new Date(mortgage.nextPaymentDate);
    nextPaymentDate.setMonth(nextPaymentDate.getMonth() + 1);
    
    const remainingPayments = mortgage.remainingPayments - 1;
    const newLoanAmount = mortgage.loanAmount - principal;
    
    // Update mortgage status if this is the final payment
    const newStatus = remainingPayments <= 0 ? 'completed' : mortgage.status;
    
    const updatedMortgage = await Mortgage.findByIdAndUpdate(
      id,
      {
        $set: {
          loanAmount: newLoanAmount,
          remainingPayments,
          nextPaymentDate,
          status: newStatus
        },
        $push: { paymentHistory: payment }
      },
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      data: {
        payment,
        mortgage: updatedMortgage
      }
    });
  } catch (error) {
    logger.error(`Error making mortgage payment: ${error}`);
    next(error);
  }
};

// Update the status of a mortgage
export const updateMortgageStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const mortgage = await Mortgage.findById(id);
    
    if (!mortgage) {
      return res.status(404).json({ success: false, error: 'Mortgage not found' });
    }
    
    // Validate the status transition
    const validTransitions: Record<string, string[]> = {
      'pending': ['approved', 'rejected'],
      'approved': ['active', 'rejected'],
      'active': ['defaulted', 'completed'],
      'defaulted': ['active'], // Allow reinstating a defaulted mortgage
      'completed': [] // No transitions from completed
    };
    
    if (!validTransitions[mortgage.status].includes(status)) {
      return res.status(400).json({ 
        success: false, 
        error: `Cannot transition from ${mortgage.status} to ${status}` 
      });
    }
    
    // If transitioning to active from approved, set the start date
    const updates: any = { status };
    if (mortgage.status === 'approved' && status === 'active') {
      updates.startDate = new Date();
    }
    
    const updatedMortgage = await Mortgage.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true }
    );
    
    return res.status(200).json({
      success: true,
      data: updatedMortgage
    });
  } catch (error) {
    logger.error(`Error updating mortgage status: ${error}`);
    next(error);
  }
};

// Get payment history for a mortgage
export const getMortgagePaymentHistory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const mortgage = await Mortgage.findById(id);
    
    if (!mortgage) {
      return res.status(404).json({ success: false, error: 'Mortgage not found' });
    }
    
    return res.status(200).json({
      success: true,
      data: {
        mortgageId: mortgage._id,
        borrowerWallet: mortgage.borrowerWallet,
        paymentHistory: mortgage.paymentHistory
      }
    });
  } catch (error) {
    logger.error(`Error getting mortgage payment history: ${error}`);
    next(error);
  }
};

// Get amortization schedule for a mortgage
export const getAmortizationSchedule = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    
    const mortgage = await Mortgage.findById(id);
    
    if (!mortgage) {
      return res.status(404).json({ success: false, error: 'Mortgage not found' });
    }
    
    // Calculate the amortization schedule
    const schedule = calculateAmortizationSchedule(
      mortgage.loanAmount,
      mortgage.interestRate,
      mortgage.termYears,
      mortgage.startDate
    );
    
    return res.status(200).json({
      success: true,
      data: {
        mortgageId: mortgage._id,
        borrowerWallet: mortgage.borrowerWallet,
        loanAmount: mortgage.loanAmount,
        interestRate: mortgage.interestRate,
        termYears: mortgage.termYears,
        monthlyPayment: mortgage.monthlyPayment,
        startDate: mortgage.startDate,
        schedule
      }
    });
  } catch (error) {
    logger.error(`Error generating amortization schedule: ${error}`);
    next(error);
  }
};

