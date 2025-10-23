import { Request, Response } from 'express';
import InsuranceClaim from '../models/InsuranceClaim';
import AccidentReport from '../models/AccidentReport';
import { AuthRequest } from '../middleware/auth';

// Get all insurance claims for user
export const getInsuranceClaims = async (req: AuthRequest, res: Response) => {
  try {
    const claims = await InsuranceClaim.find({ userId: req.user._id })
      .populate('carId', 'make model year licensePlate')
      .populate('accidentReportId')
      .sort({ incidentDate: -1 });

    res.json(claims);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get insurance claim by ID
export const getInsuranceClaimById = async (req: AuthRequest, res: Response) => {
  try {
    const claim = await InsuranceClaim.findOne({
      _id: req.params.id,
      userId: req.user._id
    })
      .populate('carId', 'make model year licensePlate vin')
      .populate('accidentReportId');

    if (!claim) {
      return res.status(404).json({ message: 'Insurance claim not found' });
    }

    res.json(claim);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Create insurance claim
export const createInsuranceClaim = async (req: AuthRequest, res: Response) => {
  try {
    const claimData = {
      ...req.body,
      userId: req.user._id
    };

    const claim = new InsuranceClaim(claimData);
    await claim.save();

    // If linked to an accident report, update the accident report
    if (claim.accidentReportId) {
      await AccidentReport.findByIdAndUpdate(claim.accidentReportId, {
        insuranceClaimId: claim._id,
        insuranceNotified: true,
        insuranceNotificationDate: new Date()
      });
    }

    const populatedClaim = await InsuranceClaim.findById(claim._id)
      .populate('carId', 'make model year licensePlate')
      .populate('accidentReportId');

    res.status(201).json(populatedClaim);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to create insurance claim', error: error.message });
  }
};

// Update insurance claim
export const updateInsuranceClaim = async (req: AuthRequest, res: Response) => {
  try {
    const claim = await InsuranceClaim.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!claim) {
      return res.status(404).json({ message: 'Insurance claim not found' });
    }

    // Update fields
    Object.keys(req.body).forEach(key => {
      (claim as any)[key] = req.body[key];
    });

    await claim.save();

    const populatedClaim = await InsuranceClaim.findById(claim._id)
      .populate('carId', 'make model year licensePlate')
      .populate('accidentReportId');

    res.json(populatedClaim);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to update insurance claim', error: error.message });
  }
};

// Delete insurance claim
export const deleteInsuranceClaim = async (req: AuthRequest, res: Response) => {
  try {
    const claim = await InsuranceClaim.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!claim) {
      return res.status(404).json({ message: 'Insurance claim not found' });
    }

    // If linked to accident report, remove the link
    if (claim.accidentReportId) {
      await AccidentReport.findByIdAndUpdate(claim.accidentReportId, {
        $unset: { insuranceClaimId: 1 }
      });
    }

    await InsuranceClaim.findByIdAndDelete(claim._id);

    res.json({ message: 'Insurance claim deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Add communication to claim
export const addCommunication = async (req: AuthRequest, res: Response) => {
  try {
    const { date, type, direction, subject, summary, representative } = req.body;

    const claim = await InsuranceClaim.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!claim) {
      return res.status(404).json({ message: 'Insurance claim not found' });
    }

    claim.communications.push({
      date: date || new Date(),
      type,
      direction,
      subject,
      summary,
      representative
    });

    await claim.save();
    res.json(claim);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to add communication', error: error.message });
  }
};

// Add document to claim
export const addDocumentToClaim = async (req: AuthRequest, res: Response) => {
  try {
    const { title, documentType, url, fileSize, description } = req.body;

    const claim = await InsuranceClaim.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!claim) {
      return res.status(404).json({ message: 'Insurance claim not found' });
    }

    claim.documents.push({
      title,
      documentType,
      url,
      fileSize,
      uploadedAt: new Date(),
      description
    });

    await claim.save();
    res.json(claim);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to add document', error: error.message });
  }
};

// Add payment to claim
export const addPayment = async (req: AuthRequest, res: Response) => {
  try {
    const { date, amount, method, checkNumber, notes } = req.body;

    const claim = await InsuranceClaim.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!claim) {
      return res.status(404).json({ message: 'Insurance claim not found' });
    }

    claim.payments.push({
      date: date || new Date(),
      amount,
      method,
      checkNumber,
      notes
    });

    // Update payment status based on total paid vs claim amount
    if (claim.claimAmount && claim.totalPaid) {
      if (claim.totalPaid >= claim.claimAmount) {
        claim.paymentStatus = 'completed';
      } else if (claim.totalPaid > 0) {
        claim.paymentStatus = 'partial';
      }
    }

    await claim.save();
    res.json(claim);
  } catch (error: any) {
    res.status(400).json({ message: 'Failed to add payment', error: error.message });
  }
};

// Get insurance claims statistics
export const getClaimStatistics = async (req: AuthRequest, res: Response) => {
  try {
    const claims = await InsuranceClaim.find({ userId: req.user._id });

    const statistics = {
      totalClaims: claims.length,
      byType: {
        collision: claims.filter(c => c.claimType === 'collision').length,
        comprehensive: claims.filter(c => c.claimType === 'comprehensive').length,
        liability: claims.filter(c => c.claimType === 'liability').length,
        uninsuredMotorist: claims.filter(c => c.claimType === 'uninsured-motorist').length,
        personalInjury: claims.filter(c => c.claimType === 'personal-injury').length,
        other: claims.filter(c => c.claimType === 'other').length
      },
      byStatus: {
        draft: claims.filter(c => c.status === 'draft').length,
        submitted: claims.filter(c => c.status === 'submitted').length,
        underReview: claims.filter(c => c.status === 'under-review').length,
        approved: claims.filter(c => c.status === 'approved').length,
        partiallyApproved: claims.filter(c => c.status === 'partially-approved').length,
        denied: claims.filter(c => c.status === 'denied').length,
        closed: claims.filter(c => c.status === 'closed').length,
        withdrawn: claims.filter(c => c.status === 'withdrawn').length
      },
      byPaymentStatus: {
        pending: claims.filter(c => c.paymentStatus === 'pending').length,
        partial: claims.filter(c => c.paymentStatus === 'partial').length,
        completed: claims.filter(c => c.paymentStatus === 'completed').length,
        notApplicable: claims.filter(c => c.paymentStatus === 'not-applicable').length
      },
      financials: {
        totalClaimAmount: claims.reduce((sum, c) => sum + (c.claimAmount || 0), 0),
        totalApprovedAmount: claims.reduce((sum, c) => sum + (c.approvedAmount || 0), 0),
        totalPaid: claims.reduce((sum, c) => sum + (c.totalPaid || 0), 0),
        totalDeductibles: claims.reduce((sum, c) => sum + (c.deductible || 0), 0),
        averageClaimAmount: claims.length > 0
          ? claims.reduce((sum, c) => sum + (c.claimAmount || 0), 0) / claims.length
          : 0
      },
      appeals: {
        totalAppeals: claims.filter(c => c.appealFiled).length,
        pendingAppeals: claims.filter(c => c.appealFiled && !c.appealOutcome).length
      }
    };

    res.json(statistics);
  } catch (error: any) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
