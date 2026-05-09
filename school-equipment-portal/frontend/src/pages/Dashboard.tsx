import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Equipment, BorrowRequest } from '../types';
import { format } from 'date-fns';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [recentEquipment, setRecentEquipment] = useState<Equipment[]>([]);
  const [recentRequests, setRecentRequests] = useState<BorrowRequest[]>([]);
  const [stats, setStats] = useState({
    totalEquipment: 0,
    pendingRequests: 0,
    activeBorrows: 0
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const [equipmentRes, requestsRes] = await Promise.all([
        api.get('/equipment?limit=6'),
        api.get('/requests/my-requests')
      ]);
      
      setRecentEquipment(equipmentRes.data.slice(0, 6));
      setRecentRequests(requestsRes.data.slice(0, 5));
      
      // Calculate stats
      const allEquipment = equipmentRes.data;
      const allRequests = requestsRes.data;
      
      setStats({
        totalEquipment: allEquipment.length,
        pendingRequests: allRequests.filter((r: BorrowRequest) => r.status === 'PENDING').length,
        activeBorrows: allRequests.filter((r: BorrowRequest) => r.status === 'APPROVED').length
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'APPROVED': return 'bg-green-100 text-green-800';
      case 'REJECTED': return 'bg-red-100 text-red-800';
      case 'RETURNED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name}!
        </h1>
        <p className="text-gray-600 mt-1">Here's what's happening with your equipment requests.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Equipment</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalEquipment}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Pending Requests</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingRequests}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Borrows</p>
              <p className="text-2xl font-bold text-green-600">{stats.activeBorrows}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Equipment */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recently Added Equipment</h2>
            <Link to="/equipment" className="text-blue-600 hover:text-blue-700 text-sm">
              View All →
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentEquipment.map((item) => (
            <div key={item.id} className="px-6 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{item.name}</h3>
                  <p className="text-sm text-gray-500">{item.category} • {item.condition}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">Available: {item.quantity}</p>
                  <Link
                    to={`/equipment/${item.id}`}
                    className="text-blue-600 hover:text-blue-700 text-sm mt-1 inline-block"
                  >
                    Request →
                  </Link>
                </div>
              </div>
            </div>
          ))}
          {recentEquipment.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No equipment available yet.
            </div>
          )}
        </div>
      </div>

      {/* Recent Requests */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-900">Recent Requests</h2>
            <Link to="/my-requests" className="text-blue-600 hover:text-blue-700 text-sm">
              View All →
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentRequests.map((request) => (
            <div key={request.id} className="px-6 py-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{request.equipment?.name}</h3>
                  <p className="text-sm text-gray-500">
                    {format(new Date(request.startDate), 'MMM dd')} - {format(new Date(request.endDate), 'MMM dd, yyyy')}
                  </p>
                  <p className="text-sm text-gray-600 mt-1">{request.purpose}</p>
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}>
                    {request.status}
                  </span>
                </div>
              </div>
            </div>
          ))}
          {recentRequests.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No requests yet. Start borrowing equipment!
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;