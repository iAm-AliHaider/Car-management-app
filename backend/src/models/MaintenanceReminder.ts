import mongoose, { Document, Schema } from 'mongoose';

export interface IMaintenanceReminder extends Document {
  userId: mongoose.Types.ObjectId;
  carId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  reminderType: 'mileage' | 'time' | 'both';
  currentMileage?: number;
  targetMileage?: number;
  lastServiceDate?: Date;
  nextServiceDate?: Date;
  intervalMonths?: number;
  isRecurring: boolean;
  isActive: boolean;
  notified: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: Date;
  updatedAt: Date;
}

const maintenanceReminderSchema = new Schema<IMaintenanceReminder>({
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
  description: {
    type: String,
    trim: true
  },
  reminderType: {
    type: String,
    enum: ['mileage', 'time', 'both'],
    required: true
  },
  currentMileage: {
    type: Number,
    min: 0
  },
  targetMileage: {
    type: Number,
    min: 0
  },
  lastServiceDate: {
    type: Date
  },
  nextServiceDate: {
    type: Date
  },
  intervalMonths: {
    type: Number,
    min: 1
  },
  isRecurring: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  notified: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
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

maintenanceReminderSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model<IMaintenanceReminder>('MaintenanceReminder', maintenanceReminderSchema);
