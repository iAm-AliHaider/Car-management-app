import { useState, useEffect } from 'react';
import { fleetService } from '../services/fleetService';
import { fleetMemberService } from '../services/fleetMemberService';
import { carService } from '../services/carService';
import { Fleet, FleetMember, FleetAnalytics, Car } from '../types';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';

type Tab = 'overview' | 'members' | 'vehicles' | 'analytics';

export default function Fleets() {
  const [fleets, setFleets] = useState<Fleet[]>([]);
  const [selectedFleet, setSelectedFleet] = useState<Fleet | null>(null);
  const [members, setMembers] = useState<FleetMember[]>([]);
  const [analytics, setAnalytics] = useState<FleetAnalytics | null>(null);
  const [availableCars, setAvailableCars] = useState<Car[]>([]);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [showAddVehicleForm, setShowAddVehicleForm] = useState(false);

  // Form states
  const [newFleet, setNewFleet] = useState({
    name: '',
    description: '',
    fleetType: 'personal' as const
  });

  const [newMember, setNewMember] = useState({
    userEmail: '',
    role: 'driver' as const,
    assignedVehicles: [] as string[]
  });

  const [selectedVehicles, setSelectedVehicles] = useState<string[]>([]);

  useEffect(() => {
    fetchFleets();
    fetchAvailableCars();
  }, []);

  useEffect(() => {
    if (selectedFleet) {
      fetchFleetMembers(selectedFleet._id);
      if (activeTab === 'analytics') {
        fetchAnalytics(selectedFleet._id);
      }
    }
  }, [selectedFleet, activeTab]);

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

  const fetchFleetMembers = async (fleetId: string) => {
    try {
      const data = await fleetMemberService.getFleetMembers(fleetId);
      setMembers(data);
    } catch (err: any) {
      console.error('Failed to fetch members:', err);
    }
  };

  const fetchAnalytics = async (fleetId: string) => {
    try {
      const data = await fleetService.getFleetAnalytics(fleetId);
      setAnalytics(data);
    } catch (err: any) {
      console.error('Failed to fetch analytics:', err);
    }
  };

  const fetchAvailableCars = async () => {
    try {
      const data = await carService.getCars();
      setAvailableCars(data);
    } catch (err: any) {
      console.error('Failed to fetch cars:', err);
    }
  };

  const handleCreateFleet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fleetService.createFleet(newFleet);
      setNewFleet({ name: '', description: '', fleetType: 'personal' });
      setShowCreateForm(false);
      fetchFleets();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create fleet');
    }
  };

  const handleDeleteFleet = async (fleetId: string) => {
    if (!confirm('Are you sure you want to delete this fleet?')) return;
    try {
      await fleetService.deleteFleet(fleetId);
      fetchFleets();
      setSelectedFleet(null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete fleet');
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFleet) return;
    try {
      await fleetMemberService.addFleetMember(selectedFleet._id, newMember);
      setNewMember({ userEmail: '', role: 'driver', assignedVehicles: [] });
      setShowAddMemberForm(false);
      fetchFleetMembers(selectedFleet._id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add member');
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Remove this member from the fleet?')) return;
    try {
      await fleetMemberService.removeFleetMember(memberId);
      if (selectedFleet) fetchFleetMembers(selectedFleet._id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove member');
    }
  };

  const handleAddVehicles = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFleet || selectedVehicles.length === 0) return;
    try {
      await fleetService.addVehiclesToFleet(selectedFleet._id, selectedVehicles);
      setSelectedVehicles([]);
      setShowAddVehicleForm(false);
      fetchFleets();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to add vehicles');
    }
  };

  const handleRemoveVehicle = async (vehicleId: string) => {
    if (!selectedFleet || !confirm('Remove this vehicle from the fleet?')) return;
    try {
      await fleetService.removeVehicleFromFleet(selectedFleet._id, vehicleId);
      fetchFleets();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to remove vehicle');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    const colors = {
      owner: 'bg-purple-100 text-purple-800',
      manager: 'bg-blue-100 text-blue-800',
      driver: 'bg-green-100 text-green-800',
      viewer: 'bg-gray-100 text-gray-800'
    };
    return colors[role as keyof typeof colors] || colors.viewer;
  };

  const getStatusBadgeColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading fleets...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Fleet Management</h1>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : 'Create Fleet'}
        </Button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Create Fleet Form */}
      {showCreateForm && (
        <Card title="Create New Fleet">
          <form onSubmit={handleCreateFleet} className="space-y-4">
            <Input
              label="Fleet Name"
              value={newFleet.name}
              onChange={(e) => setNewFleet({ ...newFleet, name: e.target.value })}
              required
            />
            <Input
              label="Description"
              value={newFleet.description}
              onChange={(e) => setNewFleet({ ...newFleet, description: e.target.value })}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fleet Type
              </label>
              <select
                value={newFleet.fleetType}
                onChange={(e) => setNewFleet({ ...newFleet, fleetType: e.target.value as any })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="personal">Personal</option>
                <option value="business">Business</option>
                <option value="rental">Rental</option>
                <option value="delivery">Delivery</option>
                <option value="taxi">Taxi</option>
                <option value="other">Other</option>
              </select>
            </div>
            <Button type="submit">Create Fleet</Button>
          </form>
        </Card>
      )}

      {/* Fleet Selector */}
      {fleets.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {fleets.map((fleet) => (
            <Card
              key={fleet._id}
              className={`cursor-pointer transition-all ${
                selectedFleet?._id === fleet._id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => setSelectedFleet(fleet)}
            >
              <h3 className="text-lg font-semibold text-gray-900">{fleet.name}</h3>
              <p className="text-sm text-gray-600">{fleet.description}</p>
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-600">{fleet.totalVehicles} vehicles</span>
                <span className="text-gray-600">{fleet.members.length} members</span>
              </div>
              <div className="mt-2">
                <span className="inline-block px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-800">
                  {fleet.fleetType}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Selected Fleet Details */}
      {selectedFleet && (
        <div className="space-y-6">
          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {(['overview', 'members', 'vehicles', 'analytics'] as Tab[]).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <Card title="Fleet Information">
                <div className="space-y-2">
                  <p><strong>Name:</strong> {selectedFleet.name}</p>
                  <p><strong>Description:</strong> {selectedFleet.description || 'N/A'}</p>
                  <p><strong>Type:</strong> {selectedFleet.fleetType}</p>
                  <p><strong>Total Vehicles:</strong> {selectedFleet.totalVehicles}</p>
                  <p><strong>Active Vehicles:</strong> {selectedFleet.activeVehicles}</p>
                  <p><strong>Total Members:</strong> {selectedFleet.members.length}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button variant="danger" onClick={() => handleDeleteFleet(selectedFleet._id)}>
                    Delete Fleet
                  </Button>
                </div>
              </Card>

              <Card title="Fleet Statistics">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Mileage</p>
                    <p className="text-2xl font-bold">{selectedFleet.statistics.totalMileage.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold">${selectedFleet.statistics.totalExpenses.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Services</p>
                    <p className="text-2xl font-bold">{selectedFleet.statistics.totalServices}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Avg Mileage/Vehicle</p>
                    <p className="text-2xl font-bold">{Math.round(selectedFleet.statistics.averageMileagePerVehicle).toLocaleString()}</p>
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Fleet Members</h2>
                <Button onClick={() => setShowAddMemberForm(!showAddMemberForm)}>
                  {showAddMemberForm ? 'Cancel' : 'Add Member'}
                </Button>
              </div>

              {showAddMemberForm && (
                <Card title="Add Fleet Member">
                  <form onSubmit={handleAddMember} className="space-y-4">
                    <Input
                      label="User Email"
                      type="email"
                      value={newMember.userEmail}
                      onChange={(e) => setNewMember({ ...newMember, userEmail: e.target.value })}
                      required
                    />
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Role
                      </label>
                      <select
                        value={newMember.role}
                        onChange={(e) => setNewMember({ ...newMember, role: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      >
                        <option value="manager">Manager</option>
                        <option value="driver">Driver</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    </div>
                    <Button type="submit">Add Member</Button>
                  </form>
                </Card>
              )}

              <div className="grid gap-4">
                {members.map((member) => (
                  <Card key={member._id}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">
                          {typeof member.userId === 'object' ? member.userId.name : 'Unknown'}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {typeof member.userId === 'object' ? member.userId.email : ''}
                        </p>
                        <div className="mt-2 flex gap-2">
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getRoleBadgeColor(member.role)}`}>
                            {member.role}
                          </span>
                          <span className={`inline-block px-2 py-1 text-xs font-medium rounded ${getStatusBadgeColor(member.status)}`}>
                            {member.status}
                          </span>
                        </div>
                        {member.assignedVehicles && member.assignedVehicles.length > 0 && (
                          <p className="mt-2 text-sm text-gray-600">
                            Assigned Vehicles: {member.assignedVehicles.length}
                          </p>
                        )}
                      </div>
                      {member.role !== 'owner' && (
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveMember(member._id)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Vehicles Tab */}
          {activeTab === 'vehicles' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold">Fleet Vehicles</h2>
                <Button onClick={() => setShowAddVehicleForm(!showAddVehicleForm)}>
                  {showAddVehicleForm ? 'Cancel' : 'Add Vehicles'}
                </Button>
              </div>

              {showAddVehicleForm && (
                <Card title="Add Vehicles to Fleet">
                  <form onSubmit={handleAddVehicles} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Select Vehicles
                      </label>
                      <div className="space-y-2 max-h-60 overflow-y-auto">
                        {availableCars.map((car) => (
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
                        ))}
                      </div>
                    </div>
                    <Button type="submit" disabled={selectedVehicles.length === 0}>
                      Add Selected Vehicles
                    </Button>
                  </form>
                </Card>
              )}

              <div className="grid gap-4">
                {selectedFleet.vehicles.map((vehicle) => {
                  const car = typeof vehicle === 'object' ? vehicle : null;
                  if (!car) return null;
                  return (
                    <Card key={car._id}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {car.year} {car.make} {car.model}
                          </h3>
                          <p className="text-sm text-gray-600">License: {car.licensePlate}</p>
                          {car.mileage && (
                            <p className="text-sm text-gray-600">Mileage: {car.mileage.toLocaleString()} miles</p>
                          )}
                        </div>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleRemoveVehicle(car._id)}
                        >
                          Remove
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Analytics Tab */}
          {activeTab === 'analytics' && analytics && (
            <div className="space-y-4">
              <Card title="Fleet Overview">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Vehicles</p>
                    <p className="text-2xl font-bold">{analytics.overview.totalVehicles}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Vehicles</p>
                    <p className="text-2xl font-bold">{analytics.overview.activeVehicles}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Members</p>
                    <p className="text-2xl font-bold">{analytics.overview.totalMembers}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Active Members</p>
                    <p className="text-2xl font-bold">{analytics.overview.activeMembers}</p>
                  </div>
                </div>
              </Card>

              <Card title="Vehicle Statistics">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Mileage</p>
                    <p className="text-2xl font-bold">{analytics.vehicleStats.totalMileage.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Mileage</p>
                    <p className="text-2xl font-bold">{Math.round(analytics.vehicleStats.averageMileage).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Value</p>
                    <p className="text-2xl font-bold">${analytics.vehicleStats.totalValue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average Age</p>
                    <p className="text-2xl font-bold">{analytics.vehicleStats.averageAge.toFixed(1)} years</p>
                  </div>
                </div>
              </Card>

              <Card title="Expense Analytics">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Expenses</p>
                    <p className="text-2xl font-bold">${analytics.expenseStats.totalExpenses.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Average per Vehicle</p>
                    <p className="text-2xl font-bold">${Math.round(analytics.expenseStats.averageExpensePerVehicle).toLocaleString()}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Expenses by Category</p>
                  {analytics.expenseStats.expensesByCategory.map((item) => (
                    <div key={item.category} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{item.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">${item.amount.toLocaleString()}</span>
                        <span className="text-xs text-gray-500">({item.percentage.toFixed(1)}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Service Statistics">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Total Services</p>
                    <p className="text-2xl font-bold">{analytics.serviceStats.totalServices}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completed</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.serviceStats.completedServices}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">{analytics.serviceStats.pendingServices}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Upcoming</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.serviceStats.upcomingServices}</p>
                  </div>
                </div>
              </Card>

              <Card title="Performance Metrics">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Avg Fuel Economy</p>
                    <p className="text-2xl font-bold">{analytics.performanceMetrics.averageFuelEconomy.toFixed(1)} MPG</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Total Fuel Cost</p>
                    <p className="text-2xl font-bold">${analytics.performanceMetrics.totalFuelCost.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Cost per Mile</p>
                    <p className="text-2xl font-bold">${analytics.performanceMetrics.costPerMile.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Utilization Rate</p>
                    <p className="text-2xl font-bold">{analytics.performanceMetrics.utilizationRate.toFixed(1)}%</p>
                  </div>
                </div>
              </Card>
            </div>
          )}
        </div>
      )}

      {fleets.length === 0 && !showCreateForm && (
        <Card>
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No fleets found. Create your first fleet to get started.</p>
            <Button onClick={() => setShowCreateForm(true)}>Create Fleet</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
