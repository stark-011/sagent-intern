import React from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import ApplicationForm from './pages/ApplicationForm';
import OfficerDashboard from './pages/OfficerDashboard';

const App = () => {
  return (
    <Router>
      <Navbar />
      <main className="app-shell">
        <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute requiredRole="STUDENT">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/apply"
            element={
              <ProtectedRoute requiredRole="STUDENT">
                <ApplicationForm />
              </ProtectedRoute>
            }
          />
          <Route
            path="/officer"
            element={
              <ProtectedRoute requiredRole="ADMIN">
                <OfficerDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>
    </Router>
  );
};

export default App;
