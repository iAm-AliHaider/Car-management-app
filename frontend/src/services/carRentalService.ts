import api from './api';
import { CarRental } from '../types';

export const carRentalService = {
  async getAvailableRentals(params?: {
    location?: string;
    minPrice?: number;
    maxPrice?: number;
    rentalType?: string;
  }): Promise<CarRental[]> {
    const response = await api.get<CarRental[]>('/rentals', { params });
    return response.data;
  },

  async getMyListings(): Promise<CarRental[]> {
    const response = await api.get<CarRental[]>('/rentals/my-listings');
    return response.data;
  },

  async getRentalById(id: string): Promise<CarRental> {
    const response = await api.get<CarRental>(`/rentals/${id}`);
    return response.data;
  },

  async createListing(rentalData: Partial<CarRental>): Promise<CarRental> {
    const response = await api.post<CarRental>('/rentals', rentalData);
    return response.data;
  },

  async updateListing(id: string, rentalData: Partial<CarRental>): Promise<CarRental> {
    const response = await api.put<CarRental>(`/rentals/${id}`, rentalData);
    return response.data;
  },

  async deleteListing(id: string): Promise<void> {
    await api.delete(`/rentals/${id}`);
  },
};
