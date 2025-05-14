import mongoose, { Document, Schema } from 'mongoose';

export interface PaymentDocument extends Document {
  date: Date;
  amount: number;
  status: 'pending' | 'completed' | 'missed';
  principal: number;
  interest: number;
  transactionId?: string;
}

export interface MortgageDocument extends Document {
  borrowerWallet: string;
  propertyValue: number;
  loanAmount: number;
  interestRate: number;
  termYears: number;
  monthlyPayment: number;
  propertyAddress: string;
  startDate: Date;
  status: 'pending' | 'approved' | 'active' | 'defaulted' | 'completed';
  nextPaymentDate: Date;
  remainingPayments: number;
  collateralizationRatio: number;
  paymentHistory: PaymentDocument[];
  onChainMortgageId?: string;
  propertyNft?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<PaymentDocument>({
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  status: { 
    type: String, 
    enum: ['pending', 'completed', 'missed'], 
    required: true 
  },
  principal: { type: Number, required: true },
  interest: { type: Number, required: true },
  transactionId: { type: String } // Solana transaction ID
}, { _id: true });

const MortgageSchema = new Schema<MortgageDocument>({
  borrowerWallet: { 
    type: String, 
    required: true,
    index: true
  },
  propertyValue: { 
    type: Number, 
    required: true 
  },
  loanAmount: { 
    type: Number, 
    required: true 
  },
  interestRate: { 
    type: Number, 
    required: true 
  },
  termYears: { 
    type: Number, 
    required: true 
  },
  monthlyPayment: { 
    type: Number, 
    required: true 
  },
  propertyAddress: { 
    type: String, 
    required: true 
  },
  startDate: { 
    type: Date, 
    default: Date.now 
  },
  status: { 
    type: String, 
    enum: ['pending', 'approved', 'active', 'defaulted', 'completed'], 
    default: 'pending' 
  },
  nextPaymentDate: { 
    type: Date,
    required: true 
  },
  remainingPayments: { 
    type: Number, 
    required: true 
  },
  collateralizationRatio: { 
    type: Number, 
    required: true 
  },
  paymentHistory: [PaymentSchema],
  onChainMortgageId: { 
    type: String 
  },
  propertyNft: { 
    type: String 
  }
}, {
  timestamps: true
});

export default mongoose.model<MortgageDocument>('Mortgage', MortgageSchema);

