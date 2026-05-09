import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { Equipment } from '../types';
import { useAuth } from '../context/AuthContext';

const EquipmentList: React.FC = () => {
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    category: '',
    search: '',
    available: false
  });
  const { user } = useAuth();

  const categories = ['Electronics', 'Sports', 'Lab Equipment', 'Musical Instruments', 'Project Materials'];

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, equipment]);

  const fetchEquipment = async () => {
    try {
      const response = await api.get('/equipment');
      setEquipment(response.data);
      setFilteredEquipment(response.data);
    } catch (error) {
      console.error('Error fetching equipment:', error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...equipment];
    
    if (filters.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    
    if (filters.search) {
      filtered = filtered.filter(item => 
        item.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        item.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    if (filters.available) {
      filtered = filtered.filter(item => item.available && item.quantity > 0);
    }
    
    setFilteredEquipment(filtered);
  };

  if (loading) {
    return <div className="text-center py-8">Loading equipment...</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Equipment Catalog</h1>
        <p className="text-gray-600 mt-1">Browse and request available equipment</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
            <input
              type="text"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              placeholder="Search equipment..."
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="input-field"
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div className="flex items-end">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.available}
                onChange={(e) => setFilters({ ...filters, available: e.target.checked })}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Show only available</span>
            </label>
          </div>
        </div>
      </div>

      {/* Equipment Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEquipment.map((item) => (
          <div key={item.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                <span className={`px-2 py-1 text-xs rounded-full ${item.available && item.quantity > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {item.available && item.quantity > 0 ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">{item.category}</p>
              <p className="text-gray-600 mt-2 text-sm">{item.description || 'No description available'}</p>
              <div className="mt-3 flex justify-between items-center">
                <div>
                  <span className="text-sm text-gray-500">Quantity: {item.quantity}</span>
                  <br />
                  <span className="text-sm text-gray-500">Condition: {item.condition}</span>
                </div>
                <Link
                  to={`/equipment/${item.id}`}
                  className="btn-primary text-sm px-3 py-1"
                >
                  Request
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEquipment.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-500">No equipment found matching your filters.</p>
        </div>
      )}
    </div>
  );
};

export default EquipmentList;