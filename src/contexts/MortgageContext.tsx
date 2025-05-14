import React, { createContext, useContext, useState, useEffect } from 'react';
import { useWallet } from './WalletContext';
import * as api from '../services/api';

// Use the Mortgage interface from the API service
export type Mortgage = Omit<api.Mortgage, '_id'> & { id: string };
export type Payment = api.Payment;

interface MortgageContextType {
  mortgages: Mortgage[];
  loading: boolean;
  error: string | null;
  createMortgage: (
    propertyValue: number,
    loanAmount: number,
    interestRate: number,
    termYears: number,
    propertyAddress: string
  ) => Promise<Mortgage | null>;
  getMortgage: (id: string) => Promise<Mortgage | null>;
  makePayment: (mortgageId: string, amount?: number) => Promise<boolean>;
  simulateSmartContractPayment: (mortgageId: string) => Promise<void>;
  getAmortizationSchedule: (mortgageId: string) => Promise<api.AmortizationSchedule | null>;
}

const MortgageContext = createContext<MortgageContextType | undefined>(undefined);

export function MortgageProvider({ children }: { children: React.ReactNode }) {
  const [mortgages, setMortgages] = useState<Mortgage[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { address, balance, withdrawFunds } = useWallet();

  // Load mortgages from API when wallet address changes
  useEffect(() => {
    const fetchMortgages = async () => {
      if (!address) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const fetchedMortgages = await api.getMortgages(address);
        // Convert API mortgages to our format (id instead of _id)
        const formattedMortgages: Mortgage[] = fetchedMortgages.map(mortgage => ({
          ...mortgage,
          id: mortgage._id,
          // Convert date strings to Date objects
          startDate: new Date(mortgage.startDate),
          nextPaymentDate: new Date(mortgage.nextPaymentDate),
          paymentHistory: mortgage.paymentHistory.map(payment => ({
            ...payment,
            date: new Date(payment.date)
          }))
        }));
        
        setMortgages(formattedMortgages);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mortgages');
        console.error('Error loading mortgages:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMortgages();
  }, [address]);

  // Create a new mortgage
  const createMortgage = async (
    propertyValue: number,
    loanAmount: number,
    interestRate: number,
    termYears: number,
    propertyAddress: string
  ): Promise<Mortgage | null> => {
    if (!address) return null;
    
    if (loanAmount > propertyValue * 0.8) {
      // Loan amount exceeds 80% of property value
      setError('Loan amount cannot exceed 80% of property value');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Call the API to create the mortgage
      const newMortgage = await api.createMortgage({
        borrowerWallet: address,
        propertyValue,
        loanAmount,
        interestRate,
        termYears,
        propertyAddress
      });
      
      // Convert to our format
      const formattedMortgage: Mortgage = {
        ...newMortgage,
        id: newMortgage._id,
        startDate: new Date(newMortgage.startDate),
        nextPaymentDate: new Date(newMortgage.nextPaymentDate),
        paymentHistory: newMortgage.paymentHistory.map(payment => ({
          ...payment,
          date: new Date(payment.date)
        }))
      };
      
      // Update local state
      setMortgages(prev => [...prev, formattedMortgage]);
      
      return formattedMortgage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create mortgage');
      console.error('Error creating mortgage:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Get a single mortgage by ID
  const getMortgage = async (id: string): Promise<Mortgage | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // First check if we have it in state
      const localMortgage = mortgages.find(m => m.id === id);
      if (localMortgage) {
        return localMortgage;
      }
      
      // Otherwise fetch from API
      const fetchedMortgage = await api.getMortgage(id);
      
      // Convert to our format
      const formattedMortgage: Mortgage = {
        ...fetchedMortgage,
        id: fetchedMortgage._id,
        startDate: new Date(fetchedMortgage.startDate),
        nextPaymentDate: new Date(fetchedMortgage.nextPaymentDate),
        paymentHistory: fetchedMortgage.paymentHistory.map(payment => ({
          ...payment,
          date: new Date(payment.date)
        }))
      };
      
      return formattedMortgage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get mortgage');
      console.error('Error getting mortgage:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Make a payment on a mortgage
  const makePayment = async (mortgageId: string, amount?: number): Promise<boolean> => {
    if (!address) return false;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get the mortgage
      const mortgage = await getMortgage(mortgageId);
      if (!mortgage) {
        setError('Mortgage not found');
        return false;
      }
      
      // Use provided amount or default to monthly payment
      const paymentAmount = amount || mortgage.monthlyPayment;
      
      // Check if user has enough balance
      if (balance < paymentAmount) {
        setError('Insufficient funds in wallet');
        return false;
      }
      
      // Make payment through API
      const result = await api.makeMortgagePayment(mortgageId, {
        amount: paymentAmount,
        walletAddress: address
      });
      
      // Update wallet balance (this will be handled by WalletContext in a real implementation)
      withdrawFunds(paymentAmount);
      
      // Update local state with the updated mortgage
      const updatedMortgage = result.mortgage;
      setMortgages(prev => prev.map(m => 
        m.id === mortgageId ? {
          ...updatedMortgage,
          id: updatedMortgage._id,
          startDate: new Date(updatedMortgage.startDate),
          nextPaymentDate: new Date(updatedMortgage.nextPaymentDate),
          paymentHistory: updatedMortgage.paymentHistory.map(payment => ({
            ...payment,
            date: new Date(payment.date)
          }))
        } : m
      ));
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to make payment');
      console.error('Error making payment:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Simulate an automatic payment from the smart contract
  const simulateSmartContractPayment = async (mortgageId: string): Promise<void> => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Get the mortgage
      const mortgage = await getMortgage(mortgageId);
      if (!mortgage) {
        setError('Mortgage not found');
        return;
      }
      
      // Make the payment
      await makePayment(mortgageId, mortgage.monthlyPayment);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process automatic payment');
      console.error('Error in automatic payment:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Get amortization schedule for a mortgage
  const getAmortizationSchedule = async (mortgageId: string): Promise<api.AmortizationSchedule | null> => {
    setLoading(true);
    setError(null);
    
    try {
      // Get the amortization schedule from the API
      const schedule = await api.getAmortizationSchedule(mortgageId);
      return schedule;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get amortization schedule');
      console.error('Error getting amortization schedule:', err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return (
    <MortgageContext.Provider
      value={{
        mortgages,
        loading,
        error,
        createMortgage,
        getMortgage,
        makePayment,
        simulateSmartContractPayment,
        getAmortizationSchedule
      }}
    >
      {children}
    </MortgageContext.Provider>
  );
}

export function useMortgage(): MortgageContextType {
  const context = useContext(MortgageContext);
  if (context === undefined) {
    throw new Error('useMortgage must be used within a MortgageProvider');
  }
  return context;
}