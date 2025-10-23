import { useState, useEffect } from 'react';
import { accidentReportService } from '../services/accidentReportService';
import { carService } from '../services/carService';
import { AccidentReport, Car } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

export default function AccidentReports() {
  const [reports, setReports] = useState<AccidentReport[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedReport, setSelectedReport] = useState<AccidentReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [view, setView] = useState<'list' | 'detail'>('list');

  const [newReport, setNewReport] = useState({
    carId: '',
    accidentDate: '',
    accidentTime: '',
    location: '',
    severity: 'minor' as const,
    description: '',
    weatherConditions: '',
    roadConditions: '',
    policeReportFiled: false,
    policeReportNumber: '',
    policeDepartment: '',
    officerName: '',
    vehicleDamage: {
      description: '',
      estimatedCost: '',
      damagedParts: [] as string[],
      vehicleDrivable: false
    }
  });

  useEffect(() => {
    fetchReports();
    fetchCars();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await accidentReportService.getAccidentReports();
      setReports(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch accident reports');
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

  const handleCreateReport = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const reportData = {
        ...newReport,
        vehicleDamage: {
          ...newReport.vehicleDamage,
          estimatedCost: newReport.vehicleDamage.estimatedCost ? Number(newReport.vehicleDamage.estimatedCost) : undefined
        },
        otherPartiesInvolved: [],
        witnesses: [],
        injuries: [],
        photos: [],
        documents: []
      };

      await accidentReportService.createAccidentReport(reportData);
      setNewReport({
        carId: '',
        accidentDate: '',
        accidentTime: '',
        location: '',
        severity: 'minor',
        description: '',
        weatherConditions: '',
        roadConditions: '',
        policeReportFiled: false,
        policeReportNumber: '',
        policeDepartment: '',
        officerName: '',
        vehicleDamage: {
          description: '',
          estimatedCost: '',
          damagedParts: [],
          vehicleDrivable: false
        }
      });
      setShowCreateForm(false);
      fetchReports();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create accident report');
    }
  };

  const handleDeleteReport = async (id: string) => {
    if (!confirm('Are you sure you want to delete this accident report?')) return;
    try {
      await accidentReportService.deleteAccidentReport(id);
      fetchReports();
      if (selectedReport?._id === id) {
        setSelectedReport(null);
        setView('list');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete accident report');
    }
  };

  const handleViewDetail = async (report: AccidentReport) => {
    try {
      const fullReport = await accidentReportService.getAccidentReportById(report._id);
      setSelectedReport(fullReport);
      setView('detail');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load report details');
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      'minor': 'bg-green-100 text-green-800',
      'moderate': 'bg-yellow-100 text-yellow-800',
      'severe': 'bg-orange-100 text-orange-800',
      'total-loss': 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'draft': 'bg-gray-100 text-gray-800',
      'submitted': 'bg-blue-100 text-blue-800',
      'under-review': 'bg-purple-100 text-purple-800',
      'closed': 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading accident reports...</div>
      </div>
    );
  }

  if (view === 'detail' && selectedReport) {
    const car = typeof selectedReport.carId === 'object' ? selectedReport.carId : null;

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Accident Report Details</h1>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => {
              setView('list');
              setSelectedReport(null);
            }}>
              Back to List
            </Button>
            <Button variant="danger" onClick={() => handleDeleteReport(selectedReport._id)}>
              Delete Report
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <Card title="Basic Information">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Vehicle</p>
              <p className="font-medium">{car ? `${car.year} ${car.make} ${car.model}` : 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">License Plate</p>
              <p className="font-medium">{car?.licensePlate || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Accident Date</p>
              <p className="font-medium">{new Date(selectedReport.accidentDate).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Time</p>
              <p className="font-medium">{selectedReport.accidentTime || 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Location</p>
              <p className="font-medium">{selectedReport.location}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Severity</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getSeverityColor(selectedReport.severity)}`}>
                {selectedReport.severity}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(selectedReport.status)}`}>
                {selectedReport.status}
              </span>
            </div>
          </div>
        </Card>

        <Card title="Accident Description">
          <p className="text-gray-700">{selectedReport.description}</p>
          {(selectedReport.weatherConditions || selectedReport.roadConditions) && (
            <div className="mt-4 grid grid-cols-2 gap-4">
              {selectedReport.weatherConditions && (
                <div>
                  <p className="text-sm text-gray-600">Weather Conditions</p>
                  <p className="font-medium">{selectedReport.weatherConditions}</p>
                </div>
              )}
              {selectedReport.roadConditions && (
                <div>
                  <p className="text-sm text-gray-600">Road Conditions</p>
                  <p className="font-medium">{selectedReport.roadConditions}</p>
                </div>
              )}
            </div>
          )}
        </Card>

        <Card title="Vehicle Damage">
          <p className="text-gray-700 mb-4">{selectedReport.vehicleDamage.description}</p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Estimated Cost</p>
              <p className="font-medium text-lg">
                {selectedReport.vehicleDamage.estimatedCost
                  ? `$${selectedReport.vehicleDamage.estimatedCost.toLocaleString()}`
                  : 'Not estimated'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Vehicle Drivable</p>
              <p className="font-medium">
                {selectedReport.vehicleDamage.vehicleDrivable ? 'Yes' : 'No'}
              </p>
            </div>
            {selectedReport.vehicleDamage.damagedParts.length > 0 && (
              <div className="col-span-2">
                <p className="text-sm text-gray-600 mb-2">Damaged Parts</p>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.vehicleDamage.damagedParts.map((part, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-800 text-sm rounded">
                      {part}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </Card>

        {selectedReport.policeReportFiled && (
          <Card title="Police Report">
            <div className="grid grid-cols-2 gap-4">
              {selectedReport.policeReportNumber && (
                <div>
                  <p className="text-sm text-gray-600">Report Number</p>
                  <p className="font-medium">{selectedReport.policeReportNumber}</p>
                </div>
              )}
              {selectedReport.policeDepartment && (
                <div>
                  <p className="text-sm text-gray-600">Department</p>
                  <p className="font-medium">{selectedReport.policeDepartment}</p>
                </div>
              )}
              {selectedReport.officerName && (
                <div>
                  <p className="text-sm text-gray-600">Officer Name</p>
                  <p className="font-medium">{selectedReport.officerName}</p>
                </div>
              )}
              {selectedReport.officerBadgeNumber && (
                <div>
                  <p className="text-sm text-gray-600">Badge Number</p>
                  <p className="font-medium">{selectedReport.officerBadgeNumber}</p>
                </div>
              )}
            </div>
          </Card>
        )}

        {selectedReport.otherPartiesInvolved.length > 0 && (
          <Card title="Other Parties Involved">
            <div className="space-y-4">
              {selectedReport.otherPartiesInvolved.map((party, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h4 className="font-medium mb-2">{party.name}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {party.contactNumber && <p>Contact: {party.contactNumber}</p>}
                    {party.vehicleInfo && <p>Vehicle: {party.vehicleInfo}</p>}
                    {party.licensePlate && <p>License: {party.licensePlate}</p>}
                    {party.insuranceCompany && <p>Insurance: {party.insuranceCompany}</p>}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        )}

        {selectedReport.witnesses.length > 0 && (
          <Card title="Witnesses">
            <div className="space-y-4">
              {selectedReport.witnesses.map((witness, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h4 className="font-medium mb-2">{witness.name}</h4>
                  {witness.contactNumber && <p className="text-sm">Contact: {witness.contactNumber}</p>}
                  {witness.statement && (
                    <p className="text-sm text-gray-700 mt-2">{witness.statement}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {selectedReport.injuries.length > 0 && (
          <Card title="Injuries">
            <div className="space-y-4">
              {selectedReport.injuries.map((injury, idx) => (
                <div key={idx} className="border-b border-gray-200 pb-4 last:border-b-0">
                  <h4 className="font-medium mb-2">{injury.personName}</h4>
                  <p className="text-sm text-gray-700">{injury.injuryDescription}</p>
                  <p className="text-sm mt-1">
                    Medical Attention: {injury.medicalAttentionRequired ? 'Required' : 'Not required'}
                  </p>
                  {injury.hospitalName && (
                    <p className="text-sm">Hospital: {injury.hospitalName}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {selectedReport.insuranceNotified && (
          <Card title="Insurance">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded">
              <p className="text-blue-800">
                Insurance notified on {new Date(selectedReport.insuranceNotificationDate!).toLocaleDateString()}
              </p>
              {selectedReport.insuranceClaimId && (
                <p className="text-sm text-blue-700 mt-2">
                  Insurance claim has been filed
                </p>
              )}
            </div>
          </Card>
        )}

        {selectedReport.notes && (
          <Card title="Notes">
            <p className="text-gray-700">{selectedReport.notes}</p>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Accident Reports</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : 'Report New Accident'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {showCreateForm && (
        <Card title="Report New Accident">
          <form onSubmit={handleCreateReport} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Vehicle
              </label>
              <select
                value={newReport.carId}
                onChange={(e) => setNewReport({ ...newReport, carId: e.target.value })}
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
              <Input
                label="Accident Date"
                type="date"
                value={newReport.accidentDate}
                onChange={(e) => setNewReport({ ...newReport, accidentDate: e.target.value })}
                required
              />
              <Input
                label="Time (Optional)"
                type="time"
                value={newReport.accidentTime}
                onChange={(e) => setNewReport({ ...newReport, accidentTime: e.target.value })}
              />
            </div>

            <Input
              label="Location"
              value={newReport.location}
              onChange={(e) => setNewReport({ ...newReport, location: e.target.value })}
              required
              placeholder="Street address or intersection"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Severity
              </label>
              <select
                value={newReport.severity}
                onChange={(e) => setNewReport({ ...newReport, severity: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="minor">Minor</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="total-loss">Total Loss</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={newReport.description}
                onChange={(e) => setNewReport({ ...newReport, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={4}
                required
                placeholder="Describe what happened..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Weather Conditions"
                value={newReport.weatherConditions}
                onChange={(e) => setNewReport({ ...newReport, weatherConditions: e.target.value })}
                placeholder="e.g., Clear, Rainy, Foggy"
              />
              <Input
                label="Road Conditions"
                value={newReport.roadConditions}
                onChange={(e) => setNewReport({ ...newReport, roadConditions: e.target.value })}
                placeholder="e.g., Dry, Wet, Icy"
              />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Vehicle Damage</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Damage Description
                  </label>
                  <textarea
                    value={newReport.vehicleDamage.description}
                    onChange={(e) => setNewReport({
                      ...newReport,
                      vehicleDamage: { ...newReport.vehicleDamage, description: e.target.value }
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    required
                  />
                </div>
                <Input
                  label="Estimated Repair Cost"
                  type="number"
                  step="0.01"
                  value={newReport.vehicleDamage.estimatedCost}
                  onChange={(e) => setNewReport({
                    ...newReport,
                    vehicleDamage: { ...newReport.vehicleDamage, estimatedCost: e.target.value }
                  })}
                  placeholder="0.00"
                />
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={newReport.vehicleDamage.vehicleDrivable}
                    onChange={(e) => setNewReport({
                      ...newReport,
                      vehicleDamage: { ...newReport.vehicleDamage, vehicleDrivable: e.target.checked }
                    })}
                    className="rounded border-gray-300"
                  />
                  <span className="text-sm text-gray-700">Vehicle is drivable</span>
                </label>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-medium text-gray-900 mb-3">Police Report</h3>
              <label className="flex items-center space-x-2 mb-4">
                <input
                  type="checkbox"
                  checked={newReport.policeReportFiled}
                  onChange={(e) => setNewReport({
                    ...newReport,
                    policeReportFiled: e.target.checked
                  })}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Police report was filed</span>
              </label>
              {newReport.policeReportFiled && (
                <div className="space-y-4">
                  <Input
                    label="Report Number"
                    value={newReport.policeReportNumber}
                    onChange={(e) => setNewReport({ ...newReport, policeReportNumber: e.target.value })}
                  />
                  <Input
                    label="Police Department"
                    value={newReport.policeDepartment}
                    onChange={(e) => setNewReport({ ...newReport, policeDepartment: e.target.value })}
                  />
                  <Input
                    label="Officer Name"
                    value={newReport.officerName}
                    onChange={(e) => setNewReport({ ...newReport, officerName: e.target.value })}
                  />
                </div>
              )}
            </div>

            <Button type="submit">Submit Accident Report</Button>
          </form>
        </Card>
      )}

      {reports.length > 0 ? (
        <div className="grid gap-4">
          {reports.map((report) => {
            const car = typeof report.carId === 'object' ? report.carId : null;
            return (
              <Card key={report._id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {car ? `${car.year} ${car.make} ${car.model}` : 'Unknown Vehicle'}
                      </h3>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getSeverityColor(report.severity)}`}>
                        {report.severity}
                      </span>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(report.status)}`}>
                        {report.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(report.accidentDate).toLocaleDateString()} at {report.location}
                    </p>
                    <p className="text-sm text-gray-700 line-clamp-2">{report.description}</p>
                    {report.vehicleDamage.estimatedCost && (
                      <p className="text-sm font-medium text-gray-900 mt-2">
                        Estimated damage: ${report.vehicleDamage.estimatedCost.toLocaleString()}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => handleViewDetail(report)}>
                      View Details
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeleteReport(report._id)}
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
              <p className="text-gray-500 mb-4">No accident reports found.</p>
              <Button onClick={() => setShowCreateForm(true)}>Report Your First Accident</Button>
            </div>
          </Card>
        )
      )}
    </div>
  );
}
