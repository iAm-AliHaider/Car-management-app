import api from './api';
import { Expense, ExpenseStatistics } from '../types';

export const expenseService = {
  async getExpenses(params?: {
    carId?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<Expense[]> {
    const response = await api.get<Expense[]>('/expenses', { params });
    return response.data;
  },

  async getExpenseStatistics(params?: {
    carId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<ExpenseStatistics> {
    const response = await api.get<ExpenseStatistics>('/expenses/statistics', { params });
    return response.data;
  },

  async getExpenseById(id: string): Promise<Expense> {
    const response = await api.get<Expense>(`/expenses/${id}`);
    return response.data;
  },

  async createExpense(expenseData: Partial<Expense>): Promise<Expense> {
    const response = await api.post<Expense>('/expenses', expenseData);
    return response.data;
  },

  async updateExpense(id: string, expenseData: Partial<Expense>): Promise<Expense> {
    const response = await api.put<Expense>(`/expenses/${id}`, expenseData);
    return response.data;
  },

  async deleteExpense(id: string): Promise<void> {
    await api.delete(`/expenses/${id}`);
  },
};
