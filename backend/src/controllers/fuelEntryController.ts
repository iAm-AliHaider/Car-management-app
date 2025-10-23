import { Response } from 'express';
import FuelEntry from '../models/FuelEntry';
import Car from '../models/Car';
import { AuthRequest } from '../middleware/auth';

// Get all fuel entries for user
export const getFuelEntries = async (req: AuthRequest, res: Response) => {
  try {
    const { carId } = req.query;
    const query: any = { userId: req.user._id };

    if (carId) {
      query.carId = carId;
    }

    const entries = await FuelEntry.find(query)
      .populate('carId', 'make model year licensePlate')
      .sort({ date: -1, odometer: -1 });

    res.json(entries);
  } catch (error: any) {
    console.error('Get fuel entries error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get fuel statistics
export const getFuelStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const { carId } = req.query;

    if (!carId) {
      return res.status(400).json({ message: 'Car ID is required' });
    }

    const entries = await FuelEntry.find({
      userId: req.user._id,
      carId,
      isFillUp: true
    }).sort({ odometer: 1 });

    if (entries.length < 2) {
      return res.json({
        averageFuelEconomy: 0,
        totalSpent: 0,
        totalFuel: 0,
        averagePricePerUnit: 0,
        entriesCount: entries.length
      });
    }

    // Calculate fuel economy
    let totalDistance = 0;
    let totalFuel = 0;
    let totalCost = 0;

    for (let i = 1; i < entries.length; i++) {
      const distance = entries[i].odometer - entries[i - 1].odometer;
      if (distance > 0) {
        totalDistance += distance;
        totalFuel += entries[i].quantity;
        totalCost += entries[i].totalCost;
      }
    }

    const averageFuelEconomy = totalDistance > 0 ? totalDistance / totalFuel : 0;
    const averagePricePerUnit = totalFuel > 0 ? totalCost / totalFuel : 0;

    res.json({
      averageFuelEconomy: parseFloat(averageFuelEconomy.toFixed(2)),
      totalSpent: parseFloat(totalCost.toFixed(2)),
      totalFuel: parseFloat(totalFuel.toFixed(2)),
      averagePricePerUnit: parseFloat(averagePricePerUnit.toFixed(2)),
      entriesCount: entries.length
    });
  } catch (error: any) {
    console.error('Get fuel statistics error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get fuel entry by ID
export const getFuelEntryById = async (req: AuthRequest, res: Response) => {
  try {
    const entry = await FuelEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('carId', 'make model year licensePlate');

    if (!entry) {
      return res.status(404).json({ message: 'Fuel entry not found' });
    }

    res.json(entry);
  } catch (error: any) {
    console.error('Get fuel entry by ID error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Create fuel entry
export const createFuelEntry = async (req: AuthRequest, res: Response) => {
  try {
    const {
      carId,
      date,
      odometer,
      quantity,
      pricePerUnit,
      fuelType,
      station,
      isFillUp,
      notes
    } = req.body;

    // Verify car belongs to user
    const car = await Car.findOne({ _id: carId, userId: req.user._id });
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Update car mileage if higher
    if (odometer > (car.mileage || 0)) {
      car.mileage = odometer;
      await car.save();
    }

    const entry = await FuelEntry.create({
      userId: req.user._id,
      carId,
      date: date || new Date(),
      odometer,
      quantity,
      pricePerUnit,
      totalCost: quantity * pricePerUnit,
      fuelType,
      station,
      isFillUp,
      notes
    });

    const populatedEntry = await FuelEntry.findById(entry._id)
      .populate('carId', 'make model year licensePlate');

    res.status(201).json(populatedEntry);
  } catch (error: any) {
    console.error('Create fuel entry error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update fuel entry
export const updateFuelEntry = async (req: AuthRequest, res: Response) => {
  try {
    const entry = await FuelEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Fuel entry not found' });
    }

    const {
      date,
      odometer,
      quantity,
      pricePerUnit,
      fuelType,
      station,
      isFillUp,
      notes
    } = req.body;

    entry.date = date || entry.date;
    entry.odometer = odometer || entry.odometer;
    entry.quantity = quantity || entry.quantity;
    entry.pricePerUnit = pricePerUnit || entry.pricePerUnit;
    entry.fuelType = fuelType || entry.fuelType;
    entry.station = station !== undefined ? station : entry.station;
    entry.isFillUp = isFillUp !== undefined ? isFillUp : entry.isFillUp;
    entry.notes = notes !== undefined ? notes : entry.notes;

    const updatedEntry = await entry.save();
    const populatedEntry = await FuelEntry.findById(updatedEntry._id)
      .populate('carId', 'make model year licensePlate');

    res.json(populatedEntry);
  } catch (error: any) {
    console.error('Update fuel entry error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Delete fuel entry
export const deleteFuelEntry = async (req: AuthRequest, res: Response) => {
  try {
    const entry = await FuelEntry.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!entry) {
      return res.status(404).json({ message: 'Fuel entry not found' });
    }

    await entry.deleteOne();
    res.json({ message: 'Fuel entry removed' });
  } catch (error: any) {
    console.error('Delete fuel entry error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
