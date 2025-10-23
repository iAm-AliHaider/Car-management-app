import api from './api';
import { RentalBooking } from '../types';

export const rentalBookingService = {
  async getRentalBookings(role?: 'renter' | 'owner'): Promise<RentalBooking[]> {
    const params = role ? { role } : {};
    const response = await api.get<RentalBooking[]>('/rental-bookings', { params });
    return response.data;
  },

  async getRentalBookingById(id: string): Promise<RentalBooking> {
    const response = await api.get<RentalBooking>(`/rental-bookings/${id}`);
    return response.data;
  },

  async createRentalRequest(bookingData: Partial<RentalBooking>): Promise<RentalBooking> {
    const response = await api.post<RentalBooking>('/rental-bookings', bookingData);
    return response.data;
  },

  async approveRequest(id: string): Promise<RentalBooking> {
    const response = await api.put<RentalBooking>(`/rental-bookings/${id}/approve`);
    return response.data;
  },

  async rejectRequest(id: string, reason: string): Promise<any> {
    const response = await api.put(`/rental-bookings/${id}/reject`, { reason });
    return response.data;
  },

  async startRental(id: string, startMileage: number): Promise<any> {
    const response = await api.put(`/rental-bookings/${id}/start`, { startMileage });
    return response.data;
  },

  async completeRental(id: string, endMileage: number): Promise<any> {
    const response = await api.put(`/rental-bookings/${id}/complete`, { endMileage });
    return response.data;
  },

  async cancelBooking(id: string, reason: string): Promise<any> {
    const response = await api.put(`/rental-bookings/${id}/cancel`, { reason });
    return response.data;
  },

  async addReview(id: string, rating: number, comment?: string): Promise<any> {
    const response = await api.post(`/rental-bookings/${id}/review`, { rating, comment });
    return response.data;
  },
};
