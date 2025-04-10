import React, { createContext, useState, useEffect, useContext } from 'react';
import authService from '../services/authService';

// Auth Context oluşturma
const AuthContext = createContext(null);

// Auth Provider bileşeni
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Sayfa yüklendiğinde kullanıcı durumunu kontrol et
  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        if (authService.isAuthenticated()) {
          const storedUser = JSON.parse(localStorage.getItem('user'));
          setUser(storedUser);
          
          // Token geçerli mi kontrol et ve kullanıcı bilgilerini güncelle
          try {
            const { user: currentUser } = await authService.getCurrentUser();
            setUser(currentUser);
          } catch (error) {
            // Token geçersizse çıkış yap
            authService.logout();
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Oturum kontrolü hatası:', error);
      } finally {
        setLoading(false);
      }
    };

    checkLoggedIn();
  }, []);

  // Kayıt işlemi
  const register = async (userData) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.register(userData);
      setUser(data.user);
      return data;
    } catch (error) {
      setError(error.message || 'Kayıt işlemi başarısız oldu.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Giriş işlemi
  const login = async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.login(credentials);
      setUser(data.user);
      return data;
    } catch (error) {
      setError(error.message || 'Giriş işlemi başarısız oldu.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Çıkış işlemi
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Context değerleri
  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin',
    isOperator: user?.role === 'operator' || user?.role === 'admin',
    isCustomer: user?.role === 'customer'
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Auth Context hook
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
