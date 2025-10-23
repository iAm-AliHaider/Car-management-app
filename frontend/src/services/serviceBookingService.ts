import api from './api';
import { ServiceBooking } from '../types';

export const serviceBookingService = {
  async getServiceBookings(): Promise<ServiceBooking[]> {
    const response = await api.get<ServiceBooking[]>('/services');
    return response.data;
  },

  async getServiceBookingById(id: string): Promise<ServiceBooking> {
    const response = await api.get<ServiceBooking>(`/services/${id}`);
    return response.data;
  },

  async createServiceBooking(bookingData: Partial<ServiceBooking>): Promise<ServiceBooking> {
    const response = await api.post<ServiceBooking>('/services', bookingData);
    return response.data;
  },

  async updateServiceBooking(id: string, bookingData: Partial<ServiceBooking>): Promise<ServiceBooking> {
    const response = await api.put<ServiceBooking>(`/services/${id}`, bookingData);
    return response.data;
  },

  async deleteServiceBooking(id: string): Promise<void> {
    await api.delete(`/services/${id}`);
  },
};
