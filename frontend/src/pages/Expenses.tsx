import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { expenseService } from '../services/expenseService';
import { carService } from '../services/carService';
import { Expense, ExpenseStatistics, Car } from '../types';

const expenseCategories = [
  'Fuel', 'Maintenance', 'Repair', 'Insurance', 'Registration',
  'Parking', 'Tolls', 'Car Wash', 'Tires', 'Accessories', 'Loan Payment', 'Other'
];

const Expenses: React.FC = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [selectedCarId, setSelectedCarId] = useState<string>('');
  const [statistics, setStatistics] = useState<ExpenseStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    carId: '',
    date: new Date().toISOString().slice(0, 10),
    category: 'Fuel',
    description: '',
    amount: 0,
    odometer: 0,
    vendor: '',
    paymentMethod: '',
    isRecurring: false,
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
      const [expensesData, carsData] = await Promise.all([
        expenseService.getExpenses(),
        carService.getCars(),
      ]);
      setExpenses(expensesData);
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
      const stats = await expenseService.getExpenseStatistics({ carId: selectedCarId });
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
      await expenseService.createExpense(formData);
      fetchData();
      if (formData.carId === selectedCarId) {
        fetchStatistics();
      }
      resetForm();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating expense');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(id);
        fetchData();
        fetchStatistics();
      } catch (error) {
        alert('Error deleting expense');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      carId: '',
      date: new Date().toISOString().slice(0, 10),
      category: 'Fuel',
      description: '',
      amount: 0,
      odometer: 0,
      vendor: '',
      paymentMethod: '',
      isRecurring: false,
      notes: '',
    });
    setShowForm(false);
  };

  const getCarDisplay = (carData: Car | string) => {
    if (typeof carData === 'string') return 'Unknown Car';
    return `${carData.year} ${carData.make} ${carData.model}`;
  };

  const filteredExpenses = selectedCarId
    ? expenses.filter(e => {
        const car = e.carId as any;
        return car._id === selectedCarId || e.carId === selectedCarId;
      })
    : expenses;

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
          <h1 className="text-3xl font-bold text-gray-900">Expenses</h1>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Add Expense'}
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

            {statistics && statistics.expenseCount > 0 && (
              <div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Spent</p>
                    <p className="text-2xl font-bold text-red-600">${statistics.totalAmount.toFixed(2)}</p>
                  </div>
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold text-blue-600">{statistics.expenseCount}</p>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-600">Average</p>
                    <p className="text-2xl font-bold text-green-600">${statistics.averageExpense.toFixed(2)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <h4 className="font-semibold mb-2">Category Breakdown</h4>
                  <div className="space-y-2">
                    {statistics.categoryBreakdown.map((cat) => (
                      <div key={cat.category} className="flex items-center">
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{cat.category}</span>
                            <span className="text-sm text-gray-600">${cat.amount.toFixed(2)} ({cat.percentage}%)</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-primary-600 h-2 rounded-full"
                              style={{ width: `${cat.percentage}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {showForm && (
          <Card className="mb-6" title="Add Expense">
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
                  label="Date *"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  required
                />
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    {expenseCategories.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Amount *"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                />
                <Input
                  label="Vendor (Optional)"
                  name="vendor"
                  value={formData.vendor}
                  onChange={handleChange}
                />
                <Input
                  label="Payment Method (Optional)"
                  name="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={handleChange}
                />
                <Input
                  label="Odometer (Optional)"
                  name="odometer"
                  type="number"
                  value={formData.odometer}
                  onChange={handleChange}
                  min="0"
                />
                <div className="mb-4 flex items-center">
                  <input
                    type="checkbox"
                    name="isRecurring"
                    checked={formData.isRecurring}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <label className="text-sm font-medium text-gray-700">Recurring Expense</label>
                </div>
              </div>
              <Input
                label="Description *"
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
              />
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
                <Button type="submit">Add Expense</Button>
                <Button type="button" variant="secondary" onClick={resetForm}>Cancel</Button>
              </div>
            </form>
          </Card>
        )}

        {filteredExpenses.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">💰</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No expenses yet</h3>
              <p className="text-gray-600 mb-4">Start tracking your car expenses</p>
              <Button onClick={() => setShowForm(true)}>Add First Expense</Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredExpenses.map((expense) => (
              <Card key={expense._id}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{expense.description}</h3>
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                        {expense.category}
                      </span>
                      {expense.isRecurring && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Recurring
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{getCarDisplay(expense.carId)}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <p className="font-medium">{new Date(expense.date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <span className="text-gray-600">Amount:</span>
                        <p className="font-medium text-lg text-red-600">${expense.amount.toFixed(2)}</p>
                      </div>
                      {expense.vendor && (
                        <div>
                          <span className="text-gray-600">Vendor:</span>
                          <p className="font-medium">{expense.vendor}</p>
                        </div>
                      )}
                      {expense.paymentMethod && (
                        <div>
                          <span className="text-gray-600">Payment:</span>
                          <p className="font-medium">{expense.paymentMethod}</p>
                        </div>
                      )}
                    </div>
                    {expense.notes && (
                      <p className="text-sm text-gray-700 mt-2">Notes: {expense.notes}</p>
                    )}
                  </div>
                  <Button variant="danger" onClick={() => handleDelete(expense._id)}>Delete</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Expenses;
