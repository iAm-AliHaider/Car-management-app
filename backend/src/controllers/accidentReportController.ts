import { Request, Response } from 'express';
import AccidentReport from '../models/AccidentReport';
import { AuthRequest } from '../middleware/auth';

// Get all accident reports for user
export const getAccidentReports = async (req: AuthRequest, res: Response) => {
  try {
    const reports = await AccidentReport.find({ userId: req.user._id })
      .populate('carId', 'make model year licensePlate')
      .populate('insuranceClaimId')
      .sort({ accidentDate: -1 });

    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get accident report by ID
export const getAccidentReportById = async (req: AuthRequest, res: Response) => {
  try {
    const report = await AccidentReport.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('carId', 'make model year licensePlate vin')
      .populate('insuranceClaimId');

    if (!report) {
      return res.status(404).json({ message: 'Accident report not found' });
    }

    res.json(report);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create accident report
export const createAccidentReport = async (req: AuthRequest, res: Response) => {
  try {
    const reportData = {
      ...req.body,
      userId: req.user._id
    };

    const report = new AccidentReport(reportData);
    await report.save();

    const populatedReport = await AccidentReport.findById(report._id)
      .populate('carId', 'make model year licensePlate');

    res.status(201).json(populatedReport);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to create accident report', error: error.message });
  }
};

// Update accident report
export const updateAccidentReport = async (req: AuthRequest, res: Response) => {
  try {
    const report = await AccidentReport.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({ message: 'Accident report not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      (report as any)[key] = req.body[key];
    });

    await report.save();

    const populatedReport = await AccidentReport.findById(report._id)
      .populate('carId', 'make model year licensePlate')
      .populate('insuranceClaimId');

    res.json(populatedReport);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to update accident report', error: error.message });
  }
};

// Delete accident report
export const deleteAccidentReport = async (req: AuthRequest, res: Response) => {
  try {
    const report = await AccidentReport.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({ message: 'Accident report not found' });
    }

    res.json({ message: 'Accident report deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add photo to accident report
export const addPhotoToReport = async (req: AuthRequest, res: Response) => {
  try {
    const { url, description } = req.body;

    const report = await AccidentReport.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({ message: 'Accident report not found' });
    }

    report.photos.push({
      url,
      description,
      uploadedAt: new Date()
    });

    await report.save();
    res.json(report);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to add photo', error: error.message });
  }
};

// Add document to accident report
export const addDocumentToReport = async (req: AuthRequest, res: Response) => {
  try {
    const { title, url, fileType } = req.body;

    const report = await AccidentReport.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!report) {
      return res.status(404).json({ message: 'Accident report not found' });
    }

    report.documents.push({
      title,
      url,
      fileType,
      uploadedAt: new Date()
    });

    await report.save();
    res.json(report);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to add document', error: error.message });
  }
};

// Get accident reports statistics
export const getAccidentStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const reports = await AccidentReport.find({ userId: req.user._id });

    const statistics = {
      totalReports: reports.length,
      bySeverity: {
        minor: reports.filter(r => r.severity === 'minor').length,
        moderate: reports.filter(r => r.severity === 'moderate').length,
        severe: reports.filter(r => r.severity === 'severe').length,
        totalLoss: reports.filter(r => r.severity === 'total-loss').length
      },
      byStatus: {
        draft: reports.filter(r => r.status === 'draft').length,
        submitted: reports.filter(r => r.status === 'submitted').length,
        underReview: reports.filter(r => r.status === 'under-review').length,
        closed: reports.filter(r => r.status === 'closed').length
      },
      withPoliceReport: reports.filter(r => r.policeReportFiled).length,
      withInsuranceClaim: reports.filter(r => r.insuranceClaimId).length,
      totalEstimatedDamage: reports.reduce((sum, r) => sum + (r.vehicleDamage.estimatedCost || 0), 0),
      withInjuries: reports.filter(r => r.injuries && r.injuries.length > 0).length
    };

    res.json(statistics);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
