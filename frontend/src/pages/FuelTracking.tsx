import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { fuelEntryService } from '../services/fuelEntryService';
import { carService } from '../services/carService';
import { FuelEntry, FuelStatistics, Car } from '../types';

const fuelTypes = ['Regular', 'Mid-Grade', 'Premium', 'Diesel', 'Electric', 'Hybrid'];

const FuelTracking: React.FC = () => {
  const [entries, setEntries] = useState<FuelEntry[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [statistics, setStatistics] = useState<FuelStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    carId: '',
    date: new Date().toISOString().slice(0, 16),
    odometer: 0,
    quantity: 0,
    pricePerUnit: 0,
    fuelType: 'Regular',
    station: '',
    isFillUp: true,
    notes: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedCarId) {
      fetchStatistics();
    }
  }, [selectedCarId]);

  const fetchData = async () => {
    try {
      const [entriesData, carsData] = await Promise.all([
        fuelEntryService.getFuelEntries(),
        carService.getCars(),
      ]);
      setEntries(entriesData);
      setCars(carsData);
      if (carsData.length > 0 && !selectedCarId) {
        setSelectedCarId(carsData[0]._id);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    if (!selectedCarId) return;
    try {
      const stats = await fuelEntryService.getFuelStatistics(selectedCarId);
      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) :
      e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fuelEntryService.createFuelEntry(formData);
      fetchData();
      if (formData.carId === selectedCarId) {
        fetchStatistics();
      }
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating fuel entry');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      try {
        await fuelEntryService.deleteFuelEntry(id);
        fetchData();
        fetchStatistics();
      } catch (error) {
        alert('Error deleting fuel entry');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      carId: '',
      date: new Date().toISOString().slice(0, 16),
      odometer: 0,
      quantity: 0,
      pricePerUnit: 0,
      fuelType: 'Regular',
      station: '',
      isFillUp: true,
      notes: '',
    });
    setShowForm(false);
  };

  const getCarDisplay = (carData: Car | string) => {
    if (typeof carData === 'string') return 'Unknown Car';
    return `${carData.year} ${carData.make} ${carData.model}`;
  };

  const filteredEntries = selectedCarId
    ? entries.filter(e => {
        const car = e.carId as any;
        return car._id === selectedCarId || e.carId === selectedCarId;
      })
    : entries;

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
          <h1 className="text-3xl font-bold text-gray-900">Fuel Tracking</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Fuel Entry'}
          </Button>
        </div>

        {cars.length > 0 && (
          <Card className="mb-6">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Car</label>
              <select
                value={selectedCarId}
                onChange={(e) => setSelectedCarId(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                {cars.map((car) => (
                  <option key={car._id} value={car._id}>
                    {car.year} {car.make} {car.model} ({car.licensePlate})
                  </option>
                ))}
              </select>
            </div>

            {statistics && statistics.entriesCount >= 2 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Fuel Economy</p>
                  <p className="text-2xl font-bold text-blue-600">{statistics.averageFuelEconomy.toFixed(1)} MPG</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Spent</p>
                  <p className="text-2xl font-bold text-green-600">${statistics.totalSpent.toFixed(2)}</p>
                </div>
                <div className="text-center p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-gray-600">Total Fuel</p>
                  <p className="text-2xl font-bold text-purple-600">{statistics.totalFuel.toFixed(1)} gal</p>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <p className="text-sm text-gray-600">Avg Price/Unit</p>
                  <p className="text-2xl font-bold text-orange-600">${statistics.averagePricePerUnit.toFixed(2)}</p>
                </div>
              </div>
            )}
          </Card>
        )}

        {showForm && (
          <Card className="mb-6" title="Add Fuel Entry">
            <form onSubmit={handleSubmit}>
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
                    {cars.map((car) => (
                      <option key={car._id} value={car._id}>
                        {car.year} {car.make} {car.model} ({car.licensePlate})
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Date & Time *"
                  name="date"
                  type="datetime-local"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
                <Input
                  label="Odometer Reading *"
                  name="odometer"
                  type="number"
                  value={formData.odometer}
                  onChange={handleChange}
                  required
                  min="0"
                  step="1"
                />
                <Input
                  label="Quantity (gallons) *"
                  name="quantity"
                  type="number"
                  value={formData.quantity}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.001"
                />
                <Input
                  label="Price per Unit *"
                  name="pricePerUnit"
                  type="number"
                  value={formData.pricePerUnit}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.001"
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fuel Type *</label>
                  <select
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {fuelTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Gas Station (Optional)"
                  name="station"
                  value={formData.station}
                  onChange={handleChange}
                />
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    name="isFillUp"
                    checked={formData.isFillUp}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Full Tank Fill-up</label>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Add Entry</Button>
                <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {filteredEntries.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">⛽</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No fuel entries yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your fuel consumption</p>
              <Button onClick={() => setShowForm(true)}>Add First Entry</Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map((entry) => (
              <Card key={entry._id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">{getCarDisplay(entry.carId)}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {entry.fuelType}
                      </span>
                      {entry.isFillUp && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Full Tank
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm mb-2">
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <p className="font-medium">{new Date(entry.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Odometer:</span>
                        <p className="font-medium">{entry.odometer.toLocaleString()} mi</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Quantity:</span>
                        <p className="font-medium">{entry.quantity.toFixed(2)} gal</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Price/Unit:</span>
                        <p className="font-medium">${entry.pricePerUnit.toFixed(3)}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Total Cost:</span>
                        <p className="font-medium text-lg text-primary-600">${entry.totalCost.toFixed(2)}</p>
                      </div>
                    </div>
                    {entry.station && (
                      <p className="text-sm text-gray-600">Station: {entry.station}</p>
                    )}
                    {entry.notes && (
                      <p className="text-sm text-gray-700 mt-2">Notes: {entry.notes}</p>
                    )}
                  </div>
                  <Button variant="danger" onClick={() => handleDelete(entry._id)}>Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default FuelTracking;
