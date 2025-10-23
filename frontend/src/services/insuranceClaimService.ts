import api from './api';
import { InsuranceClaim, ClaimStatistics } from '../types';

export const insuranceClaimService = {
  // Get all insurance claims
  getInsuranceClaims: async (): Promise<InsuranceClaim[]> => {
    const response = await api.get('/insurance-claims');
    return response.data;
  },

  // Get insurance claim by ID
  getInsuranceClaimById: async (id: string): Promise<InsuranceClaim> => {
    const response = await api.get(`/insurance-claims/${id}`);
    return response.data;
  },

  // Create insurance claim
  createInsuranceClaim: async (data: Partial<InsuranceClaim>): Promise<InsuranceClaim> => {
    const response = await api.post('/insurance-claims', data);
    return response.data;
  },

  // Update insurance claim
  updateInsuranceClaim: async (id: string, data: Partial<InsuranceClaim>): Promise<InsuranceClaim> => {
    const response = await api.put(`/insurance-claims/${id}`, data);
    return response.data;
  },

  // Delete insurance claim
  deleteInsuranceClaim: async (id: string): Promise<void> => {
    await api.delete(`/insurance-claims/${id}`);
  },

  // Add communication
  addCommunication: async (id: string, data: {
    date?: string;
    type: string;
    direction: string;
    subject?: string;
    summary: string;
    representative?: string;
  }): Promise<InsuranceClaim> => {
    const response = await api.post(`/insurance-claims/${id}/communications`, data);
    return response.data;
  },

  // Add document
  addDocumentToClaim: async (id: string, data: {
    title: string;
    documentType: string;
    url: string;
    fileSize?: number;
    description?: string;
  }): Promise<InsuranceClaim> => {
    const response = await api.post(`/insurance-claims/${id}/documents`, data);
    return response.data;
  },

  // Add payment
  addPayment: async (id: string, data: {
    date?: string;
    amount: number;
    method: string;
    checkNumber?: string;
    notes?: string;
  }): Promise<InsuranceClaim> => {
    const response = await api.post(`/insurance-claims/${id}/payments`, data);
    return response.data;
  },

  // Get statistics
  getClaimStatistics: async (): Promise<ClaimStatistics> => {
    const response = await api.get('/insurance-claims/statistics');
    return response.data;
  }
};
