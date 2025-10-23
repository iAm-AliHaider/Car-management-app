import mongoose, { Document, Schema } from 'mongoose';

export interface ICar extends Document {
  userId: mongoose.Types.ObjectId;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  color?: string;
  mileage?: number;
  createdAt: Date;
  updatedAt: Date;
}

const carSchema = new Schema<ICar>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  make: {
    type: String,
    required: [true, 'Car make is required'],
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Car model is required'],
    trim: true
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: 1900,
    max: new Date().getFullYear() + 1
  },
  licensePlate: {
    type: String,
    required: [true, 'License plate is required'],
    trim: true,
    uppercase: true
  },
  vin: {
    type: String,
    trim: true,
    uppercase: true
  },
  color: {
    type: String,
    trim: true
  },
  mileage: {
    type: Number,
    min: 0
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
carSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ICar>('Car', carSchema);
