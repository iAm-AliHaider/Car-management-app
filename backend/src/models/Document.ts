import mongoose, { Document, Schema } from 'mongoose';

export interface IDocument extends Document {
  userId: mongoose.Types.ObjectId;
  carId: mongoose.Types.ObjectId;
  title: string;
  documentType: string;
  description?: string;
  documentNumber?: string;
  issueDate?: Date;
  expiryDate?: Date;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  reminderEnabled: boolean;
  reminderDays?: number;
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>({
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
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  documentType: {
    type: String,
    required: [true, 'Document type is required'],
    enum: [
      'Insurance',
      'Registration',
      'Inspection',
      'Warranty',
      'Purchase Agreement',
      'Service Record',
      'Receipt',
      'Manual',
      'Other'
    ]
  },
  description: {
    type: String,
    trim: true
  },
  documentNumber: {
    type: String,
    trim: true
  },
  issueDate: {
    type: Date
  },
  expiryDate: {
    type: Date
  },
  fileUrl: {
    type: String,
    trim: true
  },
  fileName: {
    type: String,
    trim: true
  },
  fileSize: {
    type: Number
  },
  reminderEnabled: {
    type: Boolean,
    default: false
  },
  reminderDays: {
    type: Number,
    min: 1
  },
  tags: [{
    type: String,
    trim: true
  }],
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

documentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IDocument>('Document', documentSchema);
