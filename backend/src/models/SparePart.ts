import mongoose, { Document, Schema } from 'mongoose';

export interface ISparePart extends Document {
  name: string;
  partNumber: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  manufacturer?: string;
  compatibleModels?: string[];
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const sparePartSchema = new Schema<ISparePart>({
  name: {
    type: String,
    required: [true, 'Part name is required'],
    trim: true
  },
  partNumber: {
    type: String,
    required: [true, 'Part number is required'],
    unique: true,
    trim: true,
    uppercase: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: [
      'Engine',
      'Transmission',
      'Brakes',
      'Suspension',
      'Electrical',
      'Body',
      'Interior',
      'Exhaust',
      'Filters',
      'Fluids',
      'Other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: 0
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: 0,
    default: 0
  },
  manufacturer: {
    type: String,
    trim: true
  },
  compatibleModels: [{
    type: String,
    trim: true
  }],
  imageUrl: {
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
sparePartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<ISparePart>('SparePart', sparePartSchema);
