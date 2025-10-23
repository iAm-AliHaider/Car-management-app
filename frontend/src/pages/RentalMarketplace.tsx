import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { carRentalService } from '../services/carRentalService';
import { rentalBookingService } from '../services/rentalBookingService';
import { CarRental, Car, User } from '../types';

const RentalMarketplace: React.FC = () => {
  const [rentals, setRentals] = useState<CarRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState<CarRental | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [searchLocation, setSearchLocation] = useState('');
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    pickupLocation: '',
    dropoffLocation: '',
    accessLevel: 'view-only' as 'view-only' | 'full-access',
    paymentMethod: '',
    notes: '',
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const data = await carRentalService.getAvailableRentals();
      setRentals(data);
    } catch (error) {
      console.error('Error fetching rentals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const data = await carRentalService.getAvailableRentals({ location: searchLocation });
      setRentals(data);
    } catch (error) {
      console.error('Error searching rentals:', error);
    }
  };

  const handleBookNow = (rental: CarRental) => {
    setSelectedRental(rental);
    setFormData({
      ...formData,
      pickupLocation: rental.location,
    });
    setShowBookingForm(true);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRental) return;

    try {
      await rentalBookingService.createRentalRequest({
        carRentalId: selectedRental._id,
        ...formData,
      });
      alert('Rental request sent successfully!');
      setShowBookingForm(false);
      setSelectedRental(null);
      navigate('/rental-bookings');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating rental request');
    }
  };

  const getCarDisplay = (carData: Car | string) => {
    if (typeof carData === 'string') return 'Car';
    return `${carData.year} ${carData.make} ${carData.model}`;
  };

  const getOwnerDisplay = (ownerData: User | string) => {
    if (typeof ownerData === 'string') return 'Owner';
    return ownerData.name;
  };

  const getPrice = (rental: CarRental) => {
    switch (rental.rentalType) {
      case 'hourly': return `$${rental.pricePerHour}/hr`;
      case 'daily': return `$${rental.pricePerDay}/day`;
      case 'weekly': return `$${rental.pricePerWeek}/week`;
      case 'monthly': return `$${rental.pricePerMonth}/month`;
      default: return 'Price not set';
    }
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Rental Marketplace</h1>

        <Card className="mb-6">
          <div className="flex gap-4">
            <Input
              placeholder="Search by location..."
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              className="flex-1"
            />
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </Card>

        {showBookingForm && selectedRental && (
          <Card className="mb-6" title="Book This Car">
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <h4 className="font-semibold text-lg mb-2">
                  {getCarDisplay(selectedRental.carId)}
                </h4>
                <p className="text-gray-600">{getPrice(selectedRental)}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Start Date *"
                  name="startDate"
                  type="datetime-local"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="End Date *"
                  name="endDate"
                  type="datetime-local"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Pickup Location *"
                  name="pickupLocation"
                  value={formData.pickupLocation}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Drop-off Location (Optional)"
                  name="dropoffLocation"
                  value={formData.dropoffLocation}
                  onChange={handleChange}
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Access Level *</label>
                  <select
                    name="accessLevel"
                    value={formData.accessLevel}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="view-only">View Only</option>
                    <option value="full-access">Full Access</option>
                  </select>
                </div>
                <Input
                  label="Payment Method (Optional)"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="Add any special requests or notes..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Send Rental Request</Button>
                <Button type="button" variant="secondary" onClick={() => setShowBookingForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {rentals.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No cars available for rent</h3>
              <p className="text-gray-600">Check back later or try a different location</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rentals.map((rental) => (
              <Card key={rental._id}>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {getCarDisplay(rental.carId)}
                  </h3>
                  <p className="text-sm text-gray-600">Owner: {getOwnerDisplay(rental.ownerId)}</p>
                </div>

                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-primary-600 text-lg">{getPrice(rental)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span className="font-medium">{rental.location}</span>
                  </div>
                  {rental.rating && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <span className="font-medium">⭐ {rental.rating.toFixed(1)}/5</span>
                    </div>
                  )}
                  {rental.totalRentals > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Rentals:</span>
                      <span className="font-medium">{rental.totalRentals}</span>
                    </div>
                  )}
                </div>

                {rental.features && rental.features.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Features:</p>
                    <div className="flex flex-wrap gap-1">
                      {rental.features.map((feature, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2 text-xs text-gray-600 mb-4">
                  {rental.insurance && <p>✓ Insurance included</p>}
                  {rental.securityDeposit && <p>Security deposit: ${rental.securityDeposit}</p>}
                  {rental.mileageLimit && <p>Mileage limit: {rental.mileageLimit} miles/day</p>}
                </div>

                <Button className="w-full" onClick={() => handleBookNow(rental)}>
                  Book Now
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RentalMarketplace;
