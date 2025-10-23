import { Response } from 'express';
import Document from '../models/Document';
import Car from '../models/Car';
import { AuthRequest } from '../middleware/auth';

// Get all documents for user
export const getDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const { carId, documentType } = req.query;
    const query: any = { userId: req.user._id };

    if (carId) {
      query.carId = carId;
    }

    if (documentType) {
      query.documentType = documentType;
    }

    const documents = await Document.find(query)
      .populate('carId', 'make model year licensePlate')
      .sort({ expiryDate: 1, createdAt: -1 });

    res.json(documents);
  } catch (error: any) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get expiring documents
export const getExpiringDocuments = async (req: AuthRequest, res: Response) => {
  try {
    const daysAhead = parseInt(req.query.days as string) || 30;
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    const documents = await Document.find({
      userId: req.user._id,
      expiryDate: {
        $gte: new Date(),
        $lte: futureDate
      },
      reminderEnabled: true
    })
      .populate('carId', 'make model year licensePlate')
      .sort({ expiryDate: 1 });

    res.json(documents);
  } catch (error: any) {
    console.error('Get expiring documents error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Get document by ID
export const getDocumentById = async (req: AuthRequest, res: Response) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate('carId', 'make model year licensePlate');

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    res.json(document);
  } catch (error: any) {
    console.error('Get document by ID error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Create document
export const createDocument = async (req: AuthRequest, res: Response) => {
  try {
    const {
      carId,
      title,
      documentType,
      description,
      documentNumber,
      issueDate,
      expiryDate,
      fileUrl,
      fileName,
      fileSize,
      reminderEnabled,
      reminderDays,
      tags,
      notes
    } = req.body;

    // Verify car belongs to user
    const car = await Car.findOne({ _id: carId, userId: req.user._id });
    if (!car) {
      return res.status(404).json({ message: 'Car not found' });
    }

    const document = await Document.create({
      userId: req.user._id,
      carId,
      title,
      documentType,
      description,
      documentNumber,
      issueDate,
      expiryDate,
      fileUrl,
      fileName,
      fileSize,
      reminderEnabled,
      reminderDays,
      tags,
      notes
    });

    const populatedDocument = await Document.findById(document._id)
      .populate('carId', 'make model year licensePlate');

    res.status(201).json(populatedDocument);
  } catch (error: any) {
    console.error('Create document error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Update document
export const updateDocument = async (req: AuthRequest, res: Response) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const {
      title,
      documentType,
      description,
      documentNumber,
      issueDate,
      expiryDate,
      fileUrl,
      fileName,
      fileSize,
      reminderEnabled,
      reminderDays,
      tags,
      notes
    } = req.body;

    document.title = title || document.title;
    document.documentType = documentType || document.documentType;
    document.description = description !== undefined ? description : document.description;
    document.documentNumber = documentNumber !== undefined ? documentNumber : document.documentNumber;
    document.issueDate = issueDate !== undefined ? issueDate : document.issueDate;
    document.expiryDate = expiryDate !== undefined ? expiryDate : document.expiryDate;
    document.fileUrl = fileUrl !== undefined ? fileUrl : document.fileUrl;
    document.fileName = fileName !== undefined ? fileName : document.fileName;
    document.fileSize = fileSize !== undefined ? fileSize : document.fileSize;
    document.reminderEnabled = reminderEnabled !== undefined ? reminderEnabled : document.reminderEnabled;
    document.reminderDays = reminderDays !== undefined ? reminderDays : document.reminderDays;
    document.tags = tags || document.tags;
    document.notes = notes !== undefined ? notes : document.notes;

    const updatedDocument = await document.save();
    const populatedDocument = await Document.findById(updatedDocument._id)
      .populate('carId', 'make model year licensePlate');

    res.json(populatedDocument);
  } catch (error: any) {
    console.error('Update document error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};

// Delete document
export const deleteDocument = async (req: AuthRequest, res: Response) => {
  try {
    const document = await Document.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }

    await document.deleteOne();
    res.json({ message: 'Document removed' });
  } catch (error: any) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: error.message || 'Server error' });
  }
};
