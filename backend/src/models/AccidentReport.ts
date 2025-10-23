import mongoose, { Document, Schema } from 'mongoose';

export interface IAccidentReport extends Document {
  userId: mongoose.Types.ObjectId;
  carId: mongoose.Types.ObjectId;
  accidentDate: Date;
  accidentTime?: string;
  location: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  severity: 'minor' | 'moderate' | 'severe' | 'total-loss';
  description: string;
  weatherConditions?: string;
  roadConditions?: string;

  // Parties Involved
  otherPartiesInvolved: Array<{
    name: string;
    contactNumber?: string;
    email?: string;
    vehicleInfo?: string;
    licensePlate?: string;
    insuranceCompany?: string;
    insurancePolicyNumber?: string;
  }>;

  // Police Report
  policeReportFiled: boolean;
  policeReportNumber?: string;
  policeDepartment?: string;
  officerName?: string;
  officerBadgeNumber?: string;

  // Witnesses
  witnesses: Array<{
    name: string;
    contactNumber?: string;
    email?: string;
    statement?: string;
  }>;

  // Damage Assessment
  vehicleDamage: {
    description: string;
    estimatedCost?: number;
    damagedParts: string[];
    vehicleDrivable: boolean;
  };

  injuries: Array<{
    personName: string;
    injuryDescription: string;
    medicalAttentionRequired: boolean;
    hospitalName?: string;
  }>;

  // Documentation
  photos: Array<{
    url: string;
    description?: string;
    uploadedAt: Date;
  }>;

  documents: Array<{
    title: string;
    url: string;
    fileType: string;
    uploadedAt: Date;
  }>;

  // Insurance
  insuranceNotified: boolean;
  insuranceNotificationDate?: Date;
  insuranceClaimId?: mongoose.Types.ObjectId;

  // Status
  status: 'draft' | 'submitted' | 'under-review' | 'closed';
  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const AccidentReportSchema = new Schema<IAccidentReport>(
  {
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
    accidentDate: {
      type: Date,
      required: true
    },
    accidentTime: String,
    location: {
      type: String,
      required: true
    },
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    severity: {
      type: String,
      enum: ['minor', 'moderate', 'severe', 'total-loss'],
      required: true
    },
    description: {
      type: String,
      required: true
    },
    weatherConditions: String,
    roadConditions: String,
    otherPartiesInvolved: [
      {
        name: { type: String, required: true },
        contactNumber: String,
        email: String,
        vehicleInfo: String,
        licensePlate: String,
        insuranceCompany: String,
        insurancePolicyNumber: String
      }
    ],
    policeReportFiled: {
      type: Boolean,
      default: false
    },
    policeReportNumber: String,
    policeDepartment: String,
    officerName: String,
    officerBadgeNumber: String,
    witnesses: [
      {
        name: { type: String, required: true },
        contactNumber: String,
        email: String,
        statement: String
      }
    ],
    vehicleDamage: {
      description: { type: String, required: true },
      estimatedCost: Number,
      damagedParts: [String],
      vehicleDrivable: { type: Boolean, default: false }
    },
    injuries: [
      {
        personName: { type: String, required: true },
        injuryDescription: { type: String, required: true },
        medicalAttentionRequired: { type: Boolean, default: false },
        hospitalName: String
      }
    ],
    photos: [
      {
        url: { type: String, required: true },
        description: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    documents: [
      {
        title: { type: String, required: true },
        url: { type: String, required: true },
        fileType: String,
        uploadedAt: { type: Date, default: Date.now }
      }
    ],
    insuranceNotified: {
      type: Boolean,
      default: false
    },
    insuranceNotificationDate: Date,
    insuranceClaimId: {
      type: Schema.Types.ObjectId,
      ref: 'InsuranceClaim'
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under-review', 'closed'],
      default: 'draft'
    },
    notes: String
  },
  {
    timestamps: true
  }
);

// Indexes
AccidentReportSchema.index({ userId: 1, accidentDate: -1 });
AccidentReportSchema.index({ carId: 1 });
AccidentReportSchema.index({ status: 1 });

export default mongoose.model<IAccidentReport>('AccidentReport', AccidentReportSchema);
