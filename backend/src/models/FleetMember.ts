import mongoose, { Document, Schema } from 'mongoose';

export interface IFleetMember extends Document {
  fleetId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: 'owner' | 'manager' | 'driver' | 'viewer';
  permissions: {
    canManageVehicles: boolean;
    canScheduleServices: boolean;
    canViewExpenses: boolean;
    canManageMembers: boolean;
    canEditFleet: boolean;
  };
  assignedVehicles?: mongoose.Types.ObjectId[];
  status: 'active' | 'inactive' | 'pending';
  joinedAt: Date;
  invitedBy?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const fleetMemberSchema = new Schema<IFleetMember>({
  fleetId: {
    type: Schema.Types.ObjectId,
    ref: 'Fleet',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    enum: ['owner', 'manager', 'driver', 'viewer'],
    default: 'driver'
  },
  permissions: {
    canManageVehicles: {
      type: Boolean,
      default: false
    },
    canScheduleServices: {
      type: Boolean,
      default: false
    },
    canViewExpenses: {
      type: Boolean,
      default: false
    },
    canManageMembers: {
      type: Boolean,
      default: false
    },
    canEditFleet: {
      type: Boolean,
      default: false
    }
  },
  assignedVehicles: [{
    type: Schema.Types.ObjectId,
    ref: 'Car'
  }],
  status: {
    type: String,
    enum: ['active', 'inactive', 'pending'],
    default: 'active'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  invitedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User'
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

// Set default permissions based on role
fleetMemberSchema.pre('save', function(next) {
  this.updatedAt = new Date();

  if (this.isModified('role')) {
    switch (this.role) {
      case 'owner':
        this.permissions = {
          canManageVehicles: true,
          canScheduleServices: true,
          canViewExpenses: true,
          canManageMembers: true,
          canEditFleet: true
        };
        break;
      case 'manager':
        this.permissions = {
          canManageVehicles: true,
          canScheduleServices: true,
          canViewExpenses: true,
          canManageMembers: true,
          canEditFleet: false
        };
        break;
      case 'driver':
        this.permissions = {
          canManageVehicles: false,
          canScheduleServices: true,
          canViewExpenses: false,
          canManageMembers: false,
          canEditFleet: false
        };
        break;
      case 'viewer':
        this.permissions = {
          canManageVehicles: false,
          canScheduleServices: false,
          canViewExpenses: false,
          canManageMembers: false,
          canEditFleet: false
        };
        break;
    }
  }

  next();
});

// Ensure unique user per fleet
fleetMemberSchema.index({ fleetId: 1, userId: 1 }, { unique: true });

export default mongoose.model<IFleetMember>('FleetMember', fleetMemberSchema);
