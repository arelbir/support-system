import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container, Button, Row, Col, Card, Image, } from 'react-bootstrap';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AppNavbar from './components/Navbar';
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
import './App.css';
// Dashboard bileşeni
const Dashboard = () => {
  // Örnek veriler (backend'den çekilmesi gerekecek)
  const openTickets = 5;
  const recentTickets = [
    { id: 1, title: 'Sorun 1', status: 'Açık' },
    { id: 2, title: 'Sorun 2', status: 'Çözüldü' },
    { id: 3, title: 'Sorun 3', status: 'Beklemede' },
  ];

  return (
    <Container className="mt-4">
      <h1 className="mb-4">Dashboard</h1>

      <Row>
        {/* Genel Bakış Kartları */}
        <Col md={4}>
          <Card className="mb-4 shadow-sm">
            <Card.Body>
              <Card.Title>Açık Ticket'lar</Card.Title>
              <Card.Text className="display-4 text-primary">{openTickets}</Card.Text>
            </Card.Body>
          </Card>
        </Col>
        {/* Diğer kartlar eklenebilir */}
      </Row>

      {/* Son Ticket'lar Listesi */}
      <Card className="shadow-sm">
        <Card.Header>Son Ticket'lar</Card.Header>
        <Card.Body>
        {recentTickets.length > 0 ? <ul>{recentTickets.map(ticket => <li key={ticket.id}><a href={`/tickets/${ticket.id}`}>{ticket.title}</a> - {ticket.status}</li>)}</ul> : <p>Son ticket bulunamadı.</p>}
        </Card.Body>
      </Card>
    </Container>
  );
};

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
    <div className="home-container bg-light"> {/* Arka plan rengi eklendi */}
      <Container className="h-100 d-flex align-items-center">
        <Row className="justify-content-center w-100">
          <Col md={8} lg={6} className="text-center">
            <Card className="home-card shadow-lg border-0 rounded-4">
              <Card.Body className="p-5">
                <div className="mb-4">
                  <Image src="/logo512.png" alt="Promtaki Logo" fluid className="mb-3 logo-shadow" style={{width:'180px'}}/> {/* Logo gölgesi eklendi boyutu arttırıldı */}
                  <h1 className="display-4 fw-bold mb-3 text-primary">Promtaki</h1> {/* Başlık rengi ve boyutu güncellendi */}
                  <p className="lead text-secondary"> {/* Paragraf rengi güncellendi */}
                    Müşteri destek taleplerinizi kolaylıkla yönetin.
                  </p>
                </div>
                
                <Row className="mt-4">
                <Row className="mt-4">
                  <Col xs={12} md={6} className="mb-3">
                    <Button 
                      variant="primary" 
                      size="lg" 
                      href="/login" 
                      className="w-100 rounded-pill" // Buton stili güncellendi
                    >
                      Giriş Yap
                    </Button>
                  </Col>
                  <Col xs={12} md={6} className="mb-3">
                    <Button 
                      variant="outline-primary" 
                      size="lg" 
                      href="/register" 
                      className="w-100 rounded-pill" // Buton stili güncellendi
                    >
                      Kayıt Ol
                    </Button>
                  </Col>
                  </Row>
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
    </div>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppNavbar />
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
