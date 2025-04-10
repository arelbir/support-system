import React from 'react';
import { Container, Nav, Navbar, NavDropdown } from 'react-bootstrap';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/admin">Promtaki Admin</Navbar.Brand>
          <Navbar.Toggle aria-controls="admin-navbar-nav" />
          <Navbar.Collapse id="admin-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/admin/users">Kullanıcılar</Nav.Link>
              <Nav.Link as={Link} to="/admin/statuses">Durumlar</Nav.Link>
              <Nav.Link as={Link} to="/admin/settings">Ayarlar</Nav.Link>
              <Nav.Link as={Link} to="/admin/audit-logs">Denetim Kayıtları</Nav.Link>
            </Nav>
            <Nav>
              <NavDropdown title={user?.username || 'Kullanıcı'} id="admin-nav-dropdown">
                <NavDropdown.Item as={Link} to="/dashboard">Dashboard</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={handleLogout}>Çıkış Yap</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      
      <Container className="py-4">
        <Outlet />
      </Container>
    </>
  );
};

export default AdminLayout;
