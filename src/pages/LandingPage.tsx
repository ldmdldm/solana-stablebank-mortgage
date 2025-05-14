import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button';
import { ArrowRight, Shield, Zap, Coins, Building } from 'lucide-react';
import { useWallet } from '../contexts/WalletContext';

const LandingPage: React.FC = () => {
  const { connected } = useWallet();

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="md:w-1/2">
              <h1 className="text-5xl md:text-6xl font-bold leading-tight bg-gradient-to-r from-blue-400 via-teal-300 to-blue-500 bg-clip-text text-transparent mb-6">
                Stablecoin-Backed Mortgage System on Solana
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Unlock the future of real estate financing with programmable smart contracts 
                that automate repayments, manage loan terms, and provide security through blockchain technology.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to={connected ? "/dashboard" : "/apply"}>
                  <Button variant="primary" size="lg" className="flex items-center gap-2">
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Button>
                </Link>
                <a href="#how-it-works">
                  <Button variant="outline" size="lg">
                    Learn More
                  </Button>
                </a>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="w-full h-96 rounded-xl bg-gradient-to-br from-blue-600/20 via-teal-500/20 to-slate-900/20 border border-blue-500/30 p-1">
                <div className="w-full h-full rounded-lg bg-slate-900/60 backdrop-blur-sm flex items-center justify-center overflow-hidden relative">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.15),transparent_70%)]"></div>
                  <Building className="w-24 h-24 text-blue-500/80" />
                  <div className="absolute top-6 right-6 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-sm font-medium">
                    Secured by Solana
                  </div>
                  <div className="absolute left-4 bottom-6 p-3 rounded-lg glassmorphism">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="w-4 h-4 text-yellow-500" />
                      <span className="text-white font-medium">Smart Contract Payment</span>
                    </div>
                    <div className="text-sm text-slate-300">
                      Status: <span className="text-green-400">Confirmed</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      Transaction: sol8x72...3kf9
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-4 -right-4 w-48 h-48 bg-teal-500/20 rounded-full blur-3xl"></div>
              <div className="absolute -top-4 -left-4 w-48 h-48 bg-blue-500/20 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16" id="how-it-works">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-slate-300 max-w-3xl mx-auto">
              Our stablecoin mortgage system leverages the power of Solana blockchain to create a transparent, 
              efficient, and secure mortgage experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card p-8 flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-blue-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Secure Collateralization</h3>
              <p className="text-slate-300">
                Property NFTs serve as collateral, locked in smart contracts until the mortgage is fully paid.
              </p>
            </div>

            <div className="card p-8 flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-teal-600/20 flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-teal-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Automated Payments</h3>
              <p className="text-slate-300">
                Smart contracts automatically handle monthly payments, adjusting interest and principal transparently.
              </p>
            </div>

            <div className="card p-8 flex flex-col items-center text-center hover:translate-y-[-4px] transition-transform duration-300">
              <div className="w-16 h-16 rounded-2xl bg-yellow-600/20 flex items-center justify-center mb-6">
                <Coins className="w-8 h-8 text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold mb-3">Stablecoin Stability</h3>
              <p className="text-slate-300">
                Mortgages backed by USDC stablecoins provide protection against crypto market volatility.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="card p-12 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/30 via-teal-500/20 to-slate-900/30"></div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Transform Your Mortgage Experience?</h2>
              <p className="text-xl text-slate-300 mb-8 max-w-3xl mx-auto">
                Join the future of decentralized finance and secure your property with blockchain technology.
              </p>
              <Link to={connected ? "/dashboard" : "/apply"}>
                <Button variant="primary" size="lg">
                  Get Started Today
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-slate-800">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-slate-400">© 2025 SolMortgage. All rights reserved.</p>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Terms</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy</a>
              <a href="#" className="text-slate-400 hover:text-white transition-colors">Documentation</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;