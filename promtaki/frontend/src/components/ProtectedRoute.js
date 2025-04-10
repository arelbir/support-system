import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Korumalı rota bileşeni - sadece giriş yapmış kullanıcılar erişebilir
const ProtectedRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Yükleme durumunda bekle
  if (loading) {
    return <div className="text-center p-5">Yükleniyor...</div>;
  }
  
  // Giriş yapmamış kullanıcıları login sayfasına yönlendir
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" />;
};

// Rol tabanlı korumalı rota bileşeni
export const RoleProtectedRoute = ({ allowedRoles }) => {
  const { user, loading, isAuthenticated } = useAuth();
  
  // Yükleme durumunda bekle
  if (loading) {
    return <div className="text-center p-5">Yükleniyor...</div>;
  }
  
  // Giriş yapmamış kullanıcıları login sayfasına yönlendir
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  // Yetkisiz kullanıcıları dashboard'a yönlendir
  return allowedRoles.includes(user.role) ? <Outlet /> : <Navigate to="/dashboard" />;
};

// Sadece giriş yapmamış kullanıcılar için rota (login, register sayfaları)
export const PublicOnlyRoute = () => {
  const { isAuthenticated, loading } = useAuth();
  
  // Yükleme durumunda bekle
  if (loading) {
    return <div className="text-center p-5">Yükleniyor...</div>;
  }
  
  // Giriş yapmış kullanıcıları dashboard'a yönlendir
  return isAuthenticated ? <Navigate to="/dashboard" /> : <Outlet />;
};

export default ProtectedRoute;
