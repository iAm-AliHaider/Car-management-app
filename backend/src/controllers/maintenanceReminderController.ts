import { Response } from 'express';
import MaintenanceReminder from '../models/MaintenanceReminder';
import Car from '../models/Car';
import { AuthRequest } from '../middleware/auth';

// Get all maintenance reminders for user
export const getMaintenanceReminders = async (req: AuthRequest, res: Response) => {
  try {
    const { carId } = req.query;
    const query: any = { userId: req.user._id };

    if (carId) {
      query.carId = carId;
    }

    const reminders = await MaintenanceReminder.find(query)
      .populate('carId', 'make model year licensePlate')
      .sort({ nextServiceDate: 1, targetMileage: 1 });

    res.json(reminders);
  } catch (error: any) {
    console.error('Get maintenance reminders error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get active/due reminders
export const getDueReminders = async (req: AuthRequest, res: Response) => {
  try {
    const now = new Date();
    const reminders = await MaintenanceReminder.find({
      userId: req.user._id,
      isActive: true,
      $or: [
        { nextServiceDate: { $lte: now } },
        { targetMileage: { $exists: true } }
      ]
    })
      .populate('carId', 'make model year licensePlate mileage')
      .sort({ priority: -1, nextServiceDate: 1 });

    // Filter mileage-based reminders
    const dueReminders = reminders.filter(reminder => {
      if (reminder.reminderType === 'time') {
        return reminder.nextServiceDate && reminder.nextServiceDate <= now;
      }

      const car = reminder.carId as any;
      if (reminder.reminderType === 'mileage' && reminder.targetMileage && car.mileage) {
        return car.mileage >= reminder.targetMileage;
      }

      if (reminder.reminderType === 'both') {
        const timeCheck = reminder.nextServiceDate && reminder.nextServiceDate <= now;
        const mileageCheck = reminder.targetMileage && car.mileage && car.mileage >= reminder.targetMileage;
        return timeCheck || mileageCheck;
      }

      return false;
    });

    res.json(dueReminders);
  } catch (error: any) {
    console.error('Get due reminders error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get reminder by ID
export const getMaintenanceReminderById = async (req: AuthRequest, res: Response) => {
  try {
    const reminder = await MaintenanceReminder.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('carId', 'make model year licensePlate mileage');

    if (!reminder) {
      return res.status(404).json({ message: 'Maintenance reminder not found' });
    }

    res.json(reminder);
  } catch (error: any) {
    console.error('Get maintenance reminder by ID error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Create maintenance reminder
export const createMaintenanceReminder = async (req: AuthRequest, res: Response) => {
  try {
    const {
      carId,
      title,
      description,
      reminderType,
      currentMileage,
      targetMileage,
      lastServiceDate,
      nextServiceDate,
      intervalMonths,
      isRecurring,
      priority
    } = req.body;

    // Verify car belongs to user
    const car = await Car.findOne({ _id: carId, userId: req.user._id });
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const reminder = await MaintenanceReminder.create({
      userId: req.user._id,
      carId,
      title,
      description,
      reminderType,
      currentMileage,
      targetMileage,
      lastServiceDate,
      nextServiceDate,
      intervalMonths,
      isRecurring,
      priority
    });

    const populatedReminder = await MaintenanceReminder.findById(reminder._id)
      .populate('carId', 'make model year licensePlate');

    res.status(201).json(populatedReminder);
  } catch (error: any) {
    console.error('Create maintenance reminder error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update maintenance reminder
export const updateMaintenanceReminder = async (req: AuthRequest, res: Response) => {
  try {
    const reminder = await MaintenanceReminder.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Maintenance reminder not found' });
    }

    const {
      title,
      description,
      reminderType,
      currentMileage,
      targetMileage,
      lastServiceDate,
      nextServiceDate,
      intervalMonths,
      isRecurring,
      isActive,
      notified,
      priority
    } = req.body;

    reminder.title = title || reminder.title;
    reminder.description = description !== undefined ? description : reminder.description;
    reminder.reminderType = reminderType || reminder.reminderType;
    reminder.currentMileage = currentMileage !== undefined ? currentMileage : reminder.currentMileage;
    reminder.targetMileage = targetMileage !== undefined ? targetMileage : reminder.targetMileage;
    reminder.lastServiceDate = lastServiceDate !== undefined ? lastServiceDate : reminder.lastServiceDate;
    reminder.nextServiceDate = nextServiceDate !== undefined ? nextServiceDate : reminder.nextServiceDate;
    reminder.intervalMonths = intervalMonths !== undefined ? intervalMonths : reminder.intervalMonths;
    reminder.isRecurring = isRecurring !== undefined ? isRecurring : reminder.isRecurring;
    reminder.isActive = isActive !== undefined ? isActive : reminder.isActive;
    reminder.notified = notified !== undefined ? notified : reminder.notified;
    reminder.priority = priority || reminder.priority;

    const updatedReminder = await reminder.save();
    const populatedReminder = await MaintenanceReminder.findById(updatedReminder._id)
      .populate('carId', 'make model year licensePlate');

    res.json(populatedReminder);
  } catch (error: any) {
    console.error('Update maintenance reminder error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Delete maintenance reminder
export const deleteMaintenanceReminder = async (req: AuthRequest, res: Response) => {
  try {
    const reminder = await MaintenanceReminder.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Maintenance reminder not found' });
    }

    await reminder.deleteOne();
    res.json({ message: 'Maintenance reminder removed' });
  } catch (error: any) {
    console.error('Delete maintenance reminder error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Complete a reminder and optionally create next one if recurring
export const completeReminder = async (req: AuthRequest, res: Response) => {
  try {
    const reminder = await MaintenanceReminder.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!reminder) {
      return res.status(404).json({ message: 'Maintenance reminder not found' });
    }

    if (reminder.isRecurring && reminder.intervalMonths) {
      // Create next reminder
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + reminder.intervalMonths);

      reminder.lastServiceDate = new Date();
      reminder.nextServiceDate = nextDate;
      reminder.notified = false;

      if (reminder.targetMileage && reminder.currentMileage) {
        const mileageDiff = reminder.targetMileage - reminder.currentMileage;
        const car = await Car.findById(reminder.carId);
        reminder.currentMileage = car?.mileage || 0;
        reminder.targetMileage = (car?.mileage || 0) + mileageDiff;
      }

      await reminder.save();
      res.json({ message: 'Reminder completed and next one scheduled', reminder });
    } else {
      // Mark as inactive
      reminder.isActive = false;
      await reminder.save();
      res.json({ message: 'Reminder completed', reminder });
    }
  } catch (error: any) {
    console.error('Complete reminder error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
