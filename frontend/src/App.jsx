import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Layout from './layouts/Layout';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Vehicles from './pages/Vehicles';
import Recommend from './pages/Recommend';
import Compare from './pages/Compare';
import AdminDashboard from './pages/AdminDashboard';
import ManufacturerDashboard from './pages/ManufacturerDashboard';
import { ProtectedRoute, RoleRoute } from './components/ProtectedRoute';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/vehicles" element={<Vehicles />} />
            <Route path="/recommend" element={<Recommend />} />
            <Route path="/compare" element={<Compare />} />

            {/* Protected General Profile Route */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Restricted Admin Route */}
            <Route
              path="/admin"
              element={
                <RoleRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </RoleRoute>
              }
            />

            {/* Restricted Manufacturer/Partner Route */}
            <Route
              path="/manufacturer"
              element={
                <RoleRoute allowedRoles={['manufacturer']}>
                  <ManufacturerDashboard />
                </RoleRoute>
              }
            />

            {/* Fallback Catch-All Redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </Router>
    </AuthProvider>
  );
}

export default App;
