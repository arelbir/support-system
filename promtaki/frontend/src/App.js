import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute, { RoleProtectedRoute, PublicOnlyRoute } from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CreateTicketPage from './pages/CreateTicketPage';
import MyTicketsPage from './pages/MyTicketsPage';
import TicketDetailPage from './pages/TicketDetailPage';
import AdminLayout from './components/AdminLayout';
import UsersPage from './pages/admin/UsersPage';
import StatusesPage from './pages/admin/StatusesPage';
import SettingsPage from './pages/admin/SettingsPage';
import AuditLogsPage from './pages/admin/AuditLogsPage';
import 'bootstrap/dist/css/bootstrap.min.css';

// Geçici Dashboard bileşeni
const Dashboard = () => (
  <Container className="mt-4">
    <h1>Dashboard</h1>
    <p>Hoş geldiniz! Bu sayfa geliştirme aşamasındadır.</p>
  </Container>
);

// Geçici Ticket Kuyruğu bileşeni
const TicketQueuePage = () => (
  <Container className="mt-4">
    <h1>Ticket Kuyruğu</h1>
    <p>Operatör ticket kuyruğu sayfası geliştirme aşamasındadır.</p>
  </Container>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Herkese açık rotalar */}
          <Route path="/" element={<Container className="mt-4"><h1>Promtaki Destek Sistemi</h1></Container>} />
          
          {/* Sadece giriş yapmamış kullanıcılar için rotalar */}
          <Route element={<PublicOnlyRoute />}>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>
          
          {/* Korumalı rotalar - giriş yapmış tüm kullanıcılar */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/tickets/create" element={<CreateTicketPage />} />
            <Route path="/tickets/my" element={<MyTicketsPage />} />
            <Route path="/tickets/:id" element={<TicketDetailPage />} />
          </Route>
          
          {/* Rol tabanlı korumalı rotalar - sadece admin ve operatörler */}
          <Route element={<RoleProtectedRoute allowedRoles={['admin', 'operator']} />}>
            <Route path="/tickets/queue" element={<TicketQueuePage />} />
          </Route>
          
          {/* Admin Panel Rotaları - sadece admin rolü için */}
          <Route element={<RoleProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<UsersPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="statuses" element={<StatusesPage />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="audit-logs" element={<AuditLogsPage />} />
            </Route>
          </Route>
          
          {/* 404 sayfası */}
          <Route path="*" element={<Container className="mt-4"><h1>404 - Sayfa Bulunamadı</h1></Container>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
