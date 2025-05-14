import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { Program, AnchorProvider, Wallet, BN } from '@coral-xyz/anchor';
import { TOKEN_PROGRAM_ID } from '@solana/spl-token';
import * as fs from 'fs';
import { logger } from '../utils/logger';
import path from 'path';

// Load the IDL file for the stablecoin mortgage program
let idl: any;
try {
  // Try to load the IDL file from the filesystem
  const idlPath = path.resolve(__dirname, '../../../src/programs/stablecoin-mortgage/idl.json');
  idl = JSON.parse(fs.readFileSync(idlPath, 'utf8'));
} catch (error) {
  logger.error(`Failed to load IDL file: ${error}`);
  // If loading fails, use a simplified IDL structure that matches our account structure
  idl = {
    version: '0.1.0',
    name: 'stablecoin_mortgage',
    instructions: [
      {
        name: 'createMortgage',
        accounts: [
          { name: 'borrower', isMut: true, isSigner: true },
          { name: 'mortgage', isMut: true, isSigner: false },
          { name: 'propertyNft', isMut: false, isSigner: false },
          { name: 'lendingPool', isMut: true, isSigner: false },
          { name: 'stablecoinVault', isMut: true, isSigner: false },
          { name: 'programState', isMut: false, isSigner: false },
          { name: 'tokenProgram', isMut: false, isSigner: false },
          { name: 'systemProgram', isMut: false, isSigner: false },
        ],
        args: [
          { name: 'loanAmount', type: 'u64' },
          { name: 'propertyValue', type: 'u64' },
          { name: 'loanDuration', type: 'u64' },
          { name: 'interestRate', type: 'u64' },
        ],
      },
      {
        name: 'makePayment',
        accounts: [
          { name: 'borrower', isMut: true, isSigner: true },
          { name: 'mortgage', isMut: true, isSigner: false },
          { name: 'lendingPool', isMut: true, isSigner: false },
          { name: 'borrowerTokenAccount', isMut: true, isSigner: false },
          { name: 'poolTokenAccount', isMut: true, isSigner: false },
          { name: 'tokenProgram', isMut: false, isSigner: false },
        ],
        args: [
          { name: 'amount', type: 'u64' },
        ],
      },
      {
        name: 'liquidateMortgage',
        accounts: [
          { name: 'liquidator', isMut: true, isSigner: true },
          { name: 'borrower', isMut: false, isSigner: false },
          { name: 'mortgage', isMut: true, isSigner: false },
          { name: 'propertyNft', isMut: true, isSigner: false },
          { name: 'lendingPool', isMut: true, isSigner: false },
          { name: 'liquidatorNftAccount', isMut: true, isSigner: false },
          { name: 'borrowerNftAccount', isMut: true, isSigner: false },
          { name: 'tokenProgram', isMut: false, isSigner: false },
        ],
        args: [],
      },
    ],
    accounts: [
      {
        name: 'Mortgage',
        type: {
          kind: 'struct',
          fields: [
            { name: 'borrower', type: 'publicKey' },
            { name: 'lendingPool', type: 'publicKey' },
            { name: 'propertyNft', type: 'publicKey' },
            { name: 'loanAmount', type: 'u64' },
            { name: 'propertyValue', type: 'u64' },
            { name: 'loanDuration', type: 'u64' },
            { name: 'interestRate', type: 'u64' },
            { name: 'monthlyPayment', type: 'u64' },
            { name: 'remainingBalance', type: 'u64' },
            { name: 'nextPaymentDue', type: 'i64' },
            { name: 'paymentsMade', type: 'u64' },
            { name: 'isActive', type: 'bool' },
            { name: 'isDefault', type: 'bool' },
            { name: 'fundingDate', type: 'i64' },
          ],
        },
      },
    ],
    errors: [
      { code: 300, name: 'InvalidLoanAmount', msg: 'Invalid loan amount' },
      { code: 301, name: 'InvalidLoanDuration', msg: 'Invalid loan duration' },
      { code: 302, name: 'InvalidInterestRate', msg: 'Invalid interest rate' },
      { code: 303, name: 'LoanToValueTooHigh', msg: 'Loan-to-value ratio too high' },
    ],
  };
}

