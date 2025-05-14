import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useMortgage } from '../contexts/MortgageContext';
import { useWallet } from '../contexts/WalletContext';
import { ChevronRight, ChevronLeft, AlertCircle, DollarSign, Percent, Clock, Home } from 'lucide-react';

const MortgageApplication: React.FC = () => {
  const { connected } = useWallet();
  const { createMortgage } = useMortgage();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [propertyValue, setPropertyValue] = useState(500000);
  const [loanAmount, setLoanAmount] = useState(400000);
  const [interestRate, setInterestRate] = useState(4.5);
  const [termYears, setTermYears] = useState(30);
  const [propertyAddress, setPropertyAddress] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Calculate monthly payment
  const calculateMonthlyPayment = () => {
    const monthlyRate = interestRate / 100 / 12;
    const totalPayments = termYears * 12;
    return (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalPayments));
  };
  
  const monthlyPayment = calculateMonthlyPayment();
  const loanToValueRatio = (loanAmount / propertyValue) * 100;

  // Redirect to wallet if not connected
  useEffect(() => {
    if (!connected) {
      navigate('/wallet');
    }
  }, [connected, navigate]);

  const handleNextStep = () => {
    if (step === 1) {
      if (!propertyAddress.trim()) {
        setError('Please enter a property address');
        return;
      }
    }
    
    if (step === 2) {
      if (loanAmount > propertyValue * 0.8) {
        setError('Loan amount cannot exceed 80% of property value');
        return;
      }
    }
    
    setError('');
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setError('');
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      const mortgage = createMortgage(
        propertyValue,
        loanAmount,
        interestRate,
        termYears,
        propertyAddress
      );
      
      if (mortgage) {
        navigate('/dashboard');
      } else {
        setError('Could not create mortgage. Please check your inputs and try again.');
      }
    } catch (err) {
      setError('An error occurred while creating your mortgage application.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="h1 mb-2">Apply for a Stablecoin Mortgage</h1>
      <p className="text-slate-400 mb-8">Complete the application to get started with a property-backed loan</p>

      {/* Progress bar */}
      <div className="flex items-center mb-8">
        <div className="w-full bg-slate-800 h-2 rounded-full">
          <div 
            className="bg-gradient-to-r from-blue-500 to-teal-400 h-2 rounded-full transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          ></div>
        </div>
        <span className="ml-4 text-sm font-medium text-slate-300">Step {step} of 4</span>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-start">
          <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
          <p className="text-red-300">{error}</p>
        </div>
      )}

      <Card className="mb-6">
        {/* Step 1: Property Information */}
        {step === 1 && (
          <div className="p-8">
            <h2 className="h3 mb-6">Property Information</h2>
            
            <div className="mb-6">
              <label htmlFor="propertyAddress" className="block text-sm font-medium text-slate-300 mb-2">
                Property Address
              </label>
              <div className="relative">
                <Home className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                <input
                  type="text"
                  id="propertyAddress"
                  value={propertyAddress}
                  onChange={(e) => setPropertyAddress(e.target.value)}
                  placeholder="Enter the full property address"
                  className="input-field pl-10"
                />
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="propertyValue" className="block text-sm font-medium text-slate-300 mb-2">
                Property Value (USDC)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                <input
                  type="number"
                  id="propertyValue"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(Number(e.target.value))}
                  min="100000"
                  step="10000"
                  className="input-field pl-10"
                />
              </div>
              <div className="mt-2">
                <input
                  type="range"
                  min="100000"
                  max="2000000"
                  step="10000"
                  value={propertyValue}
                  onChange={(e) => setPropertyValue(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>100,000</span>
                  <span>2,000,000</span>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 2: Loan Details */}
        {step === 2 && (
          <div className="p-8">
            <h2 className="h3 mb-6">Loan Details</h2>
            
            <div className="mb-6">
              <label htmlFor="loanAmount" className="block text-sm font-medium text-slate-300 mb-2">
                Loan Amount (USDC) - Max 80% of property value
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                <input
                  type="number"
                  id="loanAmount"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  min="10000"
                  max={propertyValue * 0.8}
                  step="10000"
                  className="input-field pl-10"
                />
              </div>
              <div className="mt-2">
                <input
                  type="range"
                  min="10000"
                  max={propertyValue * 0.8}
                  step="10000"
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>10,000</span>
                  <span>{Math.floor(propertyValue * 0.8).toLocaleString()}</span>
                </div>
              </div>
              <p className={`text-sm mt-2 ${loanToValueRatio > 80 ? 'text-red-400' : 'text-slate-400'}`}>
                Loan-to-Value Ratio: {loanToValueRatio.toFixed(1)}%
              </p>
            </div>
            
            <div className="mb-6">
              <label htmlFor="interestRate" className="block text-sm font-medium text-slate-300 mb-2">
                Interest Rate (%)
              </label>
              <div className="relative">
                <Percent className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                <input
                  type="number"
                  id="interestRate"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  min="1"
                  max="15"
                  step="0.1"
                  className="input-field pl-10"
                />
              </div>
              <div className="mt-2">
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="0.1"
                  value={interestRate}
                  onChange={(e) => setInterestRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>1%</span>
                  <span>15%</span>
                </div>
              </div>
            </div>
            
            <div className="mb-6">
              <label htmlFor="termYears" className="block text-sm font-medium text-slate-300 mb-2">
                Term Length (Years)
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 text-slate-500 w-5 h-5" />
                <select
                  id="termYears"
                  value={termYears}
                  onChange={(e) => setTermYears(Number(e.target.value))}
                  className="input-field pl-10"
                >
                  <option value={5}>5 Years</option>
                  <option value={10}>10 Years</option>
                  <option value={15}>15 Years</option>
                  <option value={20}>20 Years</option>
                  <option value={25}>25 Years</option>
                  <option value={30}>30 Years</option>
                </select>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 3: Payment Preview */}
        {step === 3 && (
          <div className="p-8">
            <h2 className="h3 mb-6">Payment Preview</h2>
            
            <div className="flex flex-col gap-6">
              <div className="p-6 rounded-lg bg-slate-800/50 border border-slate-700">
                <h3 className="text-lg font-medium mb-4">Your Monthly Payment</h3>
                <p className="text-3xl font-bold text-blue-400 mb-4">
                  {monthlyPayment.toFixed(2)} USDC
                </p>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Principal + Interest</p>
                    <p className="font-medium">{monthlyPayment.toFixed(2)} USDC</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Payment Frequency</p>
                    <p className="font-medium">Monthly</p>
                  </div>
                  <div>
                    <p className="text-slate-400">First Payment Due</p>
                    <p className="font-medium">30 days after approval</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Total # of Payments</p>
                    <p className="font-medium">{termYears * 12}</p>
                  </div>
                </div>
              </div>
              
              <div className="p-6 rounded-lg bg-slate-800/50 border border-slate-700">
                <h3 className="text-lg font-medium mb-4">Smart Contract Automation</h3>
                <p className="text-sm text-slate-300 mb-4">
                  Your mortgage payments will be automatically handled by a smart contract on the Solana blockchain. 
                  The contract will:
                </p>
                <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
                  <li>Automatically deduct payments from your connected wallet on the due date</li>
                  <li>Calculate and apply principal and interest appropriately</li>
                  <li>Update your loan balance in real-time on the blockchain</li>
                  <li>Release collateral automatically once the loan is fully paid</li>
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* Step 4: Terms and Confirmation */}
        {step === 4 && (
          <div className="p-8">
            <h2 className="h3 mb-6">Review and Confirm</h2>
            
            <div className="space-y-6">
              <div className="bg-slate-800/50 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Loan Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Property Address</span>
                    <span className="font-medium">{propertyAddress}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Property Value</span>
                    <span className="font-medium">{propertyValue.toLocaleString()} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Loan Amount</span>
                    <span className="font-medium">{loanAmount.toLocaleString()} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Interest Rate</span>
                    <span className="font-medium">{interestRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Term Length</span>
                    <span className="font-medium">{termYears} years</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Monthly Payment</span>
                    <span className="font-medium">{monthlyPayment.toFixed(2)} USDC</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Loan-to-Value Ratio</span>
                    <span className="font-medium">{loanToValueRatio.toFixed(1)}%</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-slate-800/50 rounded-lg p-6">
                <h3 className="text-lg font-medium mb-4">Terms and Conditions</h3>
                <div className="text-sm text-slate-300 mb-4 max-h-40 overflow-y-auto pr-2">
                  <p className="mb-2">By submitting this application, you agree to the following terms:</p>
                  <ol className="list-decimal list-inside space-y-2">
                    <li>Your property will be tokenized as an NFT and used as collateral.</li>
                    <li>Smart contracts will automatically handle payments from your connected wallet.</li>
                    <li>Failure to maintain sufficient funds for payments may result in default.</li>
                    <li>In case of default, the smart contract may transfer the collateral NFT.</li>
                    <li>Loan requires maintaining a minimum LTV ratio of 80%.</li>
                    <li>Early repayment is permitted without penalty.</li>
                  </ol>
                </div>
                <div className="flex items-center">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    className="w-4 h-4 bg-slate-800 border border-slate-600 rounded mr-2"
                    required
                  />
                  <label htmlFor="terms" className="text-sm text-slate-300">
                    I agree to the terms and conditions
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Navigation buttons */}
      <div className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={handlePrevStep}
          disabled={step === 1}
          className="flex items-center"
        >
          <ChevronLeft className="w-4 h-4 mr-1" /> Back
        </Button>
        
        {step < 4 ? (
          <Button 
            variant="primary" 
            onClick={handleNextStep}
            className="flex items-center"
          >
            Next <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        ) : (
          <Button 
            variant="primary"
            onClick={handleSubmit}
            isLoading={loading}
          >
            Submit Application
          </Button>
        )}
      </div>
    </div>
  );
};

export default MortgageApplication;