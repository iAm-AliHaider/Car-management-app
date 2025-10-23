import mongoose, { Document, Schema } from 'mongoose';

export interface IFuelEntry extends Document {
  userId: mongoose.Types.ObjectId;
  carId: mongoose.Types.ObjectId;
  date: Date;
  odometer: number;
  quantity: number;
  pricePerUnit: number;
  totalCost: number;
  fuelType: string;
  station?: string;
  isFillUp: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const fuelEntrySchema = new Schema<IFuelEntry>({
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
  odometer: {
    type: Number,
    required: [true, 'Odometer reading is required'],
    min: 0
  },
  quantity: {
    type: Number,
    required: [true, 'Fuel quantity is required'],
    min: 0
  },
  pricePerUnit: {
    type: Number,
    required: [true, 'Price per unit is required'],
    min: 0
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  fuelType: {
    type: String,
    required: true,
    enum: ['Regular', 'Mid-Grade', 'Premium', 'Diesel', 'Electric', 'Hybrid'],
    default: 'Regular'
  },
  station: {
    type: String,
    trim: true
  },
  isFillUp: {
    type: Boolean,
    default: true
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

fuelEntrySchema.pre('save', function(next) {
  this.totalCost = this.quantity * this.pricePerUnit;
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IFuelEntry>('FuelEntry', fuelEntrySchema);
