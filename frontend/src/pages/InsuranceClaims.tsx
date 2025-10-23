import { useState, useEffect } from 'react';
import { insuranceClaimService } from '../services/insuranceClaimService';
import { carService } from '../services/carService';
import { InsuranceClaim, Car } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

export default function InsuranceClaims() {
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<InsuranceClaim | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [view, setView] = useState<'list' | 'detail'>('list');

  const [newClaim, setNewClaim] = useState({
    carId: '',
    claimType: 'collision' as const,
    incidentDate: '',
    insuranceCompany: '',
    policyNumber: '',
    policyHolderName: '',
    agentName: '',
    agentContactNumber: '',
    agentEmail: '',
    description: '',
    damageDescription: '',
    claimReason: '',
    claimAmount: '',
    deductible: ''
  });

  useEffect(() => {
    fetchClaims();
    fetchCars();
  }, []);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const data = await insuranceClaimService.getInsuranceClaims();
      setClaims(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch insurance claims');
    } finally {
      setLoading(false);
    }
  };

  const fetchCars = async () => {
    try {
      const data = await carService.getCars();
      setCars(data);
    } catch (err: any) {
      console.error('Failed to fetch cars:', err);
    }
  };

  const handleCreateClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const claimData = {
        ...newClaim,
        claimAmount: newClaim.claimAmount ? Number(newClaim.claimAmount) : undefined,
        deductible: newClaim.deductible ? Number(newClaim.deductible) : undefined,
        communications: [],
        documents: [],
        payments: []
      };

      await insuranceClaimService.createInsuranceClaim(claimData);
      setNewClaim({
        carId: '',
        claimType: 'collision',
        incidentDate: '',
        insuranceCompany: '',
        policyNumber: '',
        policyHolderName: '',
        agentName: '',
        agentContactNumber: '',
        agentEmail: '',
        description: '',
        damageDescription: '',
        claimReason: '',
        claimAmount: '',
        deductible: ''
      });
      setShowCreateForm(false);
      fetchClaims();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create insurance claim');
    }
  };

  const handleDeleteClaim = async (id: string) => {
    if (!confirm('Are you sure you want to delete this insurance claim?')) return;
    try {
      await insuranceClaimService.deleteInsuranceClaim(id);
      fetchClaims();
      if (selectedClaim?._id === id) {
        setSelectedClaim(null);
        setView('list');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete insurance claim');
    }
  };

  const handleViewDetail = async (claim: InsuranceClaim) => {
    try {
      const fullClaim = await insuranceClaimService.getInsuranceClaimById(claim._id);
      setSelectedClaim(fullClaim);
      setView('detail');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load claim details');
    }
  };

  const handleUpdateStatus = async (status: string) => {
    if (!selectedClaim) return;
    try {
      const updated = await insuranceClaimService.updateInsuranceClaim(selectedClaim._id, { status: status as any });
      setSelectedClaim(updated);
      fetchClaims();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-blue-100 text-blue-800',
      'under-review': 'bg-purple-100 text-purple-800',
      'additional-info-required': 'bg-yellow-100 text-yellow-800',
      'approved': 'bg-green-100 text-green-800',
      'partially-approved': 'bg-teal-100 text-teal-800',
      'denied': 'bg-red-100 text-red-800',
      'closed': 'bg-gray-100 text-gray-800',
      'withdrawn': 'bg-orange-100 text-orange-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getPaymentStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'partial': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'not-applicable': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading insurance claims...</div>
      </div>
    );
  }

  if (view === 'detail' && selectedClaim) {
    const car = typeof selectedClaim.carId === 'object' ? selectedClaim.carId : null;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Insurance Claim Details</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => {
              setView('list');
              setSelectedClaim(null);
            }}>
              Back to List
            </Button>
            <Button variant="danger" onClick={() => handleDeleteClaim(selectedClaim._id)}>
              Delete Claim
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Card title="Claim Information">
          <div className="grid grid-cols-2 gap-4">
            {selectedClaim.claimNumber && (
              <div>
                <p className="text-sm text-gray-600">Claim Number</p>
                <p className="font-medium">{selectedClaim.claimNumber}</p>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Claim Type</p>
              <p className="font-medium capitalize">{selectedClaim.claimType.replace('-', ' ')}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vehicle</p>
              <p className="font-medium">{car ? `${car.year} ${car.make} ${car.model}` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Incident Date</p>
              <p className="font-medium">{new Date(selectedClaim.incidentDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedClaim.status)}`}>
                {selectedClaim.status.replace('-', ' ')}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Payment Status</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getPaymentStatusColor(selectedClaim.paymentStatus)}`}>
                {selectedClaim.paymentStatus.replace('-', ' ')}
              </span>
            </div>
          </div>

          <div className="mt-4 flex gap-2 flex-wrap">
            <Button size="sm" onClick={() => handleUpdateStatus('submitted')}>
              Mark as Submitted
            </Button>
            <Button size="sm" onClick={() => handleUpdateStatus('under-review')}>
              Mark as Under Review
            </Button>
            <Button size="sm" onClick={() => handleUpdateStatus('approved')}>
              Mark as Approved
            </Button>
            <Button size="sm" variant="danger" onClick={() => handleUpdateStatus('denied')}>
              Mark as Denied
            </Button>
            <Button size="sm" onClick={() => handleUpdateStatus('closed')}>
              Mark as Closed
            </Button>
          </div>
        </Card>

        <Card title="Financial Details">
          <div className="grid grid-cols-3 gap-4">
            {selectedClaim.claimAmount && (
              <div>
                <p className="text-sm text-gray-600">Claim Amount</p>
                <p className="text-2xl font-bold text-gray-900">
                  ${selectedClaim.claimAmount.toLocaleString()}
                </p>
              </div>
            )}
            {selectedClaim.approvedAmount && (
              <div>
                <p className="text-sm text-gray-600">Approved Amount</p>
                <p className="text-2xl font-bold text-green-600">
                  ${selectedClaim.approvedAmount.toLocaleString()}
                </p>
              </div>
            )}
            {selectedClaim.totalPaid !== undefined && (
              <div>
                <p className="text-sm text-gray-600">Total Paid</p>
                <p className="text-2xl font-bold text-blue-600">
                  ${selectedClaim.totalPaid.toLocaleString()}
                </p>
              </div>
            )}
            {selectedClaim.deductible && (
              <div>
                <p className="text-sm text-gray-600">Deductible</p>
                <p className="text-lg font-medium text-gray-900">
                  ${selectedClaim.deductible.toLocaleString()}
                </p>
              </div>
            )}
          </div>
        </Card>

        <Card title="Insurance Company Information">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Insurance Company</p>
              <p className="font-medium">{selectedClaim.insuranceCompany}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Policy Number</p>
              <p className="font-medium">{selectedClaim.policyNumber}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Policy Holder</p>
              <p className="font-medium">{selectedClaim.policyHolderName}</p>
            </div>
            {selectedClaim.agentName && (
              <div>
                <p className="text-sm text-gray-600">Agent Name</p>
                <p className="font-medium">{selectedClaim.agentName}</p>
              </div>
            )}
            {selectedClaim.agentContactNumber && (
              <div>
                <p className="text-sm text-gray-600">Agent Phone</p>
                <p className="font-medium">{selectedClaim.agentContactNumber}</p>
              </div>
            )}
            {selectedClaim.agentEmail && (
              <div>
                <p className="text-sm text-gray-600">Agent Email</p>
                <p className="font-medium">{selectedClaim.agentEmail}</p>
              </div>
            )}
          </div>
        </Card>

        <Card title="Claim Description">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-700">Description</p>
              <p className="text-gray-700 mt-1">{selectedClaim.description}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Damage Description</p>
              <p className="text-gray-700 mt-1">{selectedClaim.damageDescription}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-700">Claim Reason</p>
              <p className="text-gray-700 mt-1">{selectedClaim.claimReason}</p>
            </div>
          </div>
        </Card>

        {selectedClaim.repairShop && (
          <Card title="Repair Shop Information">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Shop Name</p>
                <p className="font-medium">{selectedClaim.repairShop.name}</p>
              </div>
              {selectedClaim.repairShop.contactNumber && (
                <div>
                  <p className="text-sm text-gray-600">Contact</p>
                  <p className="font-medium">{selectedClaim.repairShop.contactNumber}</p>
                </div>
              )}
              {selectedClaim.repairShop.estimateAmount && (
                <div>
                  <p className="text-sm text-gray-600">Estimate</p>
                  <p className="font-medium">${selectedClaim.repairShop.estimateAmount.toLocaleString()}</p>
                </div>
              )}
              {selectedClaim.repairShop.actualAmount && (
                <div>
                  <p className="text-sm text-gray-600">Actual Cost</p>
                  <p className="font-medium">${selectedClaim.repairShop.actualAmount.toLocaleString()}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {selectedClaim.rentalCarInfo?.provided && (
          <Card title="Rental Car Information">
            <div className="grid grid-cols-2 gap-4">
              {selectedClaim.rentalCarInfo.company && (
                <div>
                  <p className="text-sm text-gray-600">Rental Company</p>
                  <p className="font-medium">{selectedClaim.rentalCarInfo.company}</p>
                </div>
              )}
              {selectedClaim.rentalCarInfo.dailyRate && (
                <div>
                  <p className="text-sm text-gray-600">Daily Rate</p>
                  <p className="font-medium">${selectedClaim.rentalCarInfo.dailyRate}</p>
                </div>
              )}
              {selectedClaim.rentalCarInfo.daysAuthorized && (
                <div>
                  <p className="text-sm text-gray-600">Days Authorized</p>
                  <p className="font-medium">{selectedClaim.rentalCarInfo.daysAuthorized}</p>
                </div>
              )}
              {selectedClaim.rentalCarInfo.totalCost && (
                <div>
                  <p className="text-sm text-gray-600">Total Cost</p>
                  <p className="font-medium">${selectedClaim.rentalCarInfo.totalCost.toLocaleString()}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {selectedClaim.communications.length > 0 && (
          <Card title="Communications">
            <div className="space-y-3">
              {selectedClaim.communications.map((comm, idx) => (
                <div key={idx} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex justify-between items-start mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium capitalize">{comm.type}</span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        comm.direction === 'incoming' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {comm.direction}
                      </span>
                    </div>
                    <span className="text-sm text-gray-600">
                      {new Date(comm.date).toLocaleDateString()}
                    </span>
                  </div>
                  {comm.subject && (
                    <p className="text-sm font-medium text-gray-900">{comm.subject}</p>
                  )}
                  <p className="text-sm text-gray-700">{comm.summary}</p>
                  {comm.representative && (
                    <p className="text-xs text-gray-600 mt-1">Rep: {comm.representative}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {selectedClaim.payments.length > 0 && (
          <Card title="Payments">
            <div className="space-y-3">
              {selectedClaim.payments.map((payment, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <div>
                    <p className="font-medium">${payment.amount.toLocaleString()}</p>
                    <p className="text-sm text-gray-600">{payment.method}</p>
                    {payment.checkNumber && (
                      <p className="text-xs text-gray-500">Check #{payment.checkNumber}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">
                      {new Date(payment.date).toLocaleDateString()}
                    </p>
                    {payment.notes && (
                      <p className="text-xs text-gray-500">{payment.notes}</p>
                    )}
                  </div>
                </div>
              ))}
              <div className="pt-2 border-t-2 border-gray-300">
                <div className="flex justify-between items-center">
                  <p className="font-bold text-lg">Total Paid</p>
                  <p className="font-bold text-lg text-green-600">
                    ${(selectedClaim.totalPaid || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        )}

        {(selectedClaim.atFault !== undefined || selectedClaim.denialReason || selectedClaim.appealFiled) && (
          <Card title="Additional Information">
            <div className="space-y-2">
              {selectedClaim.atFault !== undefined && (
                <div>
                  <p className="text-sm text-gray-600">At Fault</p>
                  <p className="font-medium">{selectedClaim.atFault ? 'Yes' : 'No'}</p>
                  {selectedClaim.faultPercentage && (
                    <p className="text-sm text-gray-600">Fault Percentage: {selectedClaim.faultPercentage}%</p>
                  )}
                </div>
              )}
              {selectedClaim.denialReason && (
                <div>
                  <p className="text-sm text-gray-600">Denial Reason</p>
                  <p className="font-medium text-red-600">{selectedClaim.denialReason}</p>
                </div>
              )}
              {selectedClaim.appealFiled && (
                <div className="bg-yellow-50 border border-yellow-200 p-3 rounded">
                  <p className="font-medium text-yellow-900">Appeal Filed</p>
                  {selectedClaim.appealDate && (
                    <p className="text-sm text-yellow-800">
                      Date: {new Date(selectedClaim.appealDate).toLocaleDateString()}
                    </p>
                  )}
                  {selectedClaim.appealOutcome && (
                    <p className="text-sm text-yellow-800 mt-1">
                      Outcome: {selectedClaim.appealOutcome}
                    </p>
                  )}
                </div>
              )}
            </div>
          </Card>
        )}

        {selectedClaim.notes && (
          <Card title="Notes">
            <p className="text-gray-700">{selectedClaim.notes}</p>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Insurance Claims</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : 'File New Claim'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showCreateForm && (
        <Card title="File New Insurance Claim">
          <form onSubmit={handleCreateClaim} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle
              </label>
              <select
                value={newClaim.carId}
                onChange={(e) => setNewClaim({ ...newClaim, carId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              >
                <option value="">Select a vehicle</option>
                {cars.map((car) => (
                  <option key={car._id} value={car._id}>
                    {car.year} {car.make} {car.model} - {car.licensePlate}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Claim Type
                </label>
                <select
                  value={newClaim.claimType}
                  onChange={(e) => setNewClaim({ ...newClaim, claimType: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="collision">Collision</option>
                  <option value="comprehensive">Comprehensive</option>
                  <option value="liability">Liability</option>
                  <option value="uninsured-motorist">Uninsured Motorist</option>
                  <option value="personal-injury">Personal Injury</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <Input
                label="Incident Date"
                type="date"
                value={newClaim.incidentDate}
                onChange={(e) => setNewClaim({ ...newClaim, incidentDate: e.target.value })}
                required
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Insurance Information</h3>
              <div className="space-y-4">
                <Input
                  label="Insurance Company"
                  value={newClaim.insuranceCompany}
                  onChange={(e) => setNewClaim({ ...newClaim, insuranceCompany: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Policy Number"
                    value={newClaim.policyNumber}
                    onChange={(e) => setNewClaim({ ...newClaim, policyNumber: e.target.value })}
                    required
                  />
                  <Input
                    label="Policy Holder Name"
                    value={newClaim.policyHolderName}
                    onChange={(e) => setNewClaim({ ...newClaim, policyHolderName: e.target.value })}
                    required
                  />
                </div>
                <Input
                  label="Agent Name (Optional)"
                  value={newClaim.agentName}
                  onChange={(e) => setNewClaim({ ...newClaim, agentName: e.target.value })}
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Agent Phone (Optional)"
                    value={newClaim.agentContactNumber}
                    onChange={(e) => setNewClaim({ ...newClaim, agentContactNumber: e.target.value })}
                  />
                  <Input
                    label="Agent Email (Optional)"
                    type="email"
                    value={newClaim.agentEmail}
                    onChange={(e) => setNewClaim({ ...newClaim, agentEmail: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Claim Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newClaim.description}
                    onChange={(e) => setNewClaim({ ...newClaim, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Damage Description
                  </label>
                  <textarea
                    value={newClaim.damageDescription}
                    onChange={(e) => setNewClaim({ ...newClaim, damageDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Claim Reason
                  </label>
                  <textarea
                    value={newClaim.claimReason}
                    onChange={(e) => setNewClaim({ ...newClaim, claimReason: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={2}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Claim Amount (Optional)"
                    type="number"
                    step="0.01"
                    value={newClaim.claimAmount}
                    onChange={(e) => setNewClaim({ ...newClaim, claimAmount: e.target.value })}
                    placeholder="0.00"
                  />
                  <Input
                    label="Deductible (Optional)"
                    type="number"
                    step="0.01"
                    value={newClaim.deductible}
                    onChange={(e) => setNewClaim({ ...newClaim, deductible: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <Button type="submit">File Insurance Claim</Button>
          </form>
        </Card>
      )}

      {claims.length > 0 ? (
        <div className="grid gap-4">
          {claims.map((claim) => {
            const car = typeof claim.carId === 'object' ? claim.carId : null;
            return (
              <Card key={claim._id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {car ? `${car.year} ${car.make} ${car.model}` : 'Unknown Vehicle'}
                      </h3>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(claim.status)}`}>
                        {claim.status.replace('-', ' ')}
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getPaymentStatusColor(claim.paymentStatus)}`}>
                        {claim.paymentStatus.replace('-', ' ')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {claim.insuranceCompany} | Type: {claim.claimType.replace('-', ' ')}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                      Incident: {new Date(claim.incidentDate).toLocaleDateString()}
                    </p>
                    <div className="flex gap-4 mt-2">
                      {claim.claimAmount && (
                        <p className="text-sm font-medium text-gray-900">
                          Claimed: ${claim.claimAmount.toLocaleString()}
                        </p>
                      )}
                      {claim.approvedAmount && (
                        <p className="text-sm font-medium text-green-600">
                          Approved: ${claim.approvedAmount.toLocaleString()}
                        </p>
                      )}
                      {claim.totalPaid !== undefined && claim.totalPaid > 0 && (
                        <p className="text-sm font-medium text-blue-600">
                          Paid: ${claim.totalPaid.toLocaleString()}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleViewDetail(claim)}>
                      View Details
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteClaim(claim._id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      ) : (
        !showCreateForm && (
          <Card>
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No insurance claims found.</p>
              <Button onClick={() => setShowCreateForm(true)}>File Your First Claim</Button>
            </div>
          </Card>
        )
      )}
    </div>
  );
}