// Connect to Solana network
export const connectToSolana = async (): Promise<Connection> => {
  const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
  const connection = new Connection(rpcUrl, 'confirmed');
  
  try {
    // Verify connection by fetching the recent blockhash
    await connection.getLatestBlockhash();
    logger.info(`Connected to Solana at ${rpcUrl}`);
    return connection;
  } catch (error) {
    logger.error(`Failed to connect to Solana: ${error}`);
    throw new Error(`Failed to connect to Solana: ${error}`);
  }
};

// Initialize wallet from private key
export const initializeWallet = (): Wallet => {
  try {
    // In production, you'd use a secure method to access the private key
    // For development, we'll read from .env
    const privateKeyString = process.env.SOLANA_PRIVATE_KEY;
    
    if (!privateKeyString) {
      throw new Error('Solana private key not found in environment variables');
    }
    
    // Convert private key string to Uint8Array
    let privateKey: Uint8Array;
    
    // Handle different formats the private key might be in
    if (privateKeyString.includes('[') && privateKeyString.includes(']')) {
      // Handle array format
      privateKey = new Uint8Array(JSON.parse(privateKeyString));
    } else if (privateKeyString.includes(',')) {
      // Handle comma-separated format
      privateKey = new Uint8Array(privateKeyString.split(',').map(Number));
    } else {
      // Handle base58 or other string format
      // For simplicity, we'll use a default keypair for development
      logger.warn('Using default keypair for development');
      privateKey = Keypair.generate().secretKey;
    }
    
    const keypair = Keypair.fromSecretKey(privateKey);
    return new Wallet(keypair);
  } catch (error) {
    logger.error(`Failed to initialize wallet: ${error}`);
    // For development purposes, generate a new keypair
    logger.warn('Generating a new keypair for development');
    const keypair = Keypair.generate();
    return new Wallet(keypair);
  }
};

// Initialize Anchor program
export const initializeProgram = async () => {
  try {
    const connection = await connectToSolana();
    const wallet = initializeWallet();
    
    const provider = new AnchorProvider(
      connection,
      wallet,
      { preflightCommitment: 'confirmed' }
    );
    
    const programId = new PublicKey(process.env.PROGRAM_ID || 'Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS');
    
    // @ts-ignore (type issues with Anchor)
    const program = new Program(idl, programId, provider);
    
    return { program, wallet, connection, provider };
  } catch (error) {
    logger.error(`Failed to initialize program: ${error}`);
    throw error;
  }
};

