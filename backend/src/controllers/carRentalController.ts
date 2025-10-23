import { Response } from 'express';
import CarRental from '../models/CarRental';
import Car from '../models/Car';
import { AuthRequest } from '../middleware/auth';

// Get all available cars for rent (marketplace)
export const getAvailableRentals = async (req: AuthRequest, res: Response) => {
  try {
    const { location, minPrice, maxPrice, rentalType } = req.query;
    const query: any = {
      isAvailable: true,
      currentStatus: 'available',
      ownerId: { $ne: req.user._id } // Exclude user's own cars
    };

    if (location) {
      query.location = { $regex: location, $options: 'i' };
    }

    if (rentalType) {
      query.rentalType = rentalType;
    }

    const rentals = await CarRental.find(query)
      .populate('carId', 'make model year licensePlate color mileage')
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 });

    // Filter by price if specified
    let filteredRentals = rentals;
    if (minPrice || maxPrice) {
      filteredRentals = rentals.filter(rental => {
        const price = rental.pricePerDay || rental.pricePerHour || rental.pricePerWeek || rental.pricePerMonth || 0;
        if (minPrice && price < Number(minPrice)) return false;
        if (maxPrice && price > Number(maxPrice)) return false;
        return true;
      });
    }

    res.json(filteredRentals);
  } catch (error: any) {
    console.error('Get available rentals error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get user's cars available for rent
export const getMyRentals = async (req: AuthRequest, res: Response) => {
  try {
    const rentals = await CarRental.find({ ownerId: req.user._id })
      .populate('carId', 'make model year licensePlate color mileage')
      .sort({ createdAt: -1 });

    res.json(rentals);
  } catch (error: any) {
    console.error('Get my rentals error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get rental by ID
export const getRentalById = async (req: AuthRequest, res: Response) => {
  try {
    const rental = await CarRental.findById(req.params.id)
      .populate('carId', 'make model year licensePlate color mileage vin')
      .populate('ownerId', 'name email phone');

    if (!rental) {
      return res.status(404).json({ message: 'Rental listing not found' });
    }

    res.json(rental);
  } catch (error: any) {
    console.error('Get rental by ID error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Create rental listing (list car for rent)
export const createRentalListing = async (req: AuthRequest, res: Response) => {
  try {
    const {
      carId,
      rentalType,
      pricePerHour,
      pricePerDay,
      pricePerWeek,
      pricePerMonth,
      location,
      availableFrom,
      availableUntil,
      minimumRentalPeriod,
      maximumRentalPeriod,
      termsAndConditions,
      features,
      insurance,
      securityDeposit,
      mileageLimit
    } = req.body;

    // Verify car belongs to user
    const car = await Car.findOne({ _id: carId, userId: req.user._id });
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Check if car is already listed
    const existingRental = await CarRental.findOne({ carId });
    if (existingRental) {
      return res.status(400).json({ message: 'Car is already listed for rent' });
    }

    const rental = await CarRental.create({
      carId,
      ownerId: req.user._id,
      rentalType,
      pricePerHour,
      pricePerDay,
      pricePerWeek,
      pricePerMonth,
      location,
      availableFrom,
      availableUntil,
      minimumRentalPeriod,
      maximumRentalPeriod,
      termsAndConditions,
      features,
      insurance,
      securityDeposit,
      mileageLimit
    });

    const populatedRental = await CarRental.findById(rental._id)
      .populate('carId', 'make model year licensePlate color mileage');

    res.status(201).json(populatedRental);
  } catch (error: any) {
    console.error('Create rental listing error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update rental listing
export const updateRentalListing = async (req: AuthRequest, res: Response) => {
  try {
    const rental = await CarRental.findOne({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!rental) {
      return res.status(404).json({ message: 'Rental listing not found' });
    }

    const {
      isAvailable,
      rentalType,
      pricePerHour,
      pricePerDay,
      pricePerWeek,
      pricePerMonth,
      location,
      availableFrom,
      availableUntil,
      minimumRentalPeriod,
      maximumRentalPeriod,
      termsAndConditions,
      features,
      insurance,
      securityDeposit,
      mileageLimit,
      currentStatus
    } = req.body;

    rental.isAvailable = isAvailable !== undefined ? isAvailable : rental.isAvailable;
    rental.rentalType = rentalType || rental.rentalType;
    rental.pricePerHour = pricePerHour !== undefined ? pricePerHour : rental.pricePerHour;
    rental.pricePerDay = pricePerDay !== undefined ? pricePerDay : rental.pricePerDay;
    rental.pricePerWeek = pricePerWeek !== undefined ? pricePerWeek : rental.pricePerWeek;
    rental.pricePerMonth = pricePerMonth !== undefined ? pricePerMonth : rental.pricePerMonth;
    rental.location = location || rental.location;
    rental.availableFrom = availableFrom !== undefined ? availableFrom : rental.availableFrom;
    rental.availableUntil = availableUntil !== undefined ? availableUntil : rental.availableUntil;
    rental.minimumRentalPeriod = minimumRentalPeriod !== undefined ? minimumRentalPeriod : rental.minimumRentalPeriod;
    rental.maximumRentalPeriod = maximumRentalPeriod !== undefined ? maximumRentalPeriod : rental.maximumRentalPeriod;
    rental.termsAndConditions = termsAndConditions !== undefined ? termsAndConditions : rental.termsAndConditions;
    rental.features = features || rental.features;
    rental.insurance = insurance !== undefined ? insurance : rental.insurance;
    rental.securityDeposit = securityDeposit !== undefined ? securityDeposit : rental.securityDeposit;
    rental.mileageLimit = mileageLimit !== undefined ? mileageLimit : rental.mileageLimit;
    rental.currentStatus = currentStatus || rental.currentStatus;

    const updatedRental = await rental.save();
    const populatedRental = await CarRental.findById(updatedRental._id)
      .populate('carId', 'make model year licensePlate color mileage');

    res.json(populatedRental);
  } catch (error: any) {
    console.error('Update rental listing error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Delete rental listing
export const deleteRentalListing = async (req: AuthRequest, res: Response) => {
  try {
    const rental = await CarRental.findOne({
      _id: req.params.id,
      ownerId: req.user._id
    });

    if (!rental) {
      return res.status(404).json({ message: 'Rental listing not found' });
    }

    // Check if there are active bookings
    if (rental.currentStatus === 'rented') {
      return res.status(400).json({ message: 'Cannot delete listing with active rentals' });
    }

    await rental.deleteOne();
    res.json({ message: 'Rental listing removed' });
  } catch (error: any) {
    console.error('Delete rental listing error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
