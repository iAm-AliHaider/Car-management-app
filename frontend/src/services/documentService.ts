import api from './api';
import { Document } from '../types';

export const documentService = {
  async getDocuments(params?: {
    carId?: string;
    documentType?: string;
  }): Promise<Document[]> {
    const response = await api.get<Document[]>('/documents', { params });
    return response.data;
  },

  async getExpiringDocuments(days?: number): Promise<Document[]> {
    const params = days ? { days } : {};
    const response = await api.get<Document[]>('/documents/expiring', { params });
    return response.data;
  },

  async getDocumentById(id: string): Promise<Document> {
    const response = await api.get<Document>(`/documents/${id}`);
    return response.data;
  },

  async createDocument(documentData: Partial<Document>): Promise<Document> {
    const response = await api.post<Document>('/documents', documentData);
    return response.data;
  },

  async updateDocument(id: string, documentData: Partial<Document>): Promise<Document> {
    const response = await api.put<Document>(`/documents/${id}`, documentData);
    return response.data;
  },

  async deleteDocument(id: string): Promise<void> {
    await api.delete(`/documents/${id}`);
  },
};
