import { Response } from 'express';
import ServiceBooking from '../models/ServiceBooking';
import Car from '../models/Car';
import { AuthRequest } from '../middleware/auth';

// Get all service bookings for user
export const getServiceBookings = async (req: AuthRequest, res: Response) => {
  try {
    const bookings = await ServiceBooking.find({ userId: req.user._id })
      .populate('carId', 'make model year licensePlate')
      .sort({ scheduledDate: -1 });

    res.json(bookings);
  } catch (error: any) {
    console.error('Get service bookings error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get service booking by ID
export const getServiceBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await ServiceBooking.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('carId', 'make model year licensePlate');

    if (!booking) {
      return res.status(404).json({ message: 'Service booking not found' });
    }

    res.json(booking);
  } catch (error: any) {
    console.error('Get service booking by ID error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Create service booking
export const createServiceBooking = async (req: AuthRequest, res: Response) => {
  try {
    const {
      carId,
      serviceType,
      description,
      scheduledDate,
      serviceProvider,
      estimatedCost,
      notes
    } = req.body;

    // Verify car belongs to user
    const car = await Car.findOne({ _id: carId, userId: req.user._id });
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const booking = await ServiceBooking.create({
      userId: req.user._id,
      carId,
      serviceType,
      description,
      scheduledDate,
      serviceProvider,
      estimatedCost,
      notes
    });

    const populatedBooking = await ServiceBooking.findById(booking._id)
      .populate('carId', 'make model year licensePlate');

    res.status(201).json(populatedBooking);
  } catch (error: any) {
    console.error('Create service booking error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update service booking
export const updateServiceBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await ServiceBooking.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Service booking not found' });
    }

    const {
      serviceType,
      description,
      scheduledDate,
      status,
      serviceProvider,
      estimatedCost,
      actualCost,
      notes
    } = req.body;

    booking.serviceType = serviceType || booking.serviceType;
    booking.description = description || booking.description;
    booking.scheduledDate = scheduledDate || booking.scheduledDate;
    booking.status = status || booking.status;
    booking.serviceProvider = serviceProvider || booking.serviceProvider;
    booking.estimatedCost = estimatedCost !== undefined ? estimatedCost : booking.estimatedCost;
    booking.actualCost = actualCost !== undefined ? actualCost : booking.actualCost;
    booking.notes = notes !== undefined ? notes : booking.notes;

    const updatedBooking = await booking.save();
    const populatedBooking = await ServiceBooking.findById(updatedBooking._id)
      .populate('carId', 'make model year licensePlate');

    res.json(populatedBooking);
  } catch (error: any) {
    console.error('Update service booking error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Delete/Cancel service booking
export const deleteServiceBooking = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await ServiceBooking.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!booking) {
      return res.status(404).json({ message: 'Service booking not found' });
    }

    await booking.deleteOne();
    res.json({ message: 'Service booking removed' });
  } catch (error: any) {
    console.error('Delete service booking error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
