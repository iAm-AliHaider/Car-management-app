import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { rentalBookingService } from '../services/rentalBookingService';
import { carRentalService } from '../services/carRentalService';
import { carService } from '../services/carService';
import { RentalBooking, CarRental, Car, User } from '../types';

const RentalBookings: React.FC = () => {
  const [bookings, setBookings] = useState<RentalBooking[]>([]);
  const [myListings, setMyListings] = useState<CarRental[]>([]);
  const [myCars, setMyCars] = useState<Car[]>([]);
  const [activeTab, setActiveTab] = useState<'myBookings' | 'requests' | 'myListings'>('myBookings');
  const [loading, setLoading] = useState(true);
  const [showListingForm, setShowListingForm] = useState(false);
  const [formData, setFormData] = useState({
    carId: '',
    rentalType: 'daily' as 'hourly' | 'daily' | 'weekly' | 'monthly',
    pricePerDay: 0,
    location: '',
    minimumRentalPeriod: 1,
    maximumRentalPeriod: 30,
    termsAndConditions: '',
    insurance: false,
    securityDeposit: 0,
    mileageLimit: 150,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsData, listingsData, carsData] = await Promise.all([
        rentalBookingService.getRentalBookings(),
        carRentalService.getMyListings(),
        carService.getCars(),
      ]);
      setBookings(bookingsData);
      setMyListings(listingsData);
      setMyCars(carsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const myBookingsAsRenter = bookings.filter(b => typeof b.renterId !== 'string');
  const requestsAsOwner = bookings.filter(b => typeof b.ownerId !== 'string');

  const handleApprove = async (id: string) => {
    if (window.confirm('Approve this rental request?')) {
      try {
        await rentalBookingService.approveRequest(id);
        fetchData();
        alert('Request approved!');
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error approving request');
      }
    }
  };

  const handleReject = async (id: string) => {
    const reason = window.prompt('Reason for rejection (optional):');
    try {
      await rentalBookingService.rejectRequest(id, reason || '');
      fetchData();
      alert('Request rejected');
    } catch (error) {
      alert('Error rejecting request');
    }
  };

  const handleStartRental = async (id: string) => {
    const mileageStr = window.prompt('Enter starting mileage:');
    if (!mileageStr) return;
    const mileage = parseInt(mileageStr);
    if (isNaN(mileage)) {
      alert('Invalid mileage');
      return;
    }
    try {
      await rentalBookingService.startRental(id, mileage);
      fetchData();
      alert('Rental started!');
    } catch (error) {
      alert('Error starting rental');
    }
  };

  const handleCompleteRental = async (id: string) => {
    const mileageStr = window.prompt('Enter ending mileage:');
    if (!mileageStr) return;
    const mileage = parseInt(mileageStr);
    if (isNaN(mileage)) {
      alert('Invalid mileage');
      return;
    }
    try {
      await rentalBookingService.completeRental(id, mileage);
      fetchData();
      alert('Rental completed!');
    } catch (error) {
      alert('Error completing rental');
    }
  };

  const handleCancel = async (id: string) => {
    const reason = window.prompt('Reason for cancellation (optional):');
    try {
      await rentalBookingService.cancelBooking(id, reason || '');
      fetchData();
      alert('Booking cancelled');
    } catch (error) {
      alert('Error cancelling booking');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) :
      e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmitListing = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await carRentalService.createListing(formData);
      fetchData();
      setShowListingForm(false);
      alert('Car listed successfully!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error listing car');
    }
  };

  const handleDelistCar = async (id: string) => {
    if (window.confirm('Remove this car from rental listings?')) {
      try {
        await carRentalService.deleteListing(id);
        fetchData();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error delisting car');
      }
    }
  };

  const getCarDisplay = (carData: Car | string) => {
    if (typeof carData === 'string') return 'Car';
    return `${carData.year} ${carData.make} ${carData.model}`;
  };

  const getUserDisplay = (userData: User | string) => {
    if (typeof userData === 'string') return 'User';
    return userData.name;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'approved': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
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

  const availableCars = myCars.filter(car => !myListings.some(listing => {
    const listingCarId = typeof listing.carId === 'string' ? listing.carId : listing.carId._id;
    return listingCarId === car._id;
  }));

  return (
    <Layout>
      <div className="px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">My Rentals</h1>

        <div className="flex border-b border-gray-300 mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'myBookings'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('myBookings')}
          >
            My Bookings ({myBookingsAsRenter.length})
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'requests'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('requests')}
          >
            Rental Requests ({requestsAsOwner.length})
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'myListings'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('myListings')}
          >
            My Listings ({myListings.length})
          </button>
        </div>

        {activeTab === 'myListings' && (
          <div className="mb-6">
            <Button onClick={() => setShowListingForm(!showListingForm)}>
              {showListingForm ? 'Cancel' : 'List a Car for Rent'}
            </Button>
          </div>
        )}

        {showListingForm && activeTab === 'myListings' && (
          <Card className="mb-6" title="List Car for Rent">
            <form onSubmit={handleSubmitListing}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Select Car *</label>
                  <select
                    name="carId"
                    value={formData.carId}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="">Select a car</option>
                    {availableCars.map((car) => (
                      <option key={car._id} value={car._id}>
                        {car.year} {car.make} {car.model} ({car.licensePlate})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rental Type *</label>
                  <select
                    name="rentalType"
                    value={formData.rentalType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
                <Input
                  label="Price per Day *"
                  name="pricePerDay"
                  type="number"
                  value={formData.pricePerDay}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
                <Input
                  label="Location *"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Min Rental Period (days)"
                  name="minimumRentalPeriod"
                  type="number"
                  value={formData.minimumRentalPeriod}
                  onChange={handleChange}
                  min="1"
                />
                <Input
                  label="Max Rental Period (days)"
                  name="maximumRentalPeriod"
                  type="number"
                  value={formData.maximumRentalPeriod}
                  onChange={handleChange}
                  min="1"
                />
                <Input
                  label="Security Deposit"
                  name="securityDeposit"
                  type="number"
                  value={formData.securityDeposit}
                  onChange={handleChange}
                  min="0"
                />
                <Input
                  label="Daily Mileage Limit"
                  name="mileageLimit"
                  type="number"
                  value={formData.mileageLimit}
                  onChange={handleChange}
                  min="0"
                />
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    name="insurance"
                    checked={formData.insurance}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Insurance Included</label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Terms & Conditions</label>
                <textarea
                  name="termsAndConditions"
                  value={formData.termsAndConditions}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <Button type="submit">List Car</Button>
            </form>
          </Card>
        )}

        {activeTab === 'myBookings' && (
          <div className="space-y-4">
            {myBookingsAsRenter.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📋</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No bookings yet</h3>
                  <p className="text-gray-600 mb-4">Start by browsing available cars</p>
                  <Button onClick={() => window.location.href = '/rental-marketplace'}>
                    Browse Cars
                  </Button>
                </div>
              </Card>
            ) : (
              myBookingsAsRenter.map((booking) => (
                <Card key={booking._id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">{getCarDisplay(booking.carId)}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">Owner: {getUserDisplay(booking.ownerId)}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Pickup:</span>
                          <p className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Return:</span>
                          <p className="font-medium">{new Date(booking.endDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Total Cost:</span>
                          <p className="font-medium text-lg text-primary-600">${booking.totalCost.toFixed(2)}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Access:</span>
                          <p className="font-medium">{booking.accessLevel}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {(booking.status === 'pending' || booking.status === 'approved') && (
                        <Button variant="danger" onClick={() => handleCancel(booking._id)}>Cancel</Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'requests' && (
          <div className="space-y-4">
            {requestsAsOwner.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <p className="text-gray-600">No rental requests yet</p>
                </div>
              </Card>
            ) : (
              requestsAsOwner.map((booking) => (
                <Card key={booking._id}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-bold">{getCarDisplay(booking.carId)}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </div>
                      <p className="text-gray-600 mb-2">Renter: {getUserDisplay(booking.renterId)}</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">Start:</span>
                          <p className="font-medium">{new Date(booking.startDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">End:</span>
                          <p className="font-medium">{new Date(booking.endDate).toLocaleDateString()}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Duration:</span>
                          <p className="font-medium">{booking.rentalDuration} days</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Total:</span>
                          <p className="font-medium text-primary-600">${booking.totalCost.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <>
                          <Button onClick={() => handleApprove(booking._id)}>Approve</Button>
                          <Button variant="danger" onClick={() => handleReject(booking._id)}>Reject</Button>
                        </>
                      )}
                      {booking.status === 'approved' && (
                        <Button onClick={() => handleStartRental(booking._id)}>Start Rental</Button>
                      )}
                      {booking.status === 'active' && (
                        <Button onClick={() => handleCompleteRental(booking._id)}>Complete</Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'myListings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myListings.map((listing) => (
              <Card key={listing._id}>
                <div className="mb-4">
                  <h3 className="text-xl font-bold mb-1">{getCarDisplay(listing.carId)}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    listing.currentStatus === 'available' ? 'bg-green-100 text-green-800' :
                    listing.currentStatus === 'rented' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {listing.currentStatus}
                  </span>
                </div>
                <div className="space-y-2 text-sm mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold">${listing.pricePerDay}/day</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Location:</span>
                    <span>{listing.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Rentals:</span>
                    <span>{listing.totalRentals}</span>
                  </div>
                  {listing.rating && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Rating:</span>
                      <span>⭐ {listing.rating.toFixed(1)}/5</span>
                    </div>
                  )}
                </div>
                <Button variant="danger" className="w-full" onClick={() => handleDelistCar(listing._id)}>
                  Delist Car
                </Button>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default RentalBookings;
