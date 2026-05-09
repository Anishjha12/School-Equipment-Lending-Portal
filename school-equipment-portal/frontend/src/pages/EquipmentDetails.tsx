import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { Equipment } from '../types';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const EquipmentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [equipment, setEquipment] = useState<Equipment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    startDate: '',
    endDate: '',
    purpose: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchEquipment();
  }, [id]);

  const fetchEquipment = async () => {
    try {
      const response = await api.get(`/equipment/${id}`);
      setEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
      toast.error('Equipment not found');
      navigate('/equipment');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (new Date(requestData.startDate) < new Date()) {
      toast.error('Start date cannot be in the past');
      return;
    }
    
    if (new Date(requestData.endDate) <= new Date(requestData.startDate)) {
      toast.error('End date must be after start date');
      return;
    }
    
    setSubmitting(true);
    
    try {
      await api.post('/requests', {
        equipmentId: parseInt(id!),
        startDate: requestData.startDate,
        endDate: requestData.endDate,
        purpose: requestData.purpose
      });
      toast.success('Request submitted successfully!');
      setShowRequestForm(false);
      setRequestData({ startDate: '', endDate: '', purpose: '' });
      fetchEquipment(); // Refresh to show updated requests
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit request');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading equipment details...</div>;
  }

  if (!equipment) {
    return <div className="text-center py-8">Equipment not found</div>;
  }

  const isAvailable = equipment.available && equipment.quantity > 0;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{equipment.name}</h1>
              <p className="text-gray-500 mt-1">{equipment.category}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {isAvailable ? 'Available' : 'Currently Unavailable'}
            </span>
          </div>
          
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-900">Description</h3>
            <p className="text-gray-600 mt-1">{equipment.description || 'No description provided.'}</p>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500">Quantity Available</h3>
              <p className="text-lg font-semibold text-gray-900">{equipment.quantity}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Condition</h3>
              <p className="text-lg font-semibold text-gray-900">{equipment.condition}</p>
            </div>
          </div>
          
          {isAvailable && user?.role !== 'ADMIN' && (
            <div className="mt-6">
              {!showRequestForm ? (
                <button
                  onClick={() => setShowRequestForm(true)}
                  className="btn-primary"
                >
                  Request This Equipment
                </button>
              ) : (
                <div className="border-t pt-4 mt-4">
                  <h3 className="text-lg font-semibold mb-3">Submit Borrow Request</h3>
                  <form onSubmit={handleRequestSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={requestData.startDate}
                        onChange={(e) => setRequestData({ ...requestData, startDate: e.target.value })}
                        required
                        min={format(new Date(), 'yyyy-MM-dd')}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input
                        type="date"
                        value={requestData.endDate}
                        onChange={(e) => setRequestData({ ...requestData, endDate: e.target.value })}
                        required
                        min={requestData.startDate || format(new Date(), 'yyyy-MM-dd')}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
                      <textarea
                        value={requestData.purpose}
                        onChange={(e) => setRequestData({ ...requestData, purpose: e.target.value })}
                        required
                        rows={3}
                        className="input-field"
                        placeholder="Explain why you need this equipment..."
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button type="submit" disabled={submitting} className="btn-primary">
                        {submitting ? 'Submitting...' : 'Submit Request'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowRequestForm(false)}
                        className="btn-secondary"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
      
      {/* Current Requests */}
      {equipment.requests && equipment.requests.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Current & Upcoming Bookings</h2>
          </div>
          <div className="divide-y divide-gray-200">
            {equipment.requests.map((request) => (
              <div key={request.id} className="px-6 py-4">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{request.user?.name}</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(request.startDate), 'MMM dd, yyyy')} - {format(new Date(request.endDate), 'MMM dd, yyyy')}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">{request.purpose}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    request.status === 'APPROVED' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {request.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EquipmentDetails;