// Create a new mortgage on the blockchain
export const createMortgageOnChain = async (
  borrowerWallet: string,
  loanAmount: number,
  propertyValue: number,
  loanDuration: number,
  interestRate: number,
  propertyNftAddress: string
) => {
  try {
    const { program, wallet, connection } = await initializeProgram();
    const borrowerPubkey = new PublicKey(borrowerWallet);
    const propertyNftPubkey = new PublicKey(propertyNftAddress);
    
    // For a real implementation, you would derive these properly
    // Here we're using placeholders
    const [mortgageAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('mortgage'), borrowerPubkey.toBuffer(), propertyNftPubkey.toBuffer()],
      program.programId
    );
    
    const [lendingPoolAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('lending_pool')],
      program.programId
    );
    
    const [stablecoinVaultAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('stablecoin_vault'), lendingPoolAccount.toBuffer()],
      program.programId
    );
    
    const [programStateAccount] = PublicKey.findProgramAddressSync(
      [Buffer.from('program_state')],
      program.programId
    );
    
    // Convert amounts to Solana's native format (lamports/smallest unit)
    const loanAmountBN = new BN(loanAmount * 1_000_000); // Assuming 6 decimals for USDC
    const propertyValueBN = new BN(propertyValue * 1_000_000);
    const loanDurationBN = new BN(loanDuration);
    const interestRateBN = new BN(interestRate * 100); // Store as basis points
    
    // Simulate the transaction to check for errors
    await program.methods
      .createMortgage(
        loanAmountBN,
        propertyValueBN,
        loanDurationBN,
        interestRateBN
      )
      .accounts({
        borrower: wallet.publicKey,
        mortgage: mortgageAccount,
        propertyNft: propertyNftPubkey,
        lendingPool: lendingPoolAccount,
        stablecoinVault: stablecoinVaultAccount,
        programState: programStateAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: PublicKey.default,
      })
      .simulate();
    
    // If simulation succeeds, send the transaction
    const tx = await program.methods
      .createMortgage(
        loanAmountBN,
        propertyValueBN,
        loanDurationBN,
        interestRateBN
      )
      .accounts({
        borrower: wallet.publicKey,
        mortgage: mortgageAccount,
        propertyNft: propertyNftPubkey,
        lendingPool: lendingPoolAccount,
        stablecoinVault: stablecoinVaultAccount,
        programState: programStateAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: PublicKey.default,
      })
      .rpc();
    
    logger.info(`Mortgage created on-chain with transaction ${tx}`);
    
    // Return the mortgage account address and transaction signature
    return {
      mortgageAddress: mortgageAccount.toString(),
      transactionSignature: tx
    };
  } catch (error) {
    logger.error(`Failed to create mortgage on-chain: ${error}`);
    throw error;
  }
};

// Make a payment on an existing mortgage
export const makePaymentOnChain = async (
  borrowerWallet: string,
  mortgageAddress: string,
  paymentAmount: number
) => {
  try {
    const { program, wallet, connection } = await initializeProgram();
    const mortgagePubkey = new PublicKey(mortgageAddress);
    const borrowerPubkey = new PublicKey(borrowerWallet);
    
    // Fetch the mortgage account to get the lending pool address
    const mortgageAccount = await program.account.mortgage.fetch(mortgagePubkey);
    const lendingPoolPubkey = mortgageAccount.lendingPool;
    
    // Derive token accounts (in a real implementation these would be passed in or derived properly)
    // These are placeholders
    const borrowerTokenAccount = new PublicKey(borrowerWallet); // Should be the borrower's USDC token account
    const poolTokenAccount = new PublicKey(lendingPoolPubkey); // Should be the pool's USDC token account
    
    // Convert payment amount to Solana's native format
    const paymentAmountBN = new BN(paymentAmount * 1_000_000); // Assuming 6 decimals for USDC
    
    // Make the payment
    const tx = await program.methods
      .makePayment(paymentAmountBN)
      .accounts({
        borrower: wallet.publicKey,
        mortgage: mortgagePubkey,
        lendingPool: lendingPoolPubkey,
        borrowerTokenAccount: borrowerTokenAccount,
        poolTokenAccount: poolTokenAccount,
        tokenProgram: TOKEN_PROGRAM_ID,
      })
      .rpc();
    
    logger.info(`Payment made on-chain with transaction ${tx}`);
    
    return {
      transactionSignature: tx
    };
  } catch (error) {
    logger.error(`Failed to make payment on-chain: ${error}`);
    throw error;
  }
};

// Get the on-chain status of a mortgage
export const getMortgageStatus = async (mortgageAddress: string) => {
  try {
    const { program } = await initializeProgram();
    const mortgagePubkey = new PublicKey(mortgageAddress);
    
    const mortgageAccount = await program.account.mortgage.fetch(mortgagePubkey);
    
    return {
      borrower: mortgageAccount.borrower.toString(),
      loanAmount: mortgageAccount.loanAmount.toNumber() / 1_000_000, // Convert to USDC
      propertyValue: mortgageAccount.propertyValue.toNumber() / 1_000_000,
      remainingBalance: mortgageAccount.remainingBalance.toNumber() / 1_000_000,
      monthlyPayment: mortgageAccount.monthlyPayment.toNumber() / 1_000_000,
      paymentsMade: mortgageAccount.paymentsMade.toNumber(),

