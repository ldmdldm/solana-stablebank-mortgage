import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useMortgage, Mortgage } from '../contexts/MortgageContext';
import { useWallet } from '../contexts/WalletContext';
import { 
  ArrowLeft, Clock, AlertCircle, CheckCircle2, Home, Wallet, 
  ChevronDown, ChevronUp, ExternalLink, Landmark, BarChart3
} from 'lucide-react';

const MortgageDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { mortgages, getMortgage, makePayment, simulateSmartContractPayment } = useMortgage();
  const { balance } = useWallet();
  
  const [mortgage, setMortgage] = useState<Mortgage | null>(null);
  const [showPaymentHistory, setShowPaymentHistory] = useState(false);
  const [showContractDetails, setShowContractDetails] = useState(false);
  const [simulatingPayment, setSimulatingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      const currentMortgage = getMortgage(id);
      if (currentMortgage) {
        setMortgage(currentMortgage);
      }
    }
  }, [id, mortgages, getMortgage]);

  const handlePayment = () => {
    if (!mortgage) return;
    
    const success = makePayment(mortgage.id);
    setPaymentSuccess(success);
    
    setTimeout(() => {
      setPaymentSuccess(false);
    }, 3000);
  };

  const handleSimulateSmartContract = () => {
    if (!mortgage) return;
    
    setSimulatingPayment(true);
    
    // Simulate the smart contract payment process with a delay
    setTimeout(() => {
      simulateSmartContractPayment(mortgage.id);
      setSimulatingPayment(false);
      setPaymentSuccess(true);
      
      setTimeout(() => {
        setPaymentSuccess(false);
      }, 3000);
    }, 2000);
  };

  if (!mortgage) {
    return (
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-6">
          <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 flex items-center mr-4">
            <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
          </Link>
        </div>
        <Card className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
          <h2 className="h2 mb-2">Mortgage Not Found</h2>
          <p className="text-slate-400 mb-6">The mortgage you're looking for doesn't exist or you don't have access.</p>
          <Link to="/dashboard">
            <Button variant="primary">Return to Dashboard</Button>
          </Link>
        </Card>
      </div>
    );
  }

  // Calculate remaining balance
  const remainingPrincipal = mortgage.loanAmount;
  
  // Calculate progress percentage
  const totalPayments = mortgage.termYears * 12;
  const progressPercentage = ((totalPayments - mortgage.remainingPayments) / totalPayments) * 100;
  
  // Format the next payment date
  const nextPaymentDate = new Date(mortgage.nextPaymentDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  // Get payment status
  const today = new Date();
  const paymentDue = new Date(mortgage.nextPaymentDate) <= today;
  const paymentStatus = paymentDue ? 'due' : 'upcoming';

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center mb-6">
        <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 flex items-center mr-4">
          <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
        </Link>
        <h1 className="h1">Mortgage Details</h1>
      </div>
      
      {/* Status banner */}
      <div className={`mb-6 p-4 rounded-lg flex items-center
        ${mortgage.status === 'pending' ? 'bg-yellow-500/10 border border-yellow-500/30' : 
          mortgage.status === 'approved' ? 'bg-blue-500/10 border border-blue-500/30' :
          mortgage.status === 'active' ? 'bg-green-500/10 border border-green-500/30' :
          mortgage.status === 'completed' ? 'bg-slate-500/10 border border-slate-500/30' :
          'bg-red-500/10 border border-red-500/30'}`
      }>
        {mortgage.status === 'pending' ? (
          <Clock className="w-5 h-5 text-yellow-400 mr-3" />
        ) : mortgage.status === 'approved' || mortgage.status === 'active' ? (
          <CheckCircle2 className="w-5 h-5 text-green-400 mr-3" />
        ) : (
          <AlertCircle className="w-5 h-5 text-red-400 mr-3" />
        )}
        <div>
          <p className={`font-medium
            ${mortgage.status === 'pending' ? 'text-yellow-400' : 
              mortgage.status === 'approved' || mortgage.status === 'active' ? 'text-green-400' :
              mortgage.status === 'completed' ? 'text-slate-400' :
              'text-red-400'}`
          }>
            Mortgage Status: {mortgage.status.charAt(0).toUpperCase() + mortgage.status.slice(1)}
          </p>
          <p className="text-sm text-slate-300">
            {mortgage.status === 'pending' && 'Your application is being processed.'}
            {mortgage.status === 'approved' && 'Your mortgage has been approved and is being finalized.'}
            {mortgage.status === 'active' && 'Your mortgage is active and in good standing.'}
            {mortgage.status === 'completed' && 'Your mortgage has been fully paid off. Congratulations!'}
            {mortgage.status === 'defaulted' && 'Your mortgage is in default. Please contact support immediately.'}
          </p>
        </div>
      </div>
      
      {/* Property and Loan Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="md:col-span-2 p-6">
          <div className="flex items-start mb-4">
            <Home className="w-6 h-6 text-blue-400 mr-3" />
            <div>
              <h2 className="h3 mb-1">Property Details</h2>
              <p className="text-slate-300">{mortgage.propertyAddress}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mt-6">
            <div>
              <p className="text-sm text-slate-400">Property Value</p>
              <p className="text-lg font-semibold">{mortgage.propertyValue.toLocaleString()} USDC</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-400">Loan Amount</p>
              <p className="text-lg font-semibold">{mortgage.loanAmount.toLocaleString()} USDC</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-400">Interest Rate</p>
              <p className="text-lg font-semibold">{mortgage.interestRate}%</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-400">Term Length</p>
              <p className="text-lg font-semibold">{mortgage.termYears} years</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-400">Start Date</p>
              <p className="text-lg font-semibold">
                {new Date(mortgage.startDate).toLocaleDateString()}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-slate-400">Collateralization Ratio</p>
              <p className="text-lg font-semibold">{mortgage.collateralizationRatio.toFixed(1)}%</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-start mb-4">
            <Landmark className="w-6 h-6 text-teal-400 mr-3" />
            <div>
              <h2 className="h3 mb-1">Payment Info</h2>
              <p className="text-slate-300">Monthly payment details</p>
            </div>
          </div>
          
          <div className="space-y-4 mt-6">
            <div>
              <p className="text-sm text-slate-400">Monthly Payment</p>
              <p className="text-xl font-bold text-teal-400">{mortgage.monthlyPayment.toLocaleString()} USDC</p>
            </div>
            
            <div>
              <p className="text-sm text-slate-400">Next Payment Due</p>
              <p className="text-lg font-semibold">{nextPaymentDate}</p>
              <p className={`text-sm ${paymentDue ? 'text-red-400' : 'text-green-400'}`}>
                {paymentDue ? 'Payment is due now' : 'Payment upcoming'}
              </p>
            </div>
            
            <div>
              <p className="text-sm text-slate-400">Remaining Payments</p>
              <p className="text-lg font-semibold">{mortgage.remainingPayments} payments</p>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Loan Progress */}
      {mortgage.status === 'active' && (
        <Card className="p-6 mb-8">
          <h2 className="h3 mb-4">Loan Progress</h2>
          <div className="relative mb-4">
            <div className="w-full h-4 bg-slate-800 rounded-full">
              <div 
                className="h-4 rounded-full bg-gradient-to-r from-blue-600 to-teal-500 transition-all duration-1000 ease-in-out"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="mt-2 flex justify-between text-sm text-slate-400">
              <span>0%</span>
              <span>{progressPercentage.toFixed(1)}% complete</span>
              <span>100%</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Original Loan Amount</p>
              <p className="text-xl font-semibold">{mortgage.loanAmount.toLocaleString()} USDC</p>
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Remaining Principal</p>
              <p className="text-xl font-semibold">{remainingPrincipal.toLocaleString()} USDC</p>
            </div>
            
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <p className="text-sm text-slate-400 mb-1">Paid to Date</p>
              <p className="text-xl font-semibold">
                {(mortgage.loanAmount - remainingPrincipal).toLocaleString()} USDC
              </p>
            </div>
          </div>
        </Card>
      )}
      
      {/* Payment Actions */}
      {mortgage.status === 'active' && (
        <Card className="p-6 mb-8">
          <h2 className="h3 mb-4">Payment Actions</h2>
          
          {paymentSuccess && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center">
              <CheckCircle2 className="w-5 h-5 text-green-400 mr-3" />
              <p className="text-green-400">Payment successful! Your mortgage has been updated.</p>
            </div>
          )}
          
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1 bg-slate-800/50 p-6 rounded-lg">
              <div className="flex items-start mb-4">
                <Wallet className="w-6 h-6 text-blue-400 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">Manual Payment</h3>
                  <p className="text-sm text-slate-300">Make a payment from your wallet</p>
                </div>
              </div>
              
              <div className="border-t border-slate-700 my-4 pt-4">
                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-1">Current Wallet Balance</p>
                  <p className="text-lg font-semibold">{balance.toLocaleString()} USDC</p>
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-slate-400 mb-1">Payment Amount</p>
                  <p className="text-lg font-semibold">{mortgage.monthlyPayment.toLocaleString()} USDC</p>
                </div>
                
                <Button 
                  variant="primary" 
                  fullWidth 
                  onClick={handlePayment}
                  disabled={balance < mortgage.monthlyPayment}
                >
                  Make Payment
                </Button>
                
                {balance < mortgage.monthlyPayment && (
                  <p className="text-sm text-red-400 mt-2">
                    Insufficient funds in wallet. Please add more USDC.
                  </p>
                )}
              </div>
            </div>
            
            <div className="flex-1 bg-slate-800/50 p-6 rounded-lg">
              <div className="flex items-start mb-4">
                <BarChart3 className="w-6 h-6 text-teal-400 mr-3" />
                <div>
                  <h3 className="text-lg font-semibold mb-1">Smart Contract Payment</h3>
                  <p className="text-sm text-slate-300">Simulate automatic payment</p>
                </div>
              </div>
              
              <div className="border-t border-slate-700 my-4 pt-4">
                <div className="mb-4">
                  <p className="text-sm text-slate-400">
                    In a real blockchain environment, the smart contract would automatically deduct payments 
                    on the due date. This simulation demonstrates how that would work.
                  </p>
                </div>
                
                <Button 
                  variant="secondary" 
                  fullWidth 
                  onClick={handleSimulateSmartContract}
                  isLoading={simulatingPayment}
                  disabled={balance < mortgage.monthlyPayment || simulatingPayment}
                >
                  Simulate Automatic Payment
                </Button>
                
                {balance < mortgage.monthlyPayment && (
                  <p className="text-sm text-red-400 mt-2">
                    Insufficient funds in wallet. Please add more USDC.
                  </p>
                )}
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Payment History */}
      <Card className="p-6 mb-8">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowPaymentHistory(!showPaymentHistory)}
        >
          <h2 className="h3">Payment History</h2>
          <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            {showPaymentHistory ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {showPaymentHistory && (
          <div className="mt-4">
            {mortgage.paymentHistory.length > 0 ? (
              <div className="space-y-2">
                {mortgage.paymentHistory
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map(payment => (
                    <div key={payment.id} className="p-4 bg-slate-800/50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">
                          {new Date(payment.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                        <div className="flex items-center mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full
                            ${payment.status === 'completed' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                              payment.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 
                              'bg-red-500/20 text-red-400 border border-red-500/30'}`
                          }>
                            {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <p className="font-medium">{payment.amount.toLocaleString()} USDC</p>
                        <p className="text-xs text-slate-400">
                          Principal: {payment.principal.toFixed(2)} • Interest: {payment.interest.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-center text-slate-400 py-4">No payment history available</p>
            )}
          </div>
        )}
      </Card>
      
      {/* Smart Contract Details */}
      <Card className="p-6 mb-8">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setShowContractDetails(!showContractDetails)}
        >
          <h2 className="h3">Smart Contract Details</h2>
          <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            {showContractDetails ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </button>
        </div>
        
        {showContractDetails && (
          <div className="mt-4">
            <div className="p-4 bg-slate-800/50 rounded-lg mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Contract Address</span>
                <a href="#" className="text-blue-400 hover:text-blue-300 flex items-center">
                  sol4tn79...3kf9 <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Property NFT</span>
                <a href="#" className="text-blue-400 hover:text-blue-300 flex items-center">
                  View on Explorer <ExternalLink className="w-3 h-3 ml-1" />
                </a>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Deployed On</span>
                <span>{new Date(mortgage.startDate).toLocaleDateString()}</span>
              </div>
              
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Contract Type</span>
                <span>MortgageV1</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-slate-400">Auto-payments</span>
                <span className="text-green-400">Enabled</span>
              </div>
            </div>
            
            <div className="p-4 bg-slate-800/50 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Contract Terms</h3>
              <div className="space-y-2 text-sm">
                <p>• Collateral will be locked until full repayment</p>
                <p>• Late payments incur a 2% fee</p>
                <p>• 15-day grace period before default</p>
                <p>• Default results in property NFT transfer to lender</p>
                <p>• Early repayment allowed with no penalties</p>
                <p>• Contract auto-releases NFT on final payment</p>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default MortgageDetails;