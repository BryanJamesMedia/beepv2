import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Chat from './pages/Chat';
import CreatorDashboard from './pages/CreatorDashboard';
import MemberDashboard from './pages/MemberDashboard';
import CreatorSettings from './pages/CreatorSettings';
import MemberSettings from './pages/MemberSettings';
import ProtectedRoute from './components/ProtectedRoute';
import CreatorSignup from './pages/CreatorSignup';
import MemberSignup from './pages/MemberSignup';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/creator-signup" element={<CreatorSignup />} />
          <Route path="/member-signup" element={<MemberSignup />} />

          {/* Creator-only routes */}
          <Route 
            path="/creator-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['creator']}>
                <CreatorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/creator-settings" 
            element={
              <ProtectedRoute allowedRoles={['creator']}>
                <CreatorSettings />
              </ProtectedRoute>
            } 
          />

          {/* Member-only routes */}
          <Route 
            path="/member-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/member-settings" 
            element={
              <ProtectedRoute allowedRoles={['member']}>
                <MemberSettings />
              </ProtectedRoute>
            } 
          />

          {/* Shared routes (accessible by both roles) */}
          <Route 
            path="/chat" 
            element={
              <ProtectedRoute allowedRoles={['creator', 'member']}>
                <Chat />
              </ProtectedRoute>
            } 
          />

          {/* Root redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          
          {/* Catch all */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
