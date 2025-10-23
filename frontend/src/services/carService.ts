import api from './api';
import { Car } from '../types';

export const carService = {
  async getCars(): Promise<Car[]> {
    const response = await api.get<Car[]>('/cars');
    return response.data;
  },

  async getCarById(id: string): Promise<Car> {
    const response = await api.get<Car>(`/cars/${id}`);
    return response.data;
  },

  async createCar(carData: Partial<Car>): Promise<Car> {
    const response = await api.post<Car>('/cars', carData);
    return response.data;
  },

  async updateCar(id: string, carData: Partial<Car>): Promise<Car> {
    const response = await api.put<Car>(`/cars/${id}`, carData);
    return response.data;
  },

  async deleteCar(id: string): Promise<void> {
    await api.delete(`/cars/${id}`);
  },
};
