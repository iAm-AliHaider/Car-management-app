import api from './api';
import { AccidentReport, AccidentStatistics } from '../types';

export const accidentReportService = {
  // Get all accident reports
  getAccidentReports: async (): Promise<AccidentReport[]> => {
    const response = await api.get('/accident-reports');
    return response.data;
  },

  // Get accident report by ID
  getAccidentReportById: async (id: string): Promise<AccidentReport> => {
    const response = await api.get(`/accident-reports/${id}`);
    return response.data;
  },

  // Create accident report
  createAccidentReport: async (data: Partial<AccidentReport>): Promise<AccidentReport> => {
    const response = await api.post('/accident-reports', data);
    return response.data;
  },

  // Update accident report
  updateAccidentReport: async (id: string, data: Partial<AccidentReport>): Promise<AccidentReport> => {
    const response = await api.put(`/accident-reports/${id}`, data);
    return response.data;
  },

  // Delete accident report
  deleteAccidentReport: async (id: string): Promise<void> => {
    await api.delete(`/accident-reports/${id}`);
  },

  // Add photo to report
  addPhotoToReport: async (id: string, url: string, description?: string): Promise<AccidentReport> => {
    const response = await api.post(`/accident-reports/${id}/photos`, { url, description });
    return response.data;
  },

  // Add document to report
  addDocumentToReport: async (id: string, title: string, url: string, fileType: string): Promise<AccidentReport> => {
    const response = await api.post(`/accident-reports/${id}/documents`, { title, url, fileType });
    return response.data;
  },

  // Get statistics
  getAccidentStatistics: async (): Promise<AccidentStatistics> => {
    const response = await api.get('/accident-reports/statistics');
    return response.data;
  }
};
