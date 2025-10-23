import mongoose, { Document, Schema } from 'mongoose';

export interface ICarRental extends Document {
  carId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  renterId?: mongoose.Types.ObjectId;
  isAvailable: boolean;
  rentalType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  pricePerHour?: number;
  pricePerDay?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  location: string;
  availableFrom?: Date;
  availableUntil?: Date;
  minimumRentalPeriod?: number;
  maximumRentalPeriod?: number;
  termsAndConditions?: string;
  features?: string[];
  insurance: boolean;
  securityDeposit?: number;
  mileageLimit?: number;
  currentStatus: 'available' | 'rented' | 'maintenance' | 'unavailable';
  totalRentals: number;
  rating?: number;
  createdAt: Date;
  updatedAt: Date;
}

const carRentalSchema = new Schema<ICarRental>({
  carId: {
    type: Schema.Types.ObjectId,
    ref: 'Car',
    required: true,
    unique: true
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  renterId: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  rentalType: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'monthly'],
    default: 'daily'
  },
  pricePerHour: {
    type: Number,
    min: 0
  },
  pricePerDay: {
    type: Number,
    min: 0
  },
  pricePerWeek: {
    type: Number,
    min: 0
  },
  pricePerMonth: {
    type: Number,
    min: 0
  },
  location: {
    type: String,
    required: [true, 'Location is required'],
    trim: true
  },
  availableFrom: {
    type: Date
  },
  availableUntil: {
    type: Date
  },
  minimumRentalPeriod: {
    type: Number,
    min: 1
  },
  maximumRentalPeriod: {
    type: Number,
    min: 1
  },
  termsAndConditions: {
    type: String,
    trim: true
  },
  features: [{
    type: String,
    trim: true
  }],
  insurance: {
    type: Boolean,
    default: false
  },
  securityDeposit: {
    type: Number,
    min: 0
  },
  mileageLimit: {
    type: Number,
    min: 0
  },
  currentStatus: {
    type: String,
    enum: ['available', 'rented', 'maintenance', 'unavailable'],
    default: 'available'
  },
  totalRentals: {
    type: Number,
    default: 0,
    min: 0
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
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

carRentalSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ICarRental>('CarRental', carRentalSchema);
