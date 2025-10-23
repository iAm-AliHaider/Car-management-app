import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../components/Layout';
import Card from '../components/Card';
import { carService } from '../services/carService';
import { serviceBookingService } from '../services/serviceBookingService';
import { partOrderService } from '../services/partOrderService';
import { Car, ServiceBooking, PartOrder } from '../types';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    totalCars: 0,
    activeBookings: 0,
    totalOrders: 0,
  });
  const [recentBookings, setRecentBookings] = useState<ServiceBooking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [cars, bookings, orders] = await Promise.all([
          carService.getCars(),
          serviceBookingService.getServiceBookings(),
          partOrderService.getPartOrders(),
        ]);

        setStats({
          totalCars: cars.length,
          activeBookings: bookings.filter(b => b.status !== 'completed' && b.status !== 'cancelled').length,
          totalOrders: orders.length,
        });

        setRecentBookings(bookings.slice(0, 3));
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

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
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-primary-100 text-sm">Total Cars</p>
                <p className="text-3xl font-bold mt-2">{stats.totalCars}</p>
              </div>
              <div className="text-5xl opacity-30">🚗</div>
            </div>
            <Link to="/cars" className="mt-4 inline-block text-sm text-primary-100 hover:text-white">
              View all cars →
            </Link>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-green-100 text-sm">Active Bookings</p>
                <p className="text-3xl font-bold mt-2">{stats.activeBookings}</p>
              </div>
              <div className="text-5xl opacity-30">🔧</div>
            </div>
            <Link to="/services" className="mt-4 inline-block text-sm text-green-100 hover:text-white">
              View bookings →
            </Link>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-orange-100 text-sm">Part Orders</p>
                <p className="text-3xl font-bold mt-2">{stats.totalOrders}</p>
              </div>
              <div className="text-5xl opacity-30">📦</div>
            </div>
            <Link to="/orders" className="mt-4 inline-block text-sm text-orange-100 hover:text-white">
              View orders →
            </Link>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Recent Service Bookings">
            {recentBookings.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <p>No service bookings yet</p>
                <Link to="/services" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
                  Book a service
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentBookings.map((booking) => {
                  const car = booking.carId as Car;
                  return (
                    <div key={booking._id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-gray-900">{booking.serviceType}</h4>
                          <p className="text-sm text-gray-600">
                            {car.make} {car.model} ({car.licensePlate})
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(booking.scheduledDate).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          booking.status === 'completed' ? 'bg-green-100 text-green-800' :
                          booking.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                          booking.status === 'confirmed' ? 'bg-purple-100 text-purple-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {booking.status}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          <Card title="Quick Actions">
            <div className="space-y-3">
              <Link
                to="/cars"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <h4 className="font-semibold text-gray-900">Add New Car</h4>
                <p className="text-sm text-gray-600 mt-1">Register a new vehicle to your account</p>
              </Link>
              <Link
                to="/services"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <h4 className="font-semibold text-gray-900">Book a Service</h4>
                <p className="text-sm text-gray-600 mt-1">Schedule maintenance or repairs</p>
              </Link>
              <Link
                to="/parts"
                className="block p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <h4 className="font-semibold text-gray-900">Order Spare Parts</h4>
                <p className="text-sm text-gray-600 mt-1">Browse and order parts for your car</p>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
