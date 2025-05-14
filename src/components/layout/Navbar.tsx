import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useWallet } from '../../contexts/WalletContext';
import { Menu, X, Wallet as WalletIcon } from 'lucide-react';

const Navbar: React.FC = () => {
  const { connected, balance, address, connectWallet, disconnectWallet } = useWallet();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  return (
    <header className="sticky top-0 z-50 glassmorphism shadow-lg bg-slate-900/80 backdrop-blur-lg border-b border-slate-800">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <WalletIcon className="h-8 w-8 text-blue-500" />
              <span className="ml-2 text-xl font-bold bg-gradient-to-r from-blue-500 to-teal-400 bg-clip-text text-transparent">
                SolMortgage
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            {!isLandingPage && (
              <>
                <Link
                  to="/dashboard"
                  className="text-slate-300 hover:text-white transition-colors px-3 py-2"
                >
                  Dashboard
                </Link>
                <Link
                  to="/apply"
                  className="text-slate-300 hover:text-white transition-colors px-3 py-2"
                >
                  Apply
                </Link>
                <Link
                  to="/wallet"
                  className="text-slate-300 hover:text-white transition-colors px-3 py-2"
                >
                  Wallet
                </Link>
              </>
            )}

            {connected ? (
              <div className="flex items-center gap-4">
                <div className="text-sm px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
                  <span className="text-teal-400 font-medium">{balance.toLocaleString()}</span> USDC
                </div>
                <div className="text-xs px-3 py-1 rounded-full bg-blue-900/30 border border-blue-800/50">
                  {address}
                </div>
                <button
                  onClick={disconnectWallet}
                  className="text-sm px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={connectWallet}
                className="btn-primary py-2 flex items-center gap-2"
              >
                <WalletIcon className="h-4 w-4" />
                Connect Wallet
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            {connected && (
              <div className="mr-4 text-sm px-2 py-1 rounded-full bg-slate-800 border border-slate-700">
                <span className="text-teal-400 font-medium">{balance.toLocaleString()}</span>
              </div>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {!isLandingPage && (
              <>
                <Link
                  to="/dashboard"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <Link
                  to="/apply"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Apply
                </Link>
                <Link
                  to="/wallet"
                  className="block px-3 py-2 rounded-md text-base font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Wallet
                </Link>
              </>
            )}
            {connected ? (
              <>
                <div className="px-3 py-2 text-sm">
                  <div className="mb-1">Connected: <span className="text-blue-400">{address}</span></div>
                </div>
                <button
                  onClick={() => {
                    disconnectWallet();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:text-red-300 hover:bg-slate-800 transition"
                >
                  Disconnect Wallet
                </button>
              </>
            ) : (
              <button
                onClick={() => {
                  connectWallet();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-blue-400 hover:text-blue-300 hover:bg-slate-800 transition"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;