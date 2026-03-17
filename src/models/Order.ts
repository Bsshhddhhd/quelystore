import mongoose, { Schema, Document } from 'mongoose';

export interface IOrder extends Document {
  orderId: string;
  productId: string;
  productName: string;
  price: number;
  customerEmail: string;
  customerName: string;
  discordUsername: string;
  discordUserId: string;
  paymentMethod: 'stripe' | 'kpay' | 'paypal';
  paymentStatus: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  createdAt: Date;
  completedAt?: Date;
}

const orderSchema = new Schema<IOrder>(
  {
    orderId: { type: String, required: true, unique: true },
    productId: { type: String, required: true },
    productName: { type: String, required: true },
    price: { type: Number, required: true },
    customerEmail: { type: String, required: true },
    customerName: { type: String, required: true },
    discordUsername: { type: String, required: true },
    discordUserId: { type: String, required: true },
    paymentMethod: { type: String, enum: ['stripe', 'kpay', 'paypal'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'completed', 'failed', 'cancelled'], default: 'pending' },
    transactionId: String,
    completedAt: Date,
  },
  { timestamps: true }
);

export default mongoose.models.Order || mongoose.model<IOrder>('Order', orderSchema);
