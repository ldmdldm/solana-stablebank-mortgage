import mongoose, { Document, Schema } from 'mongoose';

export interface UserDocument extends Document {
  walletAddress: string;
  balance: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<UserDocument>({
  walletAddress: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  balance: {
    type: Number,
    default: 0
  },
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

export default mongoose.model<UserDocument>('User', UserSchema);

