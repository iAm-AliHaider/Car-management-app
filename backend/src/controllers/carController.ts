import { Response } from 'express';
import Car from '../models/Car';
import { AuthRequest } from '../middleware/auth';

// Get all user cars
export const getCars = async (req: AuthRequest, res: Response) => {
  try {
    const cars = await Car.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(cars);
  } catch (error: any) {
    console.error('Get cars error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get car by ID
export const getCarById = async (req: AuthRequest, res: Response) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user._id });

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    res.json(car);
  } catch (error: any) {
    console.error('Get car by ID error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Create car
export const createCar = async (req: AuthRequest, res: Response) => {
  try {
    const { make, model, year, licensePlate, vin, color, mileage } = req.body;

    const car = await Car.create({
      userId: req.user._id,
      make,
      model,
      year,
      licensePlate,
      vin,
      color,
      mileage
    });

    res.status(201).json(car);
  } catch (error: any) {
    console.error('Create car error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update car
export const updateCar = async (req: AuthRequest, res: Response) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user._id });

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const { make, model, year, licensePlate, vin, color, mileage } = req.body;

    car.make = make || car.make;
    car.model = model || car.model;
    car.year = year || car.year;
    car.licensePlate = licensePlate || car.licensePlate;
    car.vin = vin || car.vin;
    car.color = color || car.color;
    car.mileage = mileage !== undefined ? mileage : car.mileage;

    const updatedCar = await car.save();
    res.json(updatedCar);
  } catch (error: any) {
    console.error('Update car error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Delete car
export const deleteCar = async (req: AuthRequest, res: Response) => {
  try {
    const car = await Car.findOne({ _id: req.params.id, userId: req.user._id });

    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    await car.deleteOne();
    res.json({ message: 'Car removed' });
  } catch (error: any) {
    console.error('Delete car error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
