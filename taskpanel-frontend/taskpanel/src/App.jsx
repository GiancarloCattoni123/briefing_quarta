import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute, AdminRoute, PublicRoute } from './routes/Guards';

import Login    from './pages/Login';
import Setup    from './pages/Setup';
import Dashboard from './pages/Dashboard';
import Tasks    from './pages/Tasks';
import Users    from './pages/Users';
import Profile  from './pages/Profile';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Públicas */}
        <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
        <Route path="/setup" element={<Setup />} />

        {/* Privadas */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/tasks"     element={<PrivateRoute><Tasks /></PrivateRoute>} />
        <Route path="/profile"   element={<PrivateRoute><Profile /></PrivateRoute>} />

        {/* Apenas admin */}
        <Route path="/users" element={<AdminRoute><Users /></AdminRoute>} />

        {/* Redirect raiz */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
