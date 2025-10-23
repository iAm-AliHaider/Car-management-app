import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { partOrderService } from '../services/partOrderService';
import { PartOrder, SparePart, Car } from '../types';

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<PartOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const data = await partOrderService.getPartOrders();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (id: string) => {
    if (window.confirm('Are you sure you want to cancel this order?')) {
      try {
        await partOrderService.cancelPartOrder(id);
        fetchOrders();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error cancelling order');
      }
    }
  };

  const getCarDisplay = (carData: Car | string | undefined) => {
    if (!carData) return 'No specific car';
    if (typeof carData === 'string') return 'Unknown Car';
    return `${carData.year} ${carData.make} ${carData.model} (${carData.licensePlate})`;
  };

  const getPartDisplay = (partData: SparePart | string) => {
    if (typeof partData === 'string') return 'Unknown Part';
    return `${partData.name} (${partData.partNumber})`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-purple-100 text-purple-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
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
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        </div>

        {orders.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📦</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">Start shopping for spare parts</p>
              <Button onClick={() => window.location.href = '/parts'}>Browse Parts</Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <Card key={order._id}>
                <div className="mb-4">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        Order #{order._id.slice(-8).toUpperCase()}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        Payment: {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-600">{getCarDisplay(order.carId)}</p>
                </div>

                <div className="mb-4">
                  <h4 className="font-semibold mb-2">Items</h4>
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center py-2 border-b last:border-0">
                        <div>
                          <p className="font-medium">{getPartDisplay(item.partId)}</p>
                          <p className="text-sm text-gray-600">
                            ${item.priceAtOrder.toFixed(2)} x {item.quantity}
                          </p>
                        </div>
                        <span className="font-semibold">
                          ${(item.priceAtOrder * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="border-t pt-4 mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-lg font-semibold">Total Amount:</span>
                    <span className="text-2xl font-bold text-primary-600">
                      ${order.totalAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div>
                      <span className="font-medium">Shipping Address:</span>
                      <p className="ml-4">{order.shippingAddress}</p>
                    </div>
                    {order.paymentMethod && (
                      <div>
                        <span className="font-medium">Payment Method:</span> {order.paymentMethod}
                      </div>
                    )}
                    {order.notes && (
                      <div>
                        <span className="font-medium">Notes:</span>
                        <p className="ml-4">{order.notes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {(order.status === 'pending' || order.status === 'processing') && (
                  <div className="flex justify-end">
                    <Button variant="danger" onClick={() => handleCancelOrder(order._id)}>
                      Cancel Order
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Orders;
