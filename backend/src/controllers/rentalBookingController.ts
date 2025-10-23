import { Response } from 'express';
import RentalBooking from '../models/RentalBooking';
import CarRental from '../models/CarRental';
import { AuthRequest } from '../middleware/auth';

// Get all rental bookings for user (as renter or owner)
export const getRentalBookings = async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.query; // 'renter' or 'owner'

    let query: any = {};
    if (role === 'renter') {
      query.renterId = req.user._id;
    } else if (role === 'owner') {
      query.ownerId = req.user._id;
    } else {
      // Get all bookings where user is either renter or owner
      query.$or = [
        { renterId: req.user._id },
        { ownerId: req.user._id }
      ];
    }

    const bookings = await RentalBooking.find(query)
      .populate('carId', 'make model year licensePlate color')
      .populate('ownerId', 'name email phone')
      .populate('renterId', 'name email phone')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (error: any) {
    console.error('Get rental bookings error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get rental booking by ID
export const getRentalBookingById = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await RentalBooking.findOne({
      _id: req.params.id,
      $or: [
        { renterId: req.user._id },
        { ownerId: req.user._id }
      ]
    })
      .populate('carId', 'make model year licensePlate color mileage')
      .populate('ownerId', 'name email phone')
      .populate('renterId', 'name email phone')
      .populate('carRentalId');

    if (!booking) {
      return res.status(404).json({ message: 'Rental booking not found' });
    }

    res.json(booking);
  } catch (error: any) {
    console.error('Get rental booking by ID error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Create rental request
export const createRentalRequest = async (req: AuthRequest, res: Response) => {
  try {
    const {
      carRentalId,
      startDate,
      endDate,
      pickupLocation,
      dropoffLocation,
      accessLevel,
      paymentMethod,
      notes
    } = req.body;

    // Get rental listing
    const carRental = await CarRental.findById(carRentalId).populate('carId');
    if (!carRental) {
      return res.status(404).json({ message: 'Rental listing not found' });
    }

    // Check if user is trying to rent their own car
    if (carRental.ownerId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot rent your own car' });
    }

    // Check availability
    if (!carRental.isAvailable || carRental.currentStatus !== 'available') {
      return res.status(400).json({ message: 'Car is not available for rent' });
    }

    // Calculate rental duration and cost
    const start = new Date(startDate);
    const end = new Date(endDate);
    const durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));

    if (durationDays < 1) {
      return res.status(400).json({ message: 'Invalid rental period' });
    }

    // Check minimum and maximum rental periods
    if (carRental.minimumRentalPeriod && durationDays < carRental.minimumRentalPeriod) {
      return res.status(400).json({
        message: `Minimum rental period is ${carRental.minimumRentalPeriod} days`
      });
    }

    if (carRental.maximumRentalPeriod && durationDays > carRental.maximumRentalPeriod) {
      return res.status(400).json({
        message: `Maximum rental period is ${carRental.maximumRentalPeriod} days`
      });
    }

    // Calculate cost based on rental type
    let rentalRate = 0;
    let rentalDuration = durationDays;

    switch (carRental.rentalType) {
      case 'daily':
        rentalRate = carRental.pricePerDay || 0;
        break;
      case 'weekly':
        rentalRate = carRental.pricePerWeek || 0;
        rentalDuration = Math.ceil(durationDays / 7);
        break;
      case 'monthly':
        rentalRate = carRental.pricePerMonth || 0;
        rentalDuration = Math.ceil(durationDays / 30);
        break;
      default:
        rentalRate = carRental.pricePerDay || 0;
    }

    const totalCost = rentalRate * rentalDuration;

    const booking = await RentalBooking.create({
      carRentalId,
      carId: carRental.carId,
      ownerId: carRental.ownerId,
      renterId: req.user._id,
      startDate,
      endDate,
      rentalDuration,
      rentalRate,
      totalCost,
      securityDeposit: carRental.securityDeposit,
      pickupLocation: pickupLocation || carRental.location,
      dropoffLocation,
      accessLevel: accessLevel || 'view-only',
      paymentMethod,
      notes
    });

    const populatedBooking = await RentalBooking.findById(booking._id)
      .populate('carId', 'make model year licensePlate')
      .populate('ownerId', 'name email')
      .populate('renterId', 'name email');

    res.status(201).json(populatedBooking);
  } catch (error: any) {
    console.error('Create rental request error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Approve rental request (owner only)
export const approveRentalRequest = async (req: AuthRequest, res: Response) => {
  try {
    const booking = await RentalBooking.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      status: 'pending'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Rental request not found' });
    }

    booking.status = 'approved';
    await booking.save();

    // Update car rental status
    await CarRental.findByIdAndUpdate(booking.carRentalId, {
      currentStatus: 'rented',
      renterId: booking.renterId
    });

    const populatedBooking = await RentalBooking.findById(booking._id)
      .populate('carId', 'make model year licensePlate')
      .populate('ownerId', 'name email')
      .populate('renterId', 'name email');

    res.json(populatedBooking);
  } catch (error: any) {
    console.error('Approve rental request error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Reject rental request (owner only)
export const rejectRentalRequest = async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;

    const booking = await RentalBooking.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      status: 'pending'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Rental request not found' });
    }

    booking.status = 'rejected';
    booking.cancellationReason = reason;
    booking.cancelledBy = req.user._id;
    await booking.save();

    res.json({ message: 'Rental request rejected', booking });
  } catch (error: any) {
    console.error('Reject rental request error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Start rental (activate)
export const startRental = async (req: AuthRequest, res: Response) => {
  try {
    const { startMileage } = req.body;

    const booking = await RentalBooking.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      status: 'approved'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Rental booking not found' });
    }

    booking.status = 'active';
    booking.startMileage = startMileage;
    await booking.save();

    res.json({ message: 'Rental started', booking });
  } catch (error: any) {
    console.error('Start rental error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Complete rental
export const completeRental = async (req: AuthRequest, res: Response) => {
  try {
    const { endMileage } = req.body;

    const booking = await RentalBooking.findOne({
      _id: req.params.id,
      ownerId: req.user._id,
      status: 'active'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Active rental not found' });
    }

    booking.status = 'completed';
    booking.endMileage = endMileage;
    await booking.save();

    // Update car rental status
    const carRental = await CarRental.findById(booking.carRentalId);
    if (carRental) {
      carRental.currentStatus = 'available';
      carRental.renterId = undefined;
      carRental.totalRentals += 1;
      await carRental.save();
    }

    res.json({ message: 'Rental completed', booking });
  } catch (error: any) {
    console.error('Complete rental error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Cancel rental booking
export const cancelRentalBooking = async (req: AuthRequest, res: Response) => {
  try {
    const { reason } = req.body;

    const booking = await RentalBooking.findOne({
      _id: req.params.id,
      $or: [
        { renterId: req.user._id },
        { ownerId: req.user._id }
      ],
      status: { $in: ['pending', 'approved'] }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Rental booking not found' });
    }

    booking.status = 'cancelled';
    booking.cancellationReason = reason;
    booking.cancelledBy = req.user._id;
    await booking.save();

    // Update car rental status if it was approved
    if (booking.status === 'approved') {
      await CarRental.findByIdAndUpdate(booking.carRentalId, {
        currentStatus: 'available',
        renterId: undefined
      });
    }

    res.json({ message: 'Rental booking cancelled', booking });
  } catch (error: any) {
    console.error('Cancel rental booking error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Add review
export const addReview = async (req: AuthRequest, res: Response) => {
  try {
    const { rating, comment } = req.body;

    const booking = await RentalBooking.findOne({
      _id: req.params.id,
      $or: [
        { renterId: req.user._id },
        { ownerId: req.user._id }
      ],
      status: 'completed'
    });

    if (!booking) {
      return res.status(404).json({ message: 'Completed rental not found' });
    }

    const isRenter = booking.renterId.toString() === req.user._id.toString();

    if (isRenter) {
      booking.reviewByRenter = {
        rating,
        comment,
        date: new Date()
      };
    } else {
      booking.reviewByOwner = {
        rating,
        comment,
        date: new Date()
      };
    }

    await booking.save();

    // Update car rental average rating
    const carRental = await CarRental.findById(booking.carRentalId);
    if (carRental && isRenter) {
      const allBookings = await RentalBooking.find({
        carRentalId: booking.carRentalId,
        'reviewByRenter.rating': { $exists: true }
      });

      const avgRating = allBookings.reduce((sum, b) => sum + (b.reviewByRenter?.rating || 0), 0) / allBookings.length;
      carRental.rating = Math.round(avgRating * 10) / 10;
      await carRental.save();
    }

    res.json({ message: 'Review added successfully', booking });
  } catch (error: any) {
    console.error('Add review error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
