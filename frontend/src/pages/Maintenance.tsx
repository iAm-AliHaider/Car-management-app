import React, { useEffect, useState } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import { maintenanceReminderService } from '../services/maintenanceReminderService';
import { documentService } from '../services/documentService';
import { MaintenanceReminder, Document, Car } from '../types';

const Maintenance: React.FC = () => {
  const [reminders, setReminders] = useState<MaintenanceReminder[]>([]);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [dueReminders, setDueReminders] = useState<MaintenanceReminder[]>([]);
  const [expiringDocs, setExpiringDocs] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'reminders' | 'documents'>('reminders');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [remindersData, documentsData, dueData, expiringData] = await Promise.all([
        maintenanceReminderService.getReminders(),
        documentService.getDocuments(),
        maintenanceReminderService.getDueReminders(),
        documentService.getExpiringDocuments(30),
      ]);
      setReminders(remindersData);
      setDocuments(documentsData);
      setDueReminders(dueData);
      setExpiringDocs(expiringData);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReminder = async (id: string) => {
    if (window.confirm('Mark this reminder as complete?')) {
      try {
        await maintenanceReminderService.completeReminder(id);
        fetchData();
      } catch (error: any) {
        alert(error.response?.data?.message || 'Error completing reminder');
      }
    }
  };

  const handleDeleteReminder = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      try {
        await maintenanceReminderService.deleteReminder(id);
        fetchData();
      } catch (error) {
        alert('Error deleting reminder');
      }
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentService.deleteDocument(id);
        fetchData();
      } catch (error) {
        alert('Error deleting document');
      }
    }
  };

  const getCarDisplay = (carData: Car | string) => {
    if (typeof carData === 'string') return 'Unknown Car';
    return `${carData.year} ${carData.make} ${carData.model}`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isExpiringSoon = (expiryDate: string) => {
    const days = Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return days <= 30 && days >= 0;
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
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Maintenance & Documents</h1>

        {/* Alerts */}
        {(dueReminders.length > 0 || expiringDocs.length > 0) && (
          <Card className="mb-6 bg-yellow-50 border-2 border-yellow-200">
            <h3 className="text-lg font-bold text-yellow-800 mb-3">⚠️ Attention Required</h3>
            {dueReminders.length > 0 && (
              <div className="mb-3">
                <p className="text-yellow-800 font-medium mb-2">
                  {dueReminders.length} maintenance reminder(s) due
                </p>
                <div className="space-y-1">
                  {dueReminders.slice(0, 3).map((reminder) => (
                    <p key={reminder._id} className="text-sm text-yellow-700">
                      • {reminder.title} - {getCarDisplay(reminder.carId)}
                    </p>
                  ))}
                </div>
              </div>
            )}
            {expiringDocs.length > 0 && (
              <div>
                <p className="text-yellow-800 font-medium mb-2">
                  {expiringDocs.length} document(s) expiring soon
                </p>
                <div className="space-y-1">
                  {expiringDocs.slice(0, 3).map((doc) => (
                    <p key={doc._id} className="text-sm text-yellow-700">
                      • {doc.title} - {doc.expiryDate ? new Date(doc.expiryDate).toLocaleDateString() : 'N/A'}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </Card>
        )}

        {/* Tabs */}
        <div className="flex border-b border-gray-300 mb-6">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'reminders'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('reminders')}
          >
            Maintenance Reminders ({reminders.length})
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'documents'
                ? 'border-b-2 border-primary-600 text-primary-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('documents')}
          >
            Documents ({documents.length})
          </button>
        </div>

        {/* Reminders Tab */}
        {activeTab === 'reminders' && (
          <div>
            {reminders.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔔</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No maintenance reminders yet</h3>
                  <p className="text-gray-600">Set up reminders to stay on top of maintenance</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {reminders.map((reminder) => (
                  <Card key={reminder._id}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{reminder.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(reminder.priority)}`}>
                            {reminder.priority}
                          </span>
                          {!reminder.isActive && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                          {reminder.isRecurring && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              Recurring
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{getCarDisplay(reminder.carId)}</p>
                        {reminder.description && (
                          <p className="text-sm text-gray-700 mb-2">{reminder.description}</p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          {reminder.nextServiceDate && (
                            <div>
                              <span className="text-gray-600">Next Service:</span>
                              <p className="font-medium">{new Date(reminder.nextServiceDate).toLocaleDateString()}</p>
                            </div>
                          )}
                          {reminder.targetMileage && (
                            <div>
                              <span className="text-gray-600">Target Mileage:</span>
                              <p className="font-medium">{reminder.targetMileage.toLocaleString()} mi</p>
                            </div>
                          )}
                          <div>
                            <span className="text-gray-600">Type:</span>
                            <p className="font-medium capitalize">{reminder.reminderType}</p>
                          </div>
                          {reminder.intervalMonths && (
                            <div>
                              <span className="text-gray-600">Interval:</span>
                              <p className="font-medium">{reminder.intervalMonths} months</p>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={() => handleCompleteReminder(reminder._id)}>
                          Complete
                        </Button>
                        <Button variant="danger" onClick={() => handleDeleteReminder(reminder._id)}>
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <div>
            {documents.length === 0 ? (
              <Card>
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">📄</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No documents yet</h3>
                  <p className="text-gray-600">Store important car documents here</p>
                </div>
              </Card>
            ) : (
              <div className="space-y-4">
                {documents.map((doc) => (
                  <Card key={doc._id}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{doc.title}</h3>
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                            {doc.documentType}
                          </span>
                          {doc.expiryDate && isExpiringSoon(doc.expiryDate) && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                              Expiring Soon
                            </span>
                          )}
                        </div>
                        <p className="text-gray-600 mb-2">{getCarDisplay(doc.carId)}</p>
                        {doc.description && (
                          <p className="text-sm text-gray-700 mb-2">{doc.description}</p>
                        )}
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                          {doc.documentNumber && (
                            <div>
                              <span className="text-gray-600">Document #:</span>
                              <p className="font-medium">{doc.documentNumber}</p>
                            </div>
                          )}
                          {doc.issueDate && (
                            <div>
                              <span className="text-gray-600">Issue Date:</span>
                              <p className="font-medium">{new Date(doc.issueDate).toLocaleDateString()}</p>
                            </div>
                          )}
                          {doc.expiryDate && (
                            <div>
                              <span className="text-gray-600">Expiry Date:</span>
                              <p className="font-medium">{new Date(doc.expiryDate).toLocaleDateString()}</p>
                            </div>
                          )}
                        </div>
                        {doc.notes && (
                          <p className="text-sm text-gray-700 mt-2">Notes: {doc.notes}</p>
                        )}
                      </div>
                      <Button variant="danger" onClick={() => handleDeleteDocument(doc._id)}>
                        Delete
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Maintenance;
