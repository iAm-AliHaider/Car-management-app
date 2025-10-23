import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { carService } from '../services/carService';
import { Car } from '../types';

const Cars: React.FC = () => {
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    licensePlate: '',
    vin: '',
    color: '',
    mileage: 0,
  });

  useEffect(() => {
    fetchCars();
  }, []);

  const fetchCars = async () => {
    try {
      const data = await carService.getCars();
      setCars(data);
    } catch (error) {
      console.error('Error fetching cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.type === 'number' ? Number(e.target.value) : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCar) {
        await carService.updateCar(editingCar._id, formData);
      } else {
        await carService.createCar(formData);
      }
      fetchCars();
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error saving car');
    }
  };

  const handleEdit = (car: Car) => {
    setEditingCar(car);
    setFormData({
      make: car.make,
      model: car.model,
      year: car.year,
      licensePlate: car.licensePlate,
      vin: car.vin || '',
      color: car.color || '',
      mileage: car.mileage || 0,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this car?')) {
      try {
        await carService.deleteCar(id);
        fetchCars();
      } catch (error) {
        alert('Error deleting car');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      make: '',
      model: '',
      year: new Date().getFullYear(),
      licensePlate: '',
      vin: '',
      color: '',
      mileage: 0,
    });
    setEditingCar(null);
    setShowForm(false);
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
          <h1 className="text-3xl font-bold text-gray-900">My Cars</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add New Car'}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6" title={editingCar ? 'Edit Car' : 'Add New Car'}>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Make"
                  name="make"
                  value={formData.make}
                  onChange={handleChange}
                  required
                  placeholder="Toyota"
                />
                <Input
                  label="Model"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  placeholder="Camry"
                />
                <Input
                  label="Year"
                  name="year"
                  type="number"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                />
                <Input
                  label="License Plate"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  required
                  placeholder="ABC123"
                />
                <Input
                  label="VIN (Optional)"
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  placeholder="1HGBH41JXMN109186"
                />
                <Input
                  label="Color (Optional)"
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  placeholder="Blue"
                />
                <Input
                  label="Mileage (Optional)"
                  name="mileage"
                  type="number"
                  value={formData.mileage}
                  onChange={handleChange}
                  min="0"
                  placeholder="50000"
                />
              </div>
              <div className="mt-4 flex gap-2">
                <Button type="submit">
                  {editingCar ? 'Update Car' : 'Add Car'}
                </Button>
                <Button type="button" variant="secondary" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        {cars.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚗</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No cars yet</h3>
              <p className="text-gray-600 mb-4">Add your first car to get started</p>
              <Button onClick={() => setShowForm(true)}>Add New Car</Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cars.map((car) => (
              <Card key={car._id}>
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {car.year} {car.make} {car.model}
                  </h3>
                  <p className="text-gray-600 text-sm mt-1">{car.licensePlate}</p>
                </div>
                <div className="space-y-2 mb-4 text-sm">
                  {car.color && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Color:</span>
                      <span className="font-medium">{car.color}</span>
                    </div>
                  )}
                  {car.mileage !== undefined && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Mileage:</span>
                      <span className="font-medium">{car.mileage.toLocaleString()} miles</span>
                    </div>
                  )}
                  {car.vin && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">VIN:</span>
                      <span className="font-medium text-xs">{car.vin}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" className="flex-1" onClick={() => handleEdit(car)}>
                    Edit
                  </Button>
                  <Button variant="danger" className="flex-1" onClick={() => handleDelete(car._id)}>
                    Delete
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

export default Cars;
