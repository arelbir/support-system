import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Button, Row, Col, Card } from 'react-bootstrap';
import { AuthProvider, useAuth } from './contexts/AuthContext';
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

// Ana Sayfa bileşeni
const HomePage = () => {
  const { user } = useAuth();
  
  // Kullanıcı giriş yapmışsa dashboard'a yönlendir
  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8} lg={6}>
          <Card className="shadow-lg border-0">
            <Card.Body className="p-5">
              <div className="text-center mb-4">
                <h1 className="mb-3">Promtaki Destek Sistemi</h1>
                <p className="lead text-muted">
                  Müşteri destek taleplerini hızlı ve etkili bir şekilde yönetin
                </p>
              </div>
              
              <Row className="mt-4">
                <Col xs={12} md={6} className="mb-3">
                  <Button 
                    variant="primary" 
                    size="lg" 
                    href="/login" 
                    className="w-100"
                  >
                    Giriş Yap
                  </Button>
                </Col>
                <Col xs={12} md={6} className="mb-3">
                  <Button 
                    variant="outline-primary" 
                    size="lg" 
                    href="/register" 
                    className="w-100"
                  >
                    Kayıt Ol
                  </Button>
                </Col>
              </Row>
              
              <div className="text-center mt-4">
                <p className="text-muted small">
                  Promtaki, destek biletlerini yönetmek için geliştirilmiş modern bir platformdur.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Herkese açık rotalar */}
          <Route path="/" element={<HomePage />} />
          
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
