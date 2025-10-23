import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import { sparePartService } from '../services/sparePartService';
import { carService } from '../services/carService';
import { partOrderService } from '../services/partOrderService';
import { SparePart, Car } from '../types';

const Parts: React.FC = () => {
  const [parts, setParts] = useState<SparePart[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [cart, setCart] = useState<{ [key: string]: number }>({});
  const [showCheckout, setShowCheckout] = useState(false);
  const [shippingAddress, setShippingAddress] = useState('');
  const [selectedCarId, setSelectedCarId] = useState('');

  const navigate = useNavigate();

  const categories = [
    'Engine',
    'Transmission',
    'Brakes',
    'Suspension',
    'Electrical',
    'Body',
    'Interior',
    'Exhaust',
    'Filters',
    'Fluids',
    'Other'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [partsData, carsData] = await Promise.all([
        sparePartService.getSpareParts(),
        carService.getCars(),
      ]);
      setParts(partsData);
      setCars(carsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const data = await sparePartService.getSpareParts({
        search: searchTerm,
        category: selectedCategory,
      });
      setParts(data);
    } catch (error) {
      console.error('Error searching parts:', error);
    }
  };

  const addToCart = (partId: string) => {
    setCart({ ...cart, [partId]: (cart[partId] || 0) + 1 });
  };

  const removeFromCart = (partId: string) => {
    const newCart = { ...cart };
    if (newCart[partId] > 1) {
      newCart[partId]--;
    } else {
      delete newCart[partId];
    }
    setCart(newCart);
  };

  const getCartTotal = () => {
    return parts.reduce((total, part) => {
      const quantity = cart[part._id] || 0;
      return total + (part.price * quantity);
    }, 0);
  };

  const getCartItemCount = () => {
    return Object.values(cart).reduce((sum, qty) => sum + qty, 0);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.keys(cart).length === 0) {
      alert('Cart is empty');
      return;
    }

    if (!shippingAddress) {
      alert('Please enter a shipping address');
      return;
    }

    try {
      const items = Object.entries(cart).map(([partId, quantity]) => ({
        partId,
        quantity,
      }));

      await partOrderService.createPartOrder({
        carId: selectedCarId || undefined,
        items,
        shippingAddress,
      });

      alert('Order placed successfully!');
      setCart({});
      setShowCheckout(false);
      setShippingAddress('');
      setSelectedCarId('');
      navigate('/orders');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error placing order');
    }
  };

  const filteredParts = parts.filter((part) => {
    const matchesSearch = searchTerm === '' ||
      part.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      part.description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = selectedCategory === '' || part.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">Spare Parts</h1>
          <div className="relative">
            <Button onClick={() => setShowCheckout(!showCheckout)}>
              Cart ({getCartItemCount()}) - ${getCartTotal().toFixed(2)}
            </Button>
          </div>
        </div>

        {showCheckout && (
          <Card className="mb-6" title="Checkout">
            <form onSubmit={handleCheckout}>
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Order Summary</h4>
                <div className="space-y-2">
                  {Object.entries(cart).map(([partId, quantity]) => {
                    const part = parts.find((p) => p._id === partId);
                    if (!part) return null;
                    return (
                      <div key={partId} className="flex justify-between items-center py-2 border-b">
                        <div>
                          <p className="font-medium">{part.name}</p>
                          <p className="text-sm text-gray-600">
                            ${part.price.toFixed(2)} x {quantity}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">${(part.price * quantity).toFixed(2)}</span>
                          <Button
                            type="button"
                            variant="danger"
                            className="text-xs px-2 py-1"
                            onClick={() => removeFromCart(partId)}
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex justify-between items-center pt-2 font-bold text-lg">
                    <span>Total:</span>
                    <span>${getCartTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Car (Optional)
                </label>
                <select
                  value={selectedCarId}
                  onChange={(e) => setSelectedCarId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">No specific car</option>
                  {cars.map((car) => (
                    <option key={car._id} value={car._id}>
                      {car.year} {car.make} {car.model} ({car.licensePlate})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Shipping Address *
                </label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Enter your shipping address..."
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Place Order</Button>
                <Button type="button" variant="secondary" onClick={() => setShowCheckout(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        )}

        <Card className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Search parts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <Button onClick={handleSearch}>Search</Button>
          </div>
        </Card>

        {filteredParts.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🔧</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No parts found</h3>
              <p className="text-gray-600">Try adjusting your search criteria</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredParts.map((part) => (
              <Card key={part._id}>
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-bold text-gray-900">{part.name}</h3>
                    <span className="text-xs bg-primary-100 text-primary-800 px-2 py-1 rounded">
                      {part.category}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">Part #: {part.partNumber}</p>
                </div>
                <p className="text-sm text-gray-700 mb-3">{part.description}</p>
                <div className="space-y-2 mb-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-bold text-lg text-primary-600">${part.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Stock:</span>
                    <span className={`font-medium ${part.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {part.stock > 0 ? `${part.stock} available` : 'Out of stock'}
                    </span>
                  </div>
                  {part.manufacturer && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Manufacturer:</span>
                      <span className="font-medium">{part.manufacturer}</span>
                    </div>
                  )}
                </div>
                {cart[part._id] ? (
                  <div className="flex items-center justify-between">
                    <Button
                      variant="secondary"
                      onClick={() => removeFromCart(part._id)}
                      className="flex-1 mr-2"
                    >
                      Remove
                    </Button>
                    <span className="px-4 py-2 bg-gray-100 rounded font-semibold">
                      {cart[part._id]} in cart
                    </span>
                  </div>
                ) : (
                  <Button
                    onClick={() => addToCart(part._id)}
                    disabled={part.stock === 0}
                    className="w-full"
                  >
                    Add to Cart
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Parts;
