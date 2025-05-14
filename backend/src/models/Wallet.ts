import mongoose, { Document, Schema } from 'mongoose';

export interface Transaction extends Document {
  date: Date;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'payment' | 'receipt';
  description: string;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string; // Solana transaction ID
  relatedEntityId?: string; // Reference to mortgage or other entity
}

export interface WalletDocument extends Document {
  address: string;
  balance: number;
  isVerified: boolean;
  transactions: Transaction[];
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<Transaction>({
  date: { type: Date, required: true, default: Date.now },
  amount: { type: Number, required: true },
  type: { 
    type: String, 
    enum: ['deposit', 'withdrawal', 'payment', 'receipt'], 
    required: true 
  },
  description: { type: String, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'failed'], 
    required: true,
    default: 'pending'
  },
  transactionId: { type: String },
  relatedEntityId: { type: String }
}, { timestamps: true });

const WalletSchema = new Schema<WalletDocument>({
  address: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  balance: {
    type: Number,
    default: 0,
    min: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  transactions: [TransactionSchema]
}, {
  timestamps: true
});

// Add a virtual property to get total deposits
WalletSchema.virtual('totalDeposits').get(function(this: WalletDocument) {
  return this.transactions
    .filter(tx => tx.type === 'deposit' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);
});

// Add a virtual property to get total withdrawals
WalletSchema.virtual('totalWithdrawals').get(function(this: WalletDocument) {
  return this.transactions
    .filter(tx => tx.type === 'withdrawal' && tx.status === 'completed')
    .reduce((sum, tx) => sum + tx.amount, 0);
});

// Method to check if wallet has sufficient funds
WalletSchema.methods.hasSufficientFunds = function(amount: number): boolean {
  return this.balance >= amount;
};

export default mongoose.model<WalletDocument>('Wallet', WalletSchema);

