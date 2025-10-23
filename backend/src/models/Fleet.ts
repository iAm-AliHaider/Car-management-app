import mongoose, { Document, Schema } from 'mongoose';

export interface IFleet extends Document {
  name: string;
  description?: string;
  ownerId: mongoose.Types.ObjectId;
  vehicles: mongoose.Types.ObjectId[];
  members: mongoose.Types.ObjectId[];
  fleetType: 'personal' | 'business' | 'rental' | 'delivery' | 'taxi' | 'other';
  totalVehicles: number;
  activeVehicles: number;
  tags?: string[];
  settings: {
    allowMemberAddVehicles: boolean;
    requireApprovalForServices: boolean;
    sharedExpenses: boolean;
    notifications: boolean;
  };
  statistics: {
    totalMileage: number;
    totalExpenses: number;
    totalServices: number;
    averageMileagePerVehicle: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const fleetSchema = new Schema<IFleet>({
  name: {
    type: String,
    required: [true, 'Fleet name is required'],
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  ownerId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicles: [{
    type: Schema.Types.ObjectId,
    ref: 'Car'
  }],
  members: [{
    type: Schema.Types.ObjectId,
    ref: 'FleetMember'
  }],
  fleetType: {
    type: String,
    enum: ['personal', 'business', 'rental', 'delivery', 'taxi', 'other'],
    default: 'personal'
  },
  totalVehicles: {
    type: Number,
    default: 0,
    min: 0
  },
  activeVehicles: {
    type: Number,
    default: 0,
    min: 0
  },
  tags: [{
    type: String,
    trim: true
  }],
  settings: {
    allowMemberAddVehicles: {
      type: Boolean,
      default: false
    },
    requireApprovalForServices: {
      type: Boolean,
      default: true
    },
    sharedExpenses: {
      type: Boolean,
      default: false
    },
    notifications: {
      type: Boolean,
      default: true
    }
  },
  statistics: {
    totalMileage: {
      type: Number,
      default: 0,
      min: 0
    },
    totalExpenses: {
      type: Number,
      default: 0,
      min: 0
    },
    totalServices: {
      type: Number,
      default: 0,
      min: 0
    },
    averageMileagePerVehicle: {
      type: Number,
      default: 0,
      min: 0
    }
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

fleetSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  this.totalVehicles = this.vehicles.length;
  next();
});

export default mongoose.model<IFleet>('Fleet', fleetSchema);
