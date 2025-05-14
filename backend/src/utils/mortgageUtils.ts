/**
 * Utility functions for mortgage-related calculations
 */

/**
 * Calculate monthly mortgage payment
 * @param loanAmount - The total loan amount
 * @param interestRate - Annual interest rate (as a percentage, e.g., 4.5 for 4.5%)
 * @param termYears - Loan term in years
 * @returns Monthly payment amount
 */
export const calculateMonthlyPayment = (
  loanAmount: number, 
  interestRate: number, 
  termYears: number
): number => {
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = termYears * 12;
  return (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalPayments));
};

/**
 * Calculate principal and interest portions of a mortgage payment
 * @param loanAmount - The current loan balance
 * @param interestRate - Annual interest rate (as a percentage)
 * @param monthlyPayment - The monthly payment amount
 * @returns Object containing principal and interest portions
 */
export const calculatePrincipalAndInterest = (
  loanAmount: number,
  interestRate: number,
  monthlyPayment: number
): { principal: number; interest: number } => {
  const monthlyRate = interestRate / 100 / 12;
  const interest = loanAmount * monthlyRate;
  const principal = monthlyPayment - interest;
  
  return { principal, interest };
};

/**
 * Calculate the total interest paid over the life of the loan
 * @param loanAmount - The total loan amount
 * @param monthlyPayment - The monthly payment amount
 * @param termYears - Loan term in years
 * @returns Total interest paid over the loan term
 */
export const calculateTotalInterest = (
  loanAmount: number,
  monthlyPayment: number,
  termYears: number
): number => {
  const totalPayments = termYears * 12;
  const totalPaid = monthlyPayment * totalPayments;
  return totalPaid - loanAmount;
};

/**
 * Calculate the loan-to-value ratio as a percentage
 * @param loanAmount - The loan amount
 * @param propertyValue - The property value
 * @returns LTV ratio as a percentage
 */
export const calculateLTV = (
  loanAmount: number,
  propertyValue: number
): number => {
  return (loanAmount / propertyValue) * 100;
};

/**
 * Calculate the amortization schedule for a mortgage
 * @param loanAmount - The loan amount
 * @param interestRate - Annual interest rate (as a percentage)
 * @param termYears - Loan term in years
 * @param startDate - The start date of the mortgage
 * @returns Array of payment objects with payment details
 */
export const calculateAmortizationSchedule = (
  loanAmount: number,
  interestRate: number,
  termYears: number,
  startDate: Date = new Date()
): Array<{
  paymentNumber: number;
  paymentDate: Date;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}> => {
  const monthlyPayment = calculateMonthlyPayment(loanAmount, interestRate, termYears);
  const monthlyRate = interestRate / 100 / 12;
  const totalPayments = termYears * 12;
  
  let balance = loanAmount;
  const schedule = [];
  
  for (let i = 1; i <= totalPayments; i++) {
    const interest = balance * monthlyRate;
    const principal = monthlyPayment - interest;
    balance -= principal;
    
    // If we're at the last payment, handle any rounding issues
    if (i === totalPayments) {
      balance = 0;
    }
    
    // Calculate payment date
    const paymentDate = new Date(startDate);
    paymentDate.setMonth(startDate.getMonth() + i);
    
    schedule.push({
      paymentNumber: i,
      paymentDate,
      payment: monthlyPayment,
      principal,
      interest,
      remainingBalance: balance
    });
  }
  
  return schedule;
};

