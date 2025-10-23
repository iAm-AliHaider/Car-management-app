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
