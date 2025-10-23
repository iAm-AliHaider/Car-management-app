export interface User {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  token?: string;
}

export interface Car {
  _id: string;
  userId: string;
  make: string;
  model: string;
  year: number;
  licensePlate: string;
  vin?: string;
  color?: string;
  mileage?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceBooking {
  _id: string;
  userId: string;
  carId: Car | string;
  serviceType: string;
  description: string;
  scheduledDate: string;
  status: 'pending' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  serviceProvider?: string;
  estimatedCost?: number;
  actualCost?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SparePart {
  _id: string;
  name: string;
  partNumber: string;
  category: string;
  description: string;
  price: number;
  stock: number;
  manufacturer?: string;
  compatibleModels?: string[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PartOrderItem {
  partId: SparePart | string;
  quantity: number;
  priceAtOrder: number;
}

export interface PartOrder {
  _id: string;
  userId: string;
  carId?: Car | string;
  items: PartOrderItem[];
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  paymentMethod?: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface MaintenanceReminder {
  _id: string;
  userId: string;
  carId: Car | string;
  title: string;
  description?: string;
  reminderType: 'mileage' | 'time' | 'both';
  currentMileage?: number;
  targetMileage?: number;
  lastServiceDate?: string;
  nextServiceDate?: string;
  intervalMonths?: number;
  isRecurring: boolean;
  isActive: boolean;
  notified: boolean;
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  updatedAt: string;
}

export interface FuelEntry {
  _id: string;
  userId: string;
  carId: Car | string;
  date: string;
  odometer: number;
  quantity: number;
  pricePerUnit: number;
  totalCost: number;
  fuelType: string;
  station?: string;
  isFillUp: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FuelStatistics {
  averageFuelEconomy: number;
  totalSpent: number;
  totalFuel: number;
  averagePricePerUnit: number;
  entriesCount: number;
}

export interface Expense {
  _id: string;
  userId: string;
  carId: Car | string;
  date: string;
  category: string;
  description: string;
  amount: number;
  odometer?: number;
  vendor?: string;
  paymentMethod?: string;
  isRecurring: boolean;
  receiptUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExpenseStatistics {
  totalAmount: number;
  expenseCount: number;
  categoryBreakdown: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  averageExpense: number;
}

export interface Document {
  _id: string;
  userId: string;
  carId: Car | string;
  title: string;
  documentType: string;
  description?: string;
  documentNumber?: string;
  issueDate?: string;
  expiryDate?: string;
  fileUrl?: string;
  fileName?: string;
  fileSize?: number;
  reminderEnabled: boolean;
  reminderDays?: number;
  tags?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CarRental {
  _id: string;
  carId: Car | string;
  ownerId: User | string;
  renterId?: User | string;
  isAvailable: boolean;
  rentalType: 'hourly' | 'daily' | 'weekly' | 'monthly';
  pricePerHour?: number;
  pricePerDay?: number;
  pricePerWeek?: number;
  pricePerMonth?: number;
  location: string;
  availableFrom?: string;
  availableUntil?: string;
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
  createdAt: string;
  updatedAt: string;
}

export interface RentalBooking {
  _id: string;
  carRentalId: string;
  carId: Car | string;
  ownerId: User | string;
  renterId: User | string;
  startDate: string;
  endDate: string;
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
  cancelledBy?: string;
  cancellationReason?: string;
  reviewByRenter?: {
    rating: number;
    comment?: string;
    date: string;
  };
  reviewByOwner?: {
    rating: number;
    comment?: string;
    date: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Fleet {
  _id: string;
  name: string;
  description?: string;
  ownerId: User | string;
  vehicles: (Car | string)[];
  members: (FleetMember | string)[];
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
  createdAt: string;
  updatedAt: string;
}

export interface FleetMember {
  _id: string;
  fleetId: Fleet | string;
  userId: User | string;
  role: 'owner' | 'manager' | 'driver' | 'viewer';
  permissions: {
    canManageVehicles: boolean;
    canScheduleServices: boolean;
    canViewExpenses: boolean;
    canManageMembers: boolean;
    canEditFleet: boolean;
  };
  assignedVehicles?: (Car | string)[];
  status: 'active' | 'inactive' | 'pending';
  joinedAt: string;
  invitedBy?: User | string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FleetAnalytics {
  overview: {
    totalVehicles: number;
    activeVehicles: number;
    totalMembers: number;
    activeMembers: number;
  };
  vehicleStats: {
    totalMileage: number;
    averageMileage: number;
    totalValue: number;
    averageAge: number;
  };
  expenseStats: {
    totalExpenses: number;
    averageExpensePerVehicle: number;
    expensesByCategory: Array<{
      category: string;
      amount: number;
      percentage: number;
    }>;
  };
  serviceStats: {
    totalServices: number;
    completedServices: number;
    pendingServices: number;
    upcomingServices: number;
  };
  performanceMetrics: {
    averageFuelEconomy: number;
    totalFuelCost: number;
    costPerMile: number;
    utilizationRate: number;
  };
}

export interface AccidentReport {
  _id: string;
  userId: string;
  carId: Car | string;
  accidentDate: string;
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
  otherPartiesInvolved: Array<{
    name: string;
    contactNumber?: string;
    email?: string;
    vehicleInfo?: string;
    licensePlate?: string;
    insuranceCompany?: string;
    insurancePolicyNumber?: string;
  }>;
  policeReportFiled: boolean;
  policeReportNumber?: string;
  policeDepartment?: string;
  officerName?: string;
  officerBadgeNumber?: string;
  witnesses: Array<{
    name: string;
    contactNumber?: string;
    email?: string;
    statement?: string;
  }>;
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
  photos: Array<{
    url: string;
    description?: string;
    uploadedAt: string;
  }>;
  documents: Array<{
    title: string;
    url: string;
    fileType: string;
    uploadedAt: string;
  }>;
  insuranceNotified: boolean;
  insuranceNotificationDate?: string;
  insuranceClaimId?: string;
  status: 'draft' | 'submitted' | 'under-review' | 'closed';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InsuranceClaim {
  _id: string;
  userId: string;
  carId: Car | string;
  accidentReportId?: AccidentReport | string;
  claimNumber?: string;
  claimType: 'collision' | 'comprehensive' | 'liability' | 'uninsured-motorist' | 'personal-injury' | 'other';
  incidentDate: string;
  claimAmount?: number;
  approvedAmount?: number;
  deductible?: number;
  insuranceCompany: string;
  policyNumber: string;
  policyHolderName: string;
  agentName?: string;
  agentContactNumber?: string;
  agentEmail?: string;
  description: string;
  damageDescription: string;
  claimReason: string;
  status: 'draft' | 'submitted' | 'under-review' | 'additional-info-required' | 'approved' | 'partially-approved' | 'denied' | 'closed' | 'withdrawn';
  submittedDate?: string;
  reviewStartDate?: string;
  decisionDate?: string;
  communications: Array<{
    date: string;
    type: 'email' | 'phone' | 'in-person' | 'letter' | 'portal';
    direction: 'incoming' | 'outgoing';
    subject?: string;
    summary: string;
    representative?: string;
  }>;
  documents: Array<{
    title: string;
    documentType: 'police-report' | 'estimate' | 'invoice' | 'photo' | 'medical-record' | 'correspondence' | 'other';
    url: string;
    fileSize?: number;
    uploadedAt: string;
    description?: string;
  }>;
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
  paymentStatus: 'pending' | 'partial' | 'completed' | 'not-applicable';
  payments: Array<{
    date: string;
    amount: number;
    method: string;
    checkNumber?: string;
    notes?: string;
  }>;
  totalPaid?: number;
  atFault?: boolean;
  faultPercentage?: number;
  denialReason?: string;
  appealFiled?: boolean;
  appealDate?: string;
  appealOutcome?: string;
  notes?: string;
  internalNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AccidentStatistics {
  totalReports: number;
  bySeverity: {
    minor: number;
    moderate: number;
    severe: number;
    totalLoss: number;
  };
  byStatus: {
    draft: number;
    submitted: number;
    underReview: number;
    closed: number;
  };
  withPoliceReport: number;
  withInsuranceClaim: number;
  totalEstimatedDamage: number;
  withInjuries: number;
}

export interface ClaimStatistics {
  totalClaims: number;
  byType: {
    collision: number;
    comprehensive: number;
    liability: number;
    uninsuredMotorist: number;
    personalInjury: number;
    other: number;
  };
  byStatus: {
    draft: number;
    submitted: number;
    underReview: number;
    approved: number;
    partiallyApproved: number;
    denied: number;
    closed: number;
    withdrawn: number;
  };
  byPaymentStatus: {
    pending: number;
    partial: number;
    completed: number;
    notApplicable: number;
  };
  financials: {
    totalClaimAmount: number;
    totalApprovedAmount: number;
    totalPaid: number;
    totalDeductibles: number;
    averageClaimAmount: number;
  };
  appeals: {
    totalAppeals: number;
    pendingAppeals: number;
  };
}
