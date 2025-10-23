import api from './api';
import { SparePart } from '../types';

export const sparePartService = {
  async getSpareParts(params?: { category?: string; search?: string }): Promise<SparePart[]> {
    const response = await api.get<SparePart[]>('/parts', { params });
    return response.data;
  },

  async getSparePartById(id: string): Promise<SparePart> {
    const response = await api.get<SparePart>(`/parts/${id}`);
    return response.data;
  },

  async createSparePart(partData: Partial<SparePart>): Promise<SparePart> {
    const response = await api.post<SparePart>('/parts', partData);
    return response.data;
  },

  async updateSparePart(id: string, partData: Partial<SparePart>): Promise<SparePart> {
    const response = await api.put<SparePart>(`/parts/${id}`, partData);
    return response.data;
  },

  async deleteSparePart(id: string): Promise<void> {
    await api.delete(`/parts/${id}`);
  },
};
