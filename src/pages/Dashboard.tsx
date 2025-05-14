import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { useMortgage } from '../contexts/MortgageContext';
import { useWallet } from '../contexts/WalletContext';
import { ArrowRight, PlusCircle, Clock, ChevronRight, AlertCircle } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { mortgages, makePayment } = useMortgage();
  const { connected, balance } = useWallet();

  // Sort mortgages by status - active first, then approved, then pending, then completed
  const sortedMortgages = [...mortgages].sort((a, b) => {
    const statusOrder: Record<string, number> = {
      active: 0,
      approved: 1,
      pending: 2,
      defaulted: 3,
      completed: 4,
    };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  // Calculate total mortgage debt
  const totalDebt = mortgages.reduce((sum, mortgage) => {
    if (mortgage.status === 'active' || mortgage.status === 'approved') {
      return sum + mortgage.loanAmount;
    }
    return sum;
  }, 0);
  
  // Get upcoming payments in the next 30 days
  const upcomingPayments = mortgages.filter(mortgage => {
    if (mortgage.status !== 'active') return false;
    
    const nextPaymentDate = new Date(mortgage.nextPaymentDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    
    return nextPaymentDate <= thirtyDaysFromNow;
  });

  // Check for immediate payments due
  const immediatePayments = mortgages.filter(mortgage => {
    if (mortgage.status !== 'active') return false;
    
    const nextPaymentDate = new Date(mortgage.nextPaymentDate);
    const today = new Date();
    
    return nextPaymentDate <= today;
  });

  // Redirect to wallet if not connected
  useEffect(() => {
    if (!connected) {
      // In a real application, we would use a router to navigate
      window.location.href = '/wallet';
    }
  }, [connected]);

  if (!connected) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div>
          <h1 className="h1 mb-2">Dashboard</h1>
          <p className="text-slate-400">Manage your stablecoin mortgages in one place</p>
        </div>
        <Link to="/apply">
          <Button className="mt-4 md:mt-0" variant="primary">
            <PlusCircle className="w-4 h-4 mr-2" />
            Apply for New Mortgage
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Total Mortgage Debt</h3>
          <p className="text-3xl font-bold mb-1">{totalDebt.toLocaleString()} USDC</p>
          <div className="flex items-center text-sm">
            <span className="text-slate-400">Across {mortgages.filter(m => m.status === 'active' || m.status === 'approved').length} mortgages</span>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Wallet Balance</h3>
          <p className="text-3xl font-bold mb-1">{balance.toLocaleString()} USDC</p>
          <div className="flex items-center text-sm">
            <span className={`${balance > 1000 ? 'text-green-400' : 'text-yellow-400'}`}>
              {balance > 1000 ? 'Healthy balance' : 'Consider adding funds'}
            </span>
          </div>
        </Card>
        
        <Card className="p-6">
          <h3 className="text-sm font-medium text-slate-400 mb-1">Upcoming Payments</h3>
          <p className="text-3xl font-bold mb-1">{upcomingPayments.length}</p>
          <div className="flex items-center text-sm">
            <span className="text-slate-400">Due in the next 30 days</span>
          </div>
        </Card>
      </div>

      {/* Due Payments Alert */}
      {immediatePayments.length > 0 && (
        <Card className="p-6 mb-8 border border-yellow-500/30 bg-yellow-500/10">
          <div className="flex items-start">
            <AlertCircle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-400 mb-2">Payments Due Today</h3>
              <p className="text-slate-300 mb-4">You have {immediatePayments.length} payment(s) due today or overdue. Please make your payment to avoid late fees.</p>
              <div className="space-y-3">
                {immediatePayments.map(mortgage => (
                  <div key={mortgage.id} className="flex items-center justify-between p-3 bg-slate-800/50 rounded-lg">
                    <div>
                      <p className="font-medium">{mortgage.propertyAddress}</p>
                      <p className="text-sm text-slate-400">{mortgage.monthlyPayment.toLocaleString()} USDC due</p>
                    </div>
                    <Button 
                      onClick={() => makePayment(mortgage.id)} 
                      disabled={balance < mortgage.monthlyPayment}
                      variant="primary" 
                      size="sm"
                    >
                      Pay Now
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Your Mortgages */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="h3">Your Mortgages</h2>
        </div>
        
        {sortedMortgages.length > 0 ? (
          <div className="space-y-4">
            {sortedMortgages.map(mortgage => (
              <Link to={`/mortgage/${mortgage.id}`} key={mortgage.id}>
                <Card className="p-6 hover:bg-slate-800/30 transition-colors">
                  <div className="flex flex-col md:flex-row md:items-center justify-between">
                    <div className="mb-4 md:mb-0">
                      <div className="flex items-center mb-2">
                        <h3 className="font-semibold text-lg mr-3">{mortgage.propertyAddress}</h3>
                        <span className={`text-xs px-2 py-1 rounded-full flex items-center
                          ${mortgage.status === 'active' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 
                            mortgage.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                            mortgage.status === 'approved' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                            mortgage.status === 'completed' ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30' : 
                            'bg-red-500/20 text-red-400 border border-red-500/30'}`
                        }>
                          {mortgage.status.charAt(0).toUpperCase() + mortgage.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-slate-300">{mortgage.loanAmount.toLocaleString()} USDC @ {mortgage.interestRate}% for {mortgage.termYears} years</p>
                    </div>
                    
                    <div className="flex flex-col items-start md:items-end">
                      {mortgage.status === 'active' && (
                        <div className="flex items-center mb-2 text-sm">
                          <Clock className="w-4 h-4 mr-1 text-slate-400" />
                          <span className="text-slate-300">
                            Next payment: {new Date(mortgage.nextPaymentDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                      <div className="flex items-center text-sm text-blue-400 hover:text-blue-300 transition">
                        View Details <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-slate-300 mb-4">You don't have any mortgages yet.</p>
            <Link to="/apply">
              <Button variant="primary">
                Apply for a Mortgage
              </Button>
            </Link>
          </Card>
        )}
      </div>

      {/* Recent Activity (simplified) */}
      <div>
        <h2 className="h3 mb-4">Recent Activity</h2>
        <Card className="p-6">
          {mortgages.some(m => m.paymentHistory.length > 0) ? (
            <div className="space-y-4">
              {mortgages.flatMap(mortgage => 
                mortgage.paymentHistory.slice(0, 3).map(payment => ({
                  mortgageId: mortgage.id,
                  propertyAddress: mortgage.propertyAddress,
                  ...payment
                }))
              )
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 5)
              .map(activity => (
                <div key={activity.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-800/30 transition-colors">
                  <div>
                    <p className="font-medium">Payment for {activity.propertyAddress}</p>
                    <p className="text-sm text-slate-400">
                      {new Date(activity.date).toLocaleDateString()} • 
                      <span className={activity.status === 'completed' ? ' text-green-400' : ' text-yellow-400'}>
                        {' '}{activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                      </span>
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{activity.amount.toLocaleString()} USDC</p>
                    <p className="text-xs text-slate-400">
                      Principal: {activity.principal.toFixed(2)} • Interest: {activity.interest.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
              <div className="text-center mt-4">
                <Link to="/mortgage/history" className="text-blue-400 hover:text-blue-300 text-sm flex items-center justify-center">
                  View All Activity <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            </div>
          ) : (
            <p className="text-center text-slate-400 py-4">No recent activity to display</p>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;