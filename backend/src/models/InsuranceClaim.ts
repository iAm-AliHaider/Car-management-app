import mongoose, { Document, Schema } from 'mongoose';

export interface IInsuranceClaim extends Document {
  userId: mongoose.Types.ObjectId;
  carId: mongoose.Types.ObjectId;
  accidentReportId?: mongoose.Types.ObjectId;

  // Claim Information
  claimNumber?: string;
  claimType: 'collision' | 'comprehensive' | 'liability' | 'uninsured-motorist' | 'personal-injury' | 'other';
  incidentDate: Date;
  claimAmount?: number;
  approvedAmount?: number;
  deductible?: number;

  // Insurance Company Information
  insuranceCompany: string;
  policyNumber: string;
  policyHolderName: string;
  agentName?: string;
  agentContactNumber?: string;
  agentEmail?: string;

  // Claim Details
  description: string;
  damageDescription: string;
  claimReason: string;

  // Status Tracking
  status: 'draft' | 'submitted' | 'under-review' | 'additional-info-required' | 'approved' | 'partially-approved' | 'denied' | 'closed' | 'withdrawn';
  submittedDate?: Date;
  reviewStartDate?: Date;
  decisionDate?: Date;

  // Communication History
  communications: Array<{
    date: Date;
    type: 'email' | 'phone' | 'in-person' | 'letter' | 'portal';
    direction: 'incoming' | 'outgoing';
    subject?: string;
    summary: string;
    representative?: string;
  }>;

  // Documents
  documents: Array<{
    title: string;
    documentType: 'police-report' | 'estimate' | 'invoice' | 'photo' | 'medical-record' | 'correspondence' | 'other';
    url: string;
    fileSize?: number;
    uploadedAt: Date;
    description?: string;
  }>;

  // Repair Information
  repairShop?: {
    name: string;
    address?: string;
    contactNumber?: string;
    estimateAmount?: number;
    actualAmount?: number;
  };

  rentalCarInfo?: {
    provided: boolean;
    company?: string;
    dailyRate?: number;
    daysAuthorized?: number;
    totalCost?: number;
  };

  // Payment Information
  paymentStatus: 'pending' | 'partial' | 'completed' | 'not-applicable';
  payments: Array<{
    date: Date;
    amount: number;
    method: string;
    checkNumber?: string;
    notes?: string;
  }>;

  totalPaid?: number;

  // Additional Information
  atFault?: boolean;
  faultPercentage?: number;
  denialReason?: string;
  appealFiled?: boolean;
  appealDate?: Date;
  appealOutcome?: string;

  notes?: string;
  internalNotes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const InsuranceClaimSchema = new Schema<IInsuranceClaim>(
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
    accidentReportId: {
      type: Schema.Types.ObjectId,
      ref: 'AccidentReport'
    },
    claimNumber: String,
    claimType: {
      type: String,
      enum: ['collision', 'comprehensive', 'liability', 'uninsured-motorist', 'personal-injury', 'other'],
      required: true
    },
    incidentDate: {
      type: Date,
      required: true
    },
    claimAmount: Number,
    approvedAmount: Number,
    deductible: Number,
    insuranceCompany: {
      type: String,
      required: true
    },
    policyNumber: {
      type: String,
      required: true
    },
    policyHolderName: {
      type: String,
      required: true
    },
    agentName: String,
    agentContactNumber: String,
    agentEmail: String,
    description: {
      type: String,
      required: true
    },
    damageDescription: {
      type: String,
      required: true
    },
    claimReason: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['draft', 'submitted', 'under-review', 'additional-info-required', 'approved', 'partially-approved', 'denied', 'closed', 'withdrawn'],
      default: 'draft'
    },
    submittedDate: Date,
    reviewStartDate: Date,
    decisionDate: Date,
    communications: [
      {
        date: { type: Date, required: true },
        type: {
          type: String,
          enum: ['email', 'phone', 'in-person', 'letter', 'portal'],
          required: true
        },
        direction: {
          type: String,
          enum: ['incoming', 'outgoing'],
          required: true
        },
        subject: String,
        summary: { type: String, required: true },
        representative: String
      }
    ],
    documents: [
      {
        title: { type: String, required: true },
        documentType: {
          type: String,
          enum: ['police-report', 'estimate', 'invoice', 'photo', 'medical-record', 'correspondence', 'other'],
          required: true
        },
        url: { type: String, required: true },
        fileSize: Number,
        uploadedAt: { type: Date, default: Date.now },
        description: String
      }
    ],
    repairShop: {
      name: String,
      address: String,
      contactNumber: String,
      estimateAmount: Number,
      actualAmount: Number
    },
    rentalCarInfo: {
      provided: { type: Boolean, default: false },
      company: String,
      dailyRate: Number,
      daysAuthorized: Number,
      totalCost: Number
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'partial', 'completed', 'not-applicable'],
      default: 'pending'
    },
    payments: [
      {
        date: { type: Date, required: true },
        amount: { type: Number, required: true },
        method: { type: String, required: true },
        checkNumber: String,
        notes: String
      }
    ],
    totalPaid: Number,
    atFault: Boolean,
    faultPercentage: Number,
    denialReason: String,
    appealFiled: {
      type: Boolean,
      default: false
    },
    appealDate: Date,
    appealOutcome: String,
    notes: String,
    internalNotes: String
  },
  {
    timestamps: true
  }
);

// Pre-save middleware to calculate total paid
InsuranceClaimSchema.pre('save', function (next) {
  if (this.payments && this.payments.length > 0) {
    this.totalPaid = this.payments.reduce((sum, payment) => sum + payment.amount, 0);
  } else {
    this.totalPaid = 0;
  }
  next();
});

// Indexes
InsuranceClaimSchema.index({ userId: 1, incidentDate: -1 });
InsuranceClaimSchema.index({ carId: 1 });
InsuranceClaimSchema.index({ status: 1 });
InsuranceClaimSchema.index({ claimNumber: 1 });

export default mongoose.model<IInsuranceClaim>('InsuranceClaim', InsuranceClaimSchema);
