import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs text-gray-400 font-medium">Verifying authentication session...</p>
      </div>
    );
  }

  if (!user) {
    // Redirect to /login and pass intended path location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}
