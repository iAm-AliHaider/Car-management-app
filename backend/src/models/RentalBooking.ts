import mongoose, { Document, Schema } from 'mongoose';

export interface IRentalBooking extends Document {
  carRentalId: mongoose.Types.ObjectId;
  carId: mongoose.Types.ObjectId;
  ownerId: mongoose.Types.ObjectId;
  renterId: mongoose.Types.ObjectId;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'approved' | 'active' | 'completed' | 'cancelled' | 'rejected';
  rentalDuration: number;
  rentalRate: number;
  totalCost: number;
  securityDeposit?: number;
  pickupLocation: string;
  dropoffLocation?: string;
  startMileage?: number;
  endMileage?: number;
  accessLevel: 'view-only' | 'full-access';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentMethod?: string;
  cancelledBy?: mongoose.Types.ObjectId;
  cancellationReason?: string;
  reviewByRenter?: {
    rating: number;
    comment?: string;
    date: Date;
  };
  reviewByOwner?: {
    rating: number;
    comment?: string;
    date: Date;
  };
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const rentalBookingSchema = new Schema<IRentalBooking>({
  carRentalId: {
    type: Schema.Types.ObjectId,
    ref: 'CarRental',
    required: true
  },
  carId: {
    type: Schema.Types.ObjectId,
    ref: 'Car',
    required: true
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  renterId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: [true, 'Start date is required']
  },
  endDate: {
    type: Date,
    required: [true, 'End date is required']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'active', 'completed', 'cancelled', 'rejected'],
    default: 'pending'
  },
  rentalDuration: {
    type: Number,
    required: true,
    min: 1
  },
  rentalRate: {
    type: Number,
    required: true,
    min: 0
  },
  totalCost: {
    type: Number,
    required: true,
    min: 0
  },
  securityDeposit: {
    type: Number,
    min: 0
  },
  pickupLocation: {
    type: String,
    required: [true, 'Pickup location is required'],
    trim: true
  },
  dropoffLocation: {
    type: String,
    trim: true
  },
  startMileage: {
    type: Number,
    min: 0
  },
  endMileage: {
    type: Number,
    min: 0
  },
  accessLevel: {
    type: String,
    enum: ['view-only', 'full-access'],
    default: 'view-only'
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    trim: true
  },
  cancelledBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  cancellationReason: {
    type: String,
    trim: true
  },
  reviewByRenter: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    date: {
      type: Date
    }
  },
  reviewByOwner: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      trim: true
    },
    date: {
      type: Date
    }
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

rentalBookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Validate end date is after start date
rentalBookingSchema.pre('save', function(next) {
  if (this.endDate <= this.startDate) {
    next(new Error('End date must be after start date'));
  }
  next();
});

export default mongoose.model<IRentalBooking>('RentalBooking', rentalBookingSchema);
