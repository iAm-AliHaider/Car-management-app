import { useState, useEffect } from 'react';
import { fleetService } from '../services/fleetService';
import { serviceBookingService } from '../services/serviceBookingService';
import { Fleet, ServiceBooking, Car } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

export default function FleetServices() {
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null);
  const [services, setServices] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBulkScheduleForm, setShowBulkScheduleForm] = useState(false);
  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);
  const [bulkServiceData, setBulkServiceData] = useState({
    serviceType: '',
    description: '',
    scheduledDate: '',
    serviceProvider: '',
    estimatedCost: ''
  });

  useEffect(() => {
    fetchFleets();
  }, []);

  useEffect(() => {
    if (selectedFleet) {
      fetchFleetServices();
    }
  }, [selectedFleet]);

  const fetchFleets = async () => {
    try {
      setLoading(true);
      const data = await fleetService.getFleets();
      setFleets(data);
      if (data.length > 0 && !selectedFleet) {
        setSelectedFleet(data[0]);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch fleets');
    } finally {
      setLoading(false);
    }
  };

  const fetchFleetServices = async () => {
    if (!selectedFleet) return;
    try {
      const allServices = await serviceBookingService.getServiceBookings();
      // Filter services for vehicles in this fleet
      const vehicleIds = selectedFleet.vehicles.map(v => typeof v === 'string' ? v : v._id);
      const fleetServices = allServices.filter(service => {
        const carId = typeof service.carId === 'string' ? service.carId : service.carId._id;
        return vehicleIds.includes(carId);
      });
      setServices(fleetServices);
    } catch (err: any) {
      console.error('Failed to fetch services:', err);
    }
  };

  const handleBulkSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFleet || selectedVehicles.length === 0) {
      setError('Please select at least one vehicle');
      return;
    }

    try {
      // Schedule service for each selected vehicle
      const promises = selectedVehicles.map(carId =>
        serviceBookingService.createServiceBooking({
          carId,
          serviceType: bulkServiceData.serviceType,
          description: bulkServiceData.description,
          scheduledDate: bulkServiceData.scheduledDate,
          serviceProvider: bulkServiceData.serviceProvider,
          estimatedCost: bulkServiceData.estimatedCost ? Number(bulkServiceData.estimatedCost) : undefined
        })
      );

      await Promise.all(promises);

      // Reset form
      setBulkServiceData({
        serviceType: '',
        description: '',
        scheduledDate: '',
        serviceProvider: '',
        estimatedCost: ''
      });
      setSelectedVehicles([]);
      setShowBulkScheduleForm(false);
      fetchFleetServices();
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to schedule services');
    }
  };

  const handleCancelService = async (serviceId: string) => {
    if (!confirm('Cancel this service booking?')) return;
    try {
      await serviceBookingService.updateServiceBooking(serviceId, { status: 'cancelled' });
      fetchFleetServices();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel service');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'confirmed': 'bg-blue-100 text-blue-800',
      'in-progress': 'bg-purple-100 text-purple-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getServicesByStatus = (status: string) => {
    return services.filter(s => s.status === status);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading fleet services...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Fleet Services</h1>
        <Button onClick={() => setShowBulkScheduleForm(!showBulkScheduleForm)}>
          {showBulkScheduleForm ? 'Cancel' : 'Bulk Schedule Service'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Fleet Selector */}
      {fleets.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Fleet</label>
          <select
            value={selectedFleet?._id || ''}
            onChange={(e) => {
              const fleet = fleets.find(f => f._id === e.target.value);
              setSelectedFleet(fleet || null);
            }}
            className="w-full md:w-96 px-3 py-2 border border-gray-300 rounded-md"
          >
            {fleets.map((fleet) => (
              <option key={fleet._id} value={fleet._id}>
                {fleet.name} ({fleet.totalVehicles} vehicles)
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Bulk Schedule Form */}
      {showBulkScheduleForm && selectedFleet && (
        <Card title="Bulk Schedule Service">
          <form onSubmit={handleBulkSchedule} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Vehicles ({selectedVehicles.length} selected)
              </label>
              <div className="space-y-2 max-h-60 overflow-y-auto border border-gray-200 rounded-md p-3">
                {selectedFleet.vehicles.map((vehicle) => {
                  const car = typeof vehicle === 'object' ? vehicle : null;
                  if (!car) return null;
                  return (
                    <label key={car._id} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedVehicles.includes(car._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedVehicles([...selectedVehicles, car._id]);
                          } else {
                            setSelectedVehicles(selectedVehicles.filter(id => id !== car._id));
                          }
                        }}
                        className="rounded border-gray-300"
                      />
                      <span>{car.year} {car.make} {car.model} - {car.licensePlate}</span>
                    </label>
                  );
                })}
              </div>
              <button
                type="button"
                onClick={() => {
                  const allVehicleIds = selectedFleet.vehicles
                    .map(v => typeof v === 'object' ? v._id : v)
                    .filter(Boolean);
                  setSelectedVehicles(
                    selectedVehicles.length === allVehicleIds.length ? [] : allVehicleIds
                  );
                }}
                className="mt-2 text-sm text-blue-600 hover:text-blue-700"
              >
                {selectedVehicles.length === selectedFleet.vehicles.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <Input
              label="Service Type"
              value={bulkServiceData.serviceType}
              onChange={(e) => setBulkServiceData({ ...bulkServiceData, serviceType: e.target.value })}
              required
              placeholder="e.g., Oil Change, Tire Rotation"
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={bulkServiceData.description}
                onChange={(e) => setBulkServiceData({ ...bulkServiceData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                required
              />
            </div>

            <Input
              label="Scheduled Date"
              type="date"
              value={bulkServiceData.scheduledDate}
              onChange={(e) => setBulkServiceData({ ...bulkServiceData, scheduledDate: e.target.value })}
              required
            />

            <Input
              label="Service Provider"
              value={bulkServiceData.serviceProvider}
              onChange={(e) => setBulkServiceData({ ...bulkServiceData, serviceProvider: e.target.value })}
              placeholder="e.g., AutoCare Center"
            />

            <Input
              label="Estimated Cost (per vehicle)"
              type="number"
              step="0.01"
              value={bulkServiceData.estimatedCost}
              onChange={(e) => setBulkServiceData({ ...bulkServiceData, estimatedCost: e.target.value })}
              placeholder="0.00"
            />

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                This will schedule <strong>{selectedVehicles.length}</strong> service booking(s).
                {bulkServiceData.estimatedCost && (
                  <> Total estimated cost: <strong>${(Number(bulkServiceData.estimatedCost) * selectedVehicles.length).toFixed(2)}</strong></>
                )}
              </p>
            </div>

            <Button type="submit" disabled={selectedVehicles.length === 0}>
              Schedule Services
            </Button>
          </form>
        </Card>
      )}

      {/* Services Summary */}
      {selectedFleet && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Services</p>
              <p className="text-3xl font-bold text-gray-900">{services.length}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-3xl font-bold text-yellow-600">{getServicesByStatus('pending').length}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600">Confirmed</p>
              <p className="text-3xl font-bold text-blue-600">{getServicesByStatus('confirmed').length}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-3xl font-bold text-purple-600">{getServicesByStatus('in-progress').length}</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-3xl font-bold text-green-600">{getServicesByStatus('completed').length}</p>
            </div>
          </Card>
        </div>
      )}

      {/* Services List */}
      {selectedFleet && services.length > 0 && (
        <Card title="Scheduled Services">
          <div className="space-y-4">
            {services.map((service) => {
              const car = typeof service.carId === 'object' ? service.carId : null;
              return (
                <div key={service._id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{service.serviceType}</h3>
                        <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusColor(service.status)}`}>
                          {service.status}
                        </span>
                      </div>
                      {car && (
                        <p className="text-sm text-gray-600 mt-1">
                          {car.year} {car.make} {car.model} - {car.licensePlate}
                        </p>
                      )}
                      <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                      <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-gray-600">Scheduled:</span>{' '}
                          <span className="font-medium">
                            {new Date(service.scheduledDate).toLocaleDateString()}
                          </span>
                        </div>
                        {service.serviceProvider && (
                          <div>
                            <span className="text-gray-600">Provider:</span>{' '}
                            <span className="font-medium">{service.serviceProvider}</span>
                          </div>
                        )}
                        {service.estimatedCost && (
                          <div>
                            <span className="text-gray-600">Estimated:</span>{' '}
                            <span className="font-medium">${service.estimatedCost}</span>
                          </div>
                        )}
                        {service.actualCost && (
                          <div>
                            <span className="text-gray-600">Actual:</span>{' '}
                            <span className="font-medium">${service.actualCost}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {service.status !== 'completed' && service.status !== 'cancelled' && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleCancelService(service._id)}
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {selectedFleet && services.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No services scheduled for this fleet yet.</p>
            <Button onClick={() => setShowBulkScheduleForm(true)}>Schedule First Service</Button>
          </div>
        </Card>
      )}

      {fleets.length === 0 && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500">No fleets found. Create a fleet first to manage services.</p>
          </div>
        </Card>
      )}
    </div>
  );
}
