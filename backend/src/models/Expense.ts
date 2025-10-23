import mongoose, { Document, Schema } from 'mongoose';

export interface IExpense extends Document {
  userId: mongoose.Types.ObjectId;
  carId: mongoose.Types.ObjectId;
  date: Date;
  category: string;
  description: string;
  amount: number;
  odometer?: number;
  vendor?: string;
  paymentMethod?: string;
  isRecurring: boolean;
  receiptUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  carId: {
    type: Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Date is required'],
    default: Date.now
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Fuel',
      'Maintenance',
      'Repair',
      'Insurance',
      'Registration',
      'Parking',
      'Tolls',
      'Car Wash',
      'Tires',
      'Accessories',
      'Loan Payment',
      'Other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: 0
  },
  odometer: {
    type: Number,
    min: 0
  },
  vendor: {
    type: String,
    trim: true
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  receiptUrl: {
    type: String,
    trim: true
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

expenseSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IExpense>('Expense', expenseSchema);
