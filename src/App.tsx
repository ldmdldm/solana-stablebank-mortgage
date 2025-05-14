import React from 'react';
import { ThemeProvider } from './contexts/ThemeContext';
import { MortgageProvider } from './contexts/MortgageContext';
import { WalletProvider } from './contexts/WalletContext';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Pages
import Dashboard from './pages/Dashboard';
import MortgageApplication from './pages/MortgageApplication';
import MortgageDetails from './pages/MortgageDetails';
import WalletPage from './pages/WalletPage';
import LandingPage from './pages/LandingPage';

// Components
import Layout from './components/layout/Layout';

function App() {
  return (
    <ThemeProvider>
      <WalletProvider>
        <MortgageProvider>
          <Router>
            <Layout>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/apply" element={<MortgageApplication />} />
                <Route path="/mortgage/:id" element={<MortgageDetails />} />
                <Route path="/wallet" element={<WalletPage />} />
              </Routes>
            </Layout>
          </Router>
        </MortgageProvider>
      </WalletProvider>
    </ThemeProvider>
  );
}

export default App;