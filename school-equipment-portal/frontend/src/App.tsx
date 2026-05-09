import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import EquipmentList from './pages/EquipmentList';
import EquipmentDetails from './pages/EquipmentDetails';
import MyRequests from './pages/MyRequests';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import Navbar from './component/Navbar';

const PrivateRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return isAuthenticated ? element : <Navigate to="/login" />;
};

const AdminRoute: React.FC<{ element: React.ReactElement }> = ({ element }) => {
  const { isAuthenticated, user, isLoading } = useAuth();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  return isAuthenticated && (user?.role === 'ADMIN' || user?.role === 'STAFF') 
    ? element 
    : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <main className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
              <Route path="/equipment" element={<PrivateRoute element={<EquipmentList />} />} />
              <Route path="/equipment/:id" element={<PrivateRoute element={<EquipmentDetails />} />} />
              <Route path="/my-requests" element={<PrivateRoute element={<MyRequests />} />} />
              <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />
              <Route path="/admin" element={<AdminRoute element={<AdminPanel />} />} />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
          <Toaster position="top-right" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;