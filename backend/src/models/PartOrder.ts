import mongoose, { Document, Schema } from 'mongoose';

export interface IPartOrderItem {
  partId: mongoose.Types.ObjectId;
  quantity: number;
  priceAtOrder: number;
}

export interface IPartOrder extends Document {
  userId: mongoose.Types.ObjectId;
  carId?: mongoose.Types.ObjectId;
  items: IPartOrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const partOrderItemSchema = new Schema<IPartOrderItem>({
  partId: {
    type: Schema.Types.ObjectId,
    ref: 'SparePart',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtOrder: {
    type: Number,
    required: true,
    min: 0
  }
});

const partOrderSchema = new Schema<IPartOrder>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  carId: {
    type: Schema.Types.ObjectId,
    ref: 'Car'
  },
  items: {
    type: [partOrderItemSchema],
    required: true,
    validate: {
      validator: function(items: IPartOrderItem[]) {
        return items.length > 0;
      },
      message: 'Order must have at least one item'
    }
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    type: String,
    required: [true, 'Shipping address is required'],
    trim: true
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },
  notes: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
partOrderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IPartOrder>('PartOrder', partOrderSchema);
