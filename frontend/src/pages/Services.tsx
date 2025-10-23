import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { serviceBookingService } from '../services/serviceBookingService';
import { carService } from '../services/carService';
import { ServiceBooking, Car } from '../types';

const serviceTypes = [
  'Oil Change',
  'Tire Rotation',
  'Brake Service',
  'Engine Repair',
  'Transmission Service',
  'Battery Replacement',
  'Air Conditioning',
  'General Maintenance',
  'Inspection',
  'Other'
];

const Services: React.FC = () => {
  const [bookings, setBookings] = useState<ServiceBooking[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    carId: '',
    serviceType: 'Oil Change',
    description: '',
    scheduledDate: '',
    serviceProvider: '',
    estimatedCost: 0,
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsData, carsData] = await Promise.all([
        serviceBookingService.getServiceBookings(),
        carService.getCars(),
      ]);
      setBookings(bookingsData);
      setCars(carsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await serviceBookingService.createServiceBooking(formData);
      fetchData();
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating booking');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await serviceBookingService.deleteServiceBooking(id);
        fetchData();
      } catch (error) {
        alert('Error cancelling booking');
      }
    }
  };

  const handleStatusUpdate = async (id: string, status: string) => {
    try {
      await serviceBookingService.updateServiceBooking(id, { status });
      fetchData();
    } catch (error) {
      alert('Error updating status');
    }
  };

  const resetForm = () => {
    setFormData({
      carId: '',
      serviceType: 'Oil Change',
      description: '',
      scheduledDate: '',
      serviceProvider: '',
      estimatedCost: 0,
      notes: '',
    });
    setShowForm(false);
  };

  const getCarDisplay = (carData: Car | string) => {
    if (typeof carData === 'string') return 'Unknown Car';
    return `${carData.year} ${carData.make} ${carData.model} (${carData.licensePlate})`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl text-gray-600">Loading...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Service Bookings</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Book New Service'}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6" title="Book New Service">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Car</label>
                  <select
                    name="carId"
                    value={formData.carId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    <option value="">Select a car</option>
                    {cars.map((car) => (
                      <option key={car._id} value={car._id}>
                        {car.year} {car.make} {car.model} ({car.licensePlate})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                  <select
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  >
                    {serviceTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Scheduled Date"
                  name="scheduledDate"
                  type="datetime-local"
                  value={formData.scheduledDate}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Service Provider (Optional)"
                  name="serviceProvider"
                  value={formData.serviceProvider}
                  onChange={handleChange}
                  placeholder="Auto Shop Name"
                />
                <Input
                  label="Estimated Cost (Optional)"
                  name="estimatedCost"
                  type="number"
                  value={formData.estimatedCost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Describe the service needed..."
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Additional notes..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Book Service</Button>
                <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {bookings.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No service bookings yet</h3>
              <p className="text-gray-600 mb-4">Schedule your first service</p>
              <Button onClick={() => setShowForm(true)}>Book New Service</Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking._id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{booking.serviceType}</h3>
                      <select
                        value={booking.status}
                        onChange={(e) => handleStatusUpdate(booking._id, e.target.value)}
                        className="px-2 py-1 rounded-full text-xs font-medium border-0 focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </div>
                    <p className="text-gray-600 mb-2">{getCarDisplay(booking.carId)}</p>
                    <p className="text-sm text-gray-700 mb-3">{booking.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Scheduled:</span>
                        <p className="font-medium">{new Date(booking.scheduledDate).toLocaleString()}</p>
                      </div>
                      {booking.serviceProvider && (
                        <div>
                          <span className="text-gray-600">Provider:</span>
                          <p className="font-medium">{booking.serviceProvider}</p>
                        </div>
                      )}
                      {booking.estimatedCost !== undefined && booking.estimatedCost > 0 && (
                        <div>
                          <span className="text-gray-600">Est. Cost:</span>
                          <p className="font-medium">${booking.estimatedCost.toFixed(2)}</p>
                        </div>
                      )}
                      {booking.actualCost !== undefined && booking.actualCost > 0 && (
                        <div>
                          <span className="text-gray-600">Actual Cost:</span>
                          <p className="font-medium">${booking.actualCost.toFixed(2)}</p>
                        </div>
                      )}
                    </div>
                    {booking.notes && (
                      <div className="mt-3 text-sm">
                        <span className="text-gray-600">Notes:</span>
                        <p className="text-gray-700">{booking.notes}</p>
                      </div>
                    )}
                  </div>
                  <Button variant="danger" onClick={() => handleDelete(booking._id)}>
                    Cancel
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Services;
