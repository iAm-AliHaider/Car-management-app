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
