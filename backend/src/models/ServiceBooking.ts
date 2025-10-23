import mongoose, { Document, Schema } from 'mongoose';

export interface IServiceBooking extends Document {
  userId: mongoose.Types.ObjectId;
  carId: mongoose.Types.ObjectId;
  serviceType: string;
  description: string;
  scheduledDate: Date;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  serviceProvider?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const serviceBookingSchema = new Schema<IServiceBooking>({
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
  serviceType: {
    type: String,
    required: [true, 'Service type is required'],
    enum: [
      'Oil Change',
      'Tire Rotation',
      'Brake Service',
      'Engine Repair',
      'Transmission Service',
      'Battery Replacement',
      'Air Conditioning',
      'General Maintenance',
      'Inspection',
      'Other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  scheduledDate: {
    type: Date,
    required: [true, 'Scheduled date is required']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'],
    default: 'pending'
  },
  serviceProvider: {
    type: String,
    trim: true
  },
  estimatedCost: {
    type: Number,
    min: 0
  },
  actualCost: {
    type: Number,
    min: 0
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
serviceBookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IServiceBooking>('ServiceBooking', serviceBookingSchema);
