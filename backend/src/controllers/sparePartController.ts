import { Request, Response } from 'express';
import SparePart from '../models/SparePart';
import { AuthRequest } from '../middleware/auth';

// Get all spare parts (with optional filters)
export const getSpareParts = async (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;

    let query: any = {};

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { partNumber: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const parts = await SparePart.find(query).sort({ name: 1 });
    res.json(parts);
  } catch (error: any) {
    console.error('Get spare parts error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get spare part by ID
export const getSparePartById = async (req: Request, res: Response) => {
  try {
    const part = await SparePart.findById(req.params.id);

    if (!part) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    res.json(part);
  } catch (error: any) {
    console.error('Get spare part by ID error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Create spare part (admin function - simplified for now)
export const createSparePart = async (req: AuthRequest, res: Response) => {
  try {
    const {
      name,
      partNumber,
      category,
      description,
      price,
      stock,
      manufacturer,
      compatibleModels,
      imageUrl
    } = req.body;

    const part = await SparePart.create({
      name,
      partNumber,
      category,
      description,
      price,
      stock,
      manufacturer,
      compatibleModels,
      imageUrl
    });

    res.status(201).json(part);
  } catch (error: any) {
    console.error('Create spare part error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update spare part
export const updateSparePart = async (req: AuthRequest, res: Response) => {
  try {
    const part = await SparePart.findById(req.params.id);

    if (!part) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    const {
      name,
      partNumber,
      category,
      description,
      price,
      stock,
      manufacturer,
      compatibleModels,
      imageUrl
    } = req.body;

    part.name = name || part.name;
    part.partNumber = partNumber || part.partNumber;
    part.category = category || part.category;
    part.description = description || part.description;
    part.price = price !== undefined ? price : part.price;
    part.stock = stock !== undefined ? stock : part.stock;
    part.manufacturer = manufacturer || part.manufacturer;
    part.compatibleModels = compatibleModels || part.compatibleModels;
    part.imageUrl = imageUrl || part.imageUrl;

    const updatedPart = await part.save();
    res.json(updatedPart);
  } catch (error: any) {
    console.error('Update spare part error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Delete spare part
export const deleteSparePart = async (req: AuthRequest, res: Response) => {
  try {
    const part = await SparePart.findById(req.params.id);

    if (!part) {
      return res.status(404).json({ message: 'Spare part not found' });
    }

    await part.deleteOne();
    res.json({ message: 'Spare part removed' });
  } catch (error: any) {
    console.error('Delete spare part error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
