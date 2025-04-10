import React from 'react';
import { Navbar, Nav, Container, NavDropdown, Image } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // AuthContext'i import et

const AppNavbar = () => {
  const { user, logout } = useAuth(); // useAuth ile kullanıcı bilgilerine ve logout fonksiyonuna eriş

  return (
    <Navbar bg="light" expand="lg">
      <Container>
        <Navbar.Brand as={Link} to="/">          
          Promtaki
          <Image
            src="/logo192.png" // Replace with your actual logo path
            alt="Logo"
            width="30"
            height="30"
            className="d-inline-block align-top ms-2"/>
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard">Dashboard</Nav.Link>
            <Nav.Link as={Link} to="/tickets/create">Ticket Oluştur</Nav.Link>
            <Nav.Link as={Link} to="/tickets/my">Ticketlarım</Nav.Link>
          </Nav>
          <Nav>
            {user ? (
              <NavDropdown title={user.email} id="basic-nav-dropdown"> {/* Kullanıcı email'i veya adı */}
                {/* <NavDropdown.Item as={Link} to="/profile">Profil</NavDropdown.Item>  Profil sayfası eklenebilir */}
                <NavDropdown.Item onClick={logout}>Çıkış Yap</NavDropdown.Item>
              </NavDropdown>
            ) : (
              <Nav.Link as={Link} to="/login">Login</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;