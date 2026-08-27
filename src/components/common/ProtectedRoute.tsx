import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { session, isLoading, role } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-400 text-sm font-medium">Verifying authorization...</p>
        </div>
      </div>
    );
  }

  // Not authenticated -> redirect to login
  if (!session || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role authorization
  if (allowedRoles && !allowedRoles.includes(role)) {
    // Redirect to their own default dashboard
    if (role === 'admin') return <Navigate to="/admin/dashboard" replace />;
    if (role === 'head_master') return <Navigate to="/headmaster/dashboard" replace />;
    if (role === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
