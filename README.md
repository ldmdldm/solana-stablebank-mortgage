# StableBank - Blockchain-Based Mortgage Platform

StableBank is a decentralized finance (DeFi) application built on the Solana blockchain that enables users to apply for property-backed loans using stablecoins. The platform provides a modern, secure, and efficient way to manage mortgages with blockchain technology.

![StableBank Platform](https://placeholder-for-stablebank-screenshot.com/screenshot.png)

## Features

- **Blockchain-Backed Mortgages**: Create and manage mortgages backed by Solana blockchain
- **Property Tokenization**: Convert property assets into NFTs as collateral
- **Smart Contract Automation**: Automatic payment processing and loan management
- **Wallet Integration**: Connect with Phantom or Solflare wallets
- **Amortization Schedule**: View complete payment schedules for loans
- **Transaction History**: Track all mortgage-related transactions
- **Loan Management**: Apply for loans, make payments, and track loan status

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **State Management**: React Context API
- **Styling**: Tailwind CSS
- **Routing**: React Router
- **Blockchain Integration**: 
  - `@solana/web3.js` for Solana blockchain interaction
  - `@solana/wallet-adapter` for wallet connections
  - `@coral-xyz/anchor` for smart contract integration

### Backend
- **Framework**: Node.js with Express
- **Language**: TypeScript
- **Database**: MongoDB (via Mongoose)
- **Authentication**: Solana wallet signature verification
- **Blockchain Integration**:
  - `@solana/web3.js` for Solana RPC calls
  - `@coral-xyz/anchor` for smart contract interaction
  - `@solana/spl-token` for token management

### Blockchain
- **Network**: Solana (Devnet for testing, Mainnet for production)
- **Smart Contracts**: Rust-based Solana programs
- **Token Standard**: SPL Token for stablecoin integration

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v16 or newer)
- npm (v8 or newer)
- MongoDB (v5 or newer)
- Rust and Solana CLI tools (for smart contract development)
- Git

## Installation and Setup

### Clone the Repository

```bash
git clone https://github.com/yourusername/stablebank.git
cd stablebank
```

### Backend Setup

1. Navigate to the backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file based on the provided example:

```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
   - MongoDB connection string
   - Solana RPC URL (Devnet by default)
   - JWT secret key
   - Solana wallet private key (for backend operations)

5. Start the MongoDB service (if not already running):

```bash
# MacOS with Homebrew
brew services start mongodb-community

# Ubuntu
sudo systemctl start mongodb
```

6. Initialize the database:

```bash
npm run db:setup
```

7. Start the backend server:

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm run build
npm start
```

The backend server will start on http://localhost:5000 by default.

### Frontend Setup

1. Navigate to the frontend directory (from the project root):

```bash
cd ..  # if you're in the backend directory
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file for frontend configuration:

```bash
cp .env.example .env.local
```

4. Update the environment variables as needed:
   - `VITE_API_URL` - Backend API URL (default: http://localhost:5000/api)
   - `VITE_SOLANA_NETWORK` - Solana network to connect to (default: devnet)

5. Start the development server:

```bash
npm run dev
```

The frontend development server will start on http://localhost:5173 by default.

## Development Workflow

### Backend Development

1. Make changes to controllers, models, routes, or services
2. Test changes using Postman or similar API testing tool
3. Update tests as needed in the `tests` directory
4. Run tests: `npm test`
5. Commit changes with descriptive commit messages

### Frontend Development

1. Create or modify components in the `src/components` directory
2. Update context providers in `src/contexts` as needed
3. Test changes in the browser
4. Run linting: `npm run lint`
5. Commit changes

### Smart Contract Development

1. Navigate to the `src/programs/stablecoin-mortgage` directory
2. Make changes to the Rust source code
3. Build the program: `cargo build-bpf`
4. Test using Solana test validator: `solana-test-validator`
5. Deploy to Devnet for testing

## Configuration Options

### Backend Configuration

The backend can be configured through the `.env` file with the following options:

```
# Server Configuration
PORT=5000
NODE_ENV=development|production

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/stablebank

# JWT Secret
JWT_SECRET=your_jwt_secret_key_here

# Solana Configuration
SOLANA_RPC_URL=https://api.devnet.solana.com
SOLANA_PRIVATE_KEY=your_solana_private_key_here
PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

### Frontend Configuration

Frontend configuration is managed through environment variables:

```
# API Configuration
VITE_API_URL=http://localhost:5000/api

# Solana Configuration
VITE_SOLANA_NETWORK=devnet
VITE_PROGRAM_ID=Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS
```

## Deployment

### Backend Deployment

1. Prepare your environment:
   ```bash
   npm run build
   ```

2. Deploy to your chosen hosting provider:
   - **Heroku**: `heroku create` and `git push heroku main`
   - **DigitalOcean**: Deploy using App Platform
   - **AWS**: Deploy using Elastic Beanstalk or EC2
   - **Docker**: Use the provided Dockerfile: `docker build -t stablebank-backend .`

3. Set up environment variables on your hosting provider

### Frontend Deployment

1. Build the production version:
   ```bash
   npm run build
   ```

2. Deploy the contents of the `dist` directory:
   - **Netlify**: Connect repository and configure build settings
   - **Vercel**: Deploy using the Vercel CLI or connect repository
   - **Firebase**: Deploy using Firebase Hosting
   - **AWS S3/CloudFront**: Upload files to S3 and configure CloudFront

### Smart Contract Deployment

1. Build the program:
   ```bash
   cargo build-bpf
   ```

2. Deploy to Solana network:
   ```bash
   # For devnet
   solana program deploy --program-id <KEYPAIR_PATH> target/deploy/stablecoin_mortgage.so
   
   # For mainnet (requires SOL for fees)
   solana program deploy --program-id <KEYPAIR_PATH> target/deploy/stablecoin_mortgage.so --url mainnet-beta
   ```

## Architecture Overview

StableBank follows a modern architecture pattern:

### Backend Architecture

```
backend/
├── src/
│   ├── controllers/      # Request handlers
│   ├── middleware/       # Express middleware
│   ├── models/           # MongoDB schemas and models
│   ├── routes/           # API route definitions
│   ├── services/         # Business logic and services
│   ├── utils/            # Utility functions
│   └── server.ts         # Main application entry
├── tests/                # Test files
└── dist/                 # Compiled output
```

### Frontend Architecture

```
frontend/
├── public/               # Static assets
├── src/
│   ├── components/       # React components
│   │   ├── layout/       # Layout components
│   │   └── ui/           # UI components
│   ├── contexts/         # React context providers
│   ├── pages/            # Page components
│   ├── services/         # API services
│   ├── programs/         # Solana program interfaces
│   └── utils/            # Utility functions
└── dist/                 # Production build
```

### Data Flow

1. **User Interaction**: User interacts with the frontend UI
2. **Frontend Processing**: React components update state via context providers
3. **API Requests**: Frontend makes API calls to the backend
4. **Backend Processing**: Express routes direct requests to controllers
5. **Blockchain Interaction**: Backend interacts with Solana using web3.js
6. **Data Storage**: Data is stored in MongoDB and on the Solana blockchain
7. **Response**: Data flows back to the frontend for display

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, please open an issue or contact the team at support@stablebank.com.

