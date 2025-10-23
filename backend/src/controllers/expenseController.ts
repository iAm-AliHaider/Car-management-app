import { Response } from 'express';
import Expense from '../models/Expense';
import Car from '../models/Car';
import { AuthRequest } from '../middleware/auth';

// Get all expenses for user
export const getExpenses = async (req: AuthRequest, res: Response) => {
  try {
    const { carId, category, startDate, endDate } = req.query;
    const query: any = { userId: req.user._id };

    if (carId) {
      query.carId = carId;
    }

    if (category) {
      query.category = category;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate as string);
      }
    }

    const expenses = await Expense.find(query)
      .populate('carId', 'make model year licensePlate')
      .sort({ date: -1 });

    res.json(expenses);
  } catch (error: any) {
    console.error('Get expenses error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get expense statistics
export const getExpenseStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const { carId, startDate, endDate } = req.query;
    const query: any = { userId: req.user._id };

    if (carId) {
      query.carId = carId;
    }

    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate as string);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate as string);
      }
    }

    const expenses = await Expense.find(query);

    // Calculate totals by category
    const categoryTotals: { [key: string]: number } = {};
    let totalAmount = 0;

    expenses.forEach(expense => {
      totalAmount += expense.amount;
      if (!categoryTotals[expense.category]) {
        categoryTotals[expense.category] = 0;
      }
      categoryTotals[expense.category] += expense.amount;
    });

    // Convert to array for easier display
    const categoryBreakdown = Object.entries(categoryTotals).map(([category, amount]) => ({
      category,
      amount: parseFloat(amount.toFixed(2)),
      percentage: totalAmount > 0 ? parseFloat(((amount / totalAmount) * 100).toFixed(2)) : 0
    }));

    res.json({
      totalAmount: parseFloat(totalAmount.toFixed(2)),
      expenseCount: expenses.length,
      categoryBreakdown,
      averageExpense: expenses.length > 0 ? parseFloat((totalAmount / expenses.length).toFixed(2)) : 0
    });
  } catch (error: any) {
    console.error('Get expense statistics error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get expense by ID
export const getExpenseById = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('carId', 'make model year licensePlate');

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json(expense);
  } catch (error: any) {
    console.error('Get expense by ID error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Create expense
export const createExpense = async (req: AuthRequest, res: Response) => {
  try {
    const {
      carId,
      date,
      category,
      description,
      amount,
      odometer,
      vendor,
      paymentMethod,
      isRecurring,
      receiptUrl,
      notes
    } = req.body;

    // Verify car belongs to user
    const car = await Car.findOne({ _id: carId, userId: req.user._id });
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    // Update car mileage if provided and higher
    if (odometer && odometer > (car.mileage || 0)) {
      car.mileage = odometer;
      await car.save();
    }

    const expense = await Expense.create({
      userId: req.user._id,
      carId,
      date: date || new Date(),
      category,
      description,
      amount,
      odometer,
      vendor,
      paymentMethod,
      isRecurring,
      receiptUrl,
      notes
    });

    const populatedExpense = await Expense.findById(expense._id)
      .populate('carId', 'make model year licensePlate');

    res.status(201).json(populatedExpense);
  } catch (error: any) {
    console.error('Create expense error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update expense
export const updateExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    const {
      date,
      category,
      description,
      amount,
      odometer,
      vendor,
      paymentMethod,
      isRecurring,
      receiptUrl,
      notes
    } = req.body;

    expense.date = date || expense.date;
    expense.category = category || expense.category;
    expense.description = description || expense.description;
    expense.amount = amount !== undefined ? amount : expense.amount;
    expense.odometer = odometer !== undefined ? odometer : expense.odometer;
    expense.vendor = vendor !== undefined ? vendor : expense.vendor;
    expense.paymentMethod = paymentMethod !== undefined ? paymentMethod : expense.paymentMethod;
    expense.isRecurring = isRecurring !== undefined ? isRecurring : expense.isRecurring;
    expense.receiptUrl = receiptUrl !== undefined ? receiptUrl : expense.receiptUrl;
    expense.notes = notes !== undefined ? notes : expense.notes;

    const updatedExpense = await expense.save();
    const populatedExpense = await Expense.findById(updatedExpense._id)
      .populate('carId', 'make model year licensePlate');

    res.json(populatedExpense);
  } catch (error: any) {
    console.error('Update expense error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Delete expense
export const deleteExpense = async (req: AuthRequest, res: Response) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!expense) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    await expense.deleteOne();
    res.json({ message: 'Expense removed' });
  } catch (error: any) {
    console.error('Delete expense error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
