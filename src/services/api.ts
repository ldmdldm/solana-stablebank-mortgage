/**
 * API service for communicating with the backend
 */

// Base API URL - use environment variable or fallback to localhost for development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Define common interface for API responses
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
}

// Interface for handling API errors
export class ApiError extends Error {
  statusCode: number;
  
  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

/**
 * Generic API request handler
 */
async function apiRequest<T>(
  endpoint: string, 
  method: string = 'GET', 
  data?: any
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json'
    },
    credentials: 'include' // Include cookies for auth if needed
  };
  
  if (data) {
    options.body = JSON.stringify(data);
  }
  
  const response = await fetch(url, options);
  const responseData: ApiResponse<T> = await response.json();
  
  if (!response.ok) {
    throw new ApiError(responseData.error || 'Something went wrong', response.status);
  }
  
  return responseData.data as T;
}

// ====== Mortgage API ======

export interface Mortgage {
  _id: string;
  borrowerWallet: string;
  propertyValue: number;
  loanAmount: number;
  interestRate: number;
  termYears: number;
  monthlyPayment: number;
  propertyAddress: string;
  startDate: Date;
  status: 'pending' | 'approved' | 'active' | 'defaulted' | 'completed';
  nextPaymentDate: Date;
  remainingPayments: number;
  collateralizationRatio: number;
  paymentHistory: Payment[];
  onChainMortgageId?: string;
  propertyNft?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  _id: string;
  date: Date;
  amount: number;
  status: 'pending' | 'completed' | 'missed';
  principal: number;
  interest: number;
  transactionId?: string;
}

export interface MortgagePayment {
  amount: number;
  walletAddress: string;
}

export interface AmortizationScheduleItem {
  paymentNumber: number;
  paymentDate: Date;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface AmortizationSchedule {
  mortgageId: string;
  borrowerWallet: string;
  loanAmount: number;
  interestRate: number;
  termYears: number;
  monthlyPayment: number;
  startDate: Date;
  schedule: AmortizationScheduleItem[];
}

// Get all mortgages for a user
export async function getMortgages(walletAddress: string): Promise<Mortgage[]> {
  return apiRequest<Mortgage[]>(`/mortgages/user/${walletAddress}`);
}

// Get a single mortgage by ID
export async function getMortgage(id: string): Promise<Mortgage> {
  return apiRequest<Mortgage>(`/mortgages/${id}`);
}

// Create a new mortgage
export async function createMortgage(mortgageData: {
  borrowerWallet: string;
  propertyValue: number;
  loanAmount: number;
  interestRate: number;
  termYears: number;
  propertyAddress: string;
}): Promise<Mortgage> {
  return apiRequest<Mortgage>('/mortgages', 'POST', mortgageData);
}

// Make a payment on a mortgage
export async function makeMortgagePayment(
  mortgageId: string, 
  paymentData: MortgagePayment
): Promise<{ payment: Payment; mortgage: Mortgage }> {
  return apiRequest<{ payment: Payment; mortgage: Mortgage }>(
    `/mortgages/${mortgageId}/payment`, 
    'POST', 
    paymentData
  );
}

// Get payment history for a mortgage
export async function getMortgagePaymentHistory(
  mortgageId: string
): Promise<{ mortgageId: string; borrowerWallet: string; paymentHistory: Payment[] }> {
  return apiRequest<{ mortgageId: string; borrowerWallet: string; paymentHistory: Payment[] }>(
    `/mortgages/${mortgageId}/payments`
  );
}

// Get amortization schedule for a mortgage
export async function getAmortizationSchedule(mortgageId: string): Promise<AmortizationSchedule> {
  return apiRequest<AmortizationSchedule>(`/mortgages/${mortgageId}/schedule`);
}

// ====== Wallet API ======

export interface Wallet {
  address: string;
  balance: number;
  isVerified: boolean;
  totalDeposits?: number;
  totalWithdrawals?: number;
  transactionCount?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Transaction {
  _id?: string;
  date: Date;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'payment' | 'receipt';
  description: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  relatedEntityId?: string;
}

export interface TransactionResponse {
  transactions: Transaction[];
  pagination: {
    page: number;
    limit: number;
    totalPages: number;
  }
}

// Get wallet information
export async function getWalletInfo(address: string): Promise<Wallet> {
  return apiRequest<Wallet>(`/wallet/${address}`);
}

// Create or register a wallet
export async function createWallet(address: string): Promise<Wallet> {
  return apiRequest<Wallet>('/wallet', 'POST', { address });
}

// Deposit funds to a wallet
export async function depositFunds(
  address: string, 
  amount: number
): Promise<{ wallet: Wallet; transaction: Transaction }> {
  return apiRequest<{ wallet: Wallet; transaction: Transaction }>(
    `/wallet/${address}/deposit`, 
    'POST', 
    { amount }
  );
}

// Withdraw funds from a wallet
export async function withdrawFunds(
  address: string, 
  amount: number
): Promise<{ wallet: Wallet; transaction: Transaction }> {
  return apiRequest<{ wallet: Wallet; transaction: Transaction }>(
    `/wallet/${address}/withdraw`, 
    'POST', 
    { amount }
  );
}

// Get transaction history for a wallet
export async function getTransactionHistory(
  address: string,
  page?: number,
  limit?: number,
  type?: string
): Promise<TransactionResponse> {
  const queryParams = new URLSearchParams();
  if (page) queryParams.append('page', page.toString());
  if (limit) queryParams.append('limit', limit.toString());
  if (type) queryParams.append('type', type);
  
  const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
  
  return apiRequest<TransactionResponse>(`/wallet/${address}/transactions${queryString}`);
}

// Verify wallet ownership through signature
export async function verifyWallet(
  address: string,
  signature: string,
  message: string
): Promise<{ address: string; isVerified: boolean }> {
  return apiRequest<{ address: string; isVerified: boolean }>(
    `/wallet/${address}/verify`,
    'POST',
    { signature, message }
  );
}

