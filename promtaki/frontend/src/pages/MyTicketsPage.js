import React, { useState, useEffect } from 'react';
import { Container, Table, Badge, Pagination, Alert, Spinner, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ticketService from '../services/ticketService';

const MyTicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  
  const { user } = useAuth();

  // Ticket'ları getir
  const fetchTickets = async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await ticketService.getMyTickets(page);
      setTickets(data.tickets);
      setPagination({
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        totalItems: data.totalItems
      });
    } catch (error) {
      setError(error.message || 'Ticket\'lar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde ticket'ları getir
  useEffect(() => {
    fetchTickets();
  }, []);

  // Sayfa değiştirme
  const handlePageChange = (page) => {
    fetchTickets(page);
  };

  // Öncelik badge'i
  const getPriorityBadge = (priority) => {
    switch (priority) {
      case 'low':
        return <Badge bg="success">Düşük</Badge>;
      case 'medium':
        return <Badge bg="info">Orta</Badge>;
      case 'high':
        return <Badge bg="warning">Yüksek</Badge>;
      case 'urgent':
        return <Badge bg="danger">Acil</Badge>;
      default:
        return <Badge bg="secondary">Bilinmiyor</Badge>;
    }
  };

  // Durum badge'i
  const getStatusBadge = (status) => {
    if (!status) return <Badge bg="secondary">Bilinmiyor</Badge>;
    
    return <Badge style={{ backgroundColor: status.color || '#777777' }}>{status.name}</Badge>;
  };

  // Pagination bileşeni
  const renderPagination = () => {
    if (pagination.totalPages <= 1) return null;
    
    const items = [];
    for (let i = 1; i <= pagination.totalPages; i++) {
      items.push(
        <Pagination.Item 
          key={i} 
          active={i === pagination.currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    return (
      <Pagination className="mt-3 justify-content-center">
        <Pagination.Prev 
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        />
        {items}
        <Pagination.Next 
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.totalPages}
        />
      </Pagination>
    );
  };

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Destek Taleplerim</h2>
        <Link to="/tickets/create">
          <Button variant="primary">Yeni Destek Talebi</Button>
        </Link>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </Spinner>
        </div>
      ) : tickets.length === 0 ? (
        <Alert variant="info">
          Henüz bir destek talebiniz bulunmuyor. Yeni bir destek talebi oluşturmak için "Yeni Destek Talebi" butonuna tıklayın.
        </Alert>
      ) : (
        <>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>#</th>
                <th>Konu</th>
                <th>Durum</th>
                <th>Öncelik</th>
                <th>Oluşturulma Tarihi</th>
                <th>Son Güncelleme</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>{ticket.id}</td>
                  <td>{ticket.subject}</td>
                  <td>{getStatusBadge(ticket.Status)}</td>
                  <td>{getPriorityBadge(ticket.priority)}</td>
                  <td>{new Date(ticket.createdAt).toLocaleString()}</td>
                  <td>{new Date(ticket.updatedAt).toLocaleString()}</td>
                  <td>
                    <Link to={`/tickets/${ticket.id}`}>
                      <Button variant="outline-primary" size="sm">Görüntüle</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {renderPagination()}
        </>
      )}
    </Container>
  );
};

export default MyTicketsPage;
