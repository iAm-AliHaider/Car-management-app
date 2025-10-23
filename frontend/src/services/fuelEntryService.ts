import api from './api';
import { FuelEntry, FuelStatistics } from '../types';

export const fuelEntryService = {
  async getFuelEntries(carId?: string): Promise<FuelEntry[]> {
    const params = carId ? { carId } : {};
    const response = await api.get<FuelEntry[]>('/fuel', { params });
    return response.data;
  },

  async getFuelStatistics(carId: string): Promise<FuelStatistics> {
    const response = await api.get<FuelStatistics>('/fuel/statistics', { params: { carId } });
    return response.data;
  },

  async getFuelEntryById(id: string): Promise<FuelEntry> {
    const response = await api.get<FuelEntry>(`/fuel/${id}`);
    return response.data;
  },

  async createFuelEntry(entryData: Partial<FuelEntry>): Promise<FuelEntry> {
    const response = await api.post<FuelEntry>('/fuel', entryData);
    return response.data;
  },

  async updateFuelEntry(id: string, entryData: Partial<FuelEntry>): Promise<FuelEntry> {
    const response = await api.put<FuelEntry>(`/fuel/${id}`, entryData);
    return response.data;
  },

  async deleteFuelEntry(id: string): Promise<void> {
    await api.delete(`/fuel/${id}`);
  },
};
