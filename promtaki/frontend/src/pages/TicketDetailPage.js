import React, { useState, useEffect } from 'react';
import { Container, Card, Row, Col, Badge, Button, Alert, Spinner, Form } from 'react-bootstrap';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import ticketService from '../services/ticketService';
import ChatWindow from '../components/ChatWindow';

const TicketDetailPage = () => {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statuses, setStatuses] = useState([]);
  const [operators, setOperators] = useState([]);
  const [loadingAction, setLoadingAction] = useState(false);
  
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isOperator } = useAuth();

  // Ticket detaylarını getir
  const fetchTicket = async () => {
    setLoading(true);
    setError('');
    
    try {
      const data = await ticketService.getTicketById(id);
      setTicket(data.ticket);
    } catch (error) {
      setError(error.message || 'Ticket detayları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde ticket detaylarını getir
  useEffect(() => {
    fetchTicket();
    
    // Operatörler için durum ve operatör listelerini getir
    if (isOperator) {
      // Burada normalde durum listesi ve operatör listesi API'den alınacak
      // Şimdilik örnek veriler kullanıyoruz
      setStatuses([
        { id: 1, name: 'Açık', color: '#28a745' },
        { id: 2, name: 'İşleniyor', color: '#007bff' },
        { id: 3, name: 'Beklemede', color: '#ffc107' },
        { id: 4, name: 'Çözüldü', color: '#6c757d' },
        { id: 5, name: 'Kapatıldı', color: '#343a40' }
      ]);
      
      setOperators([
        { id: 2, username: 'operator1', email: 'operator1@example.com' },
        { id: 3, username: 'operator2', email: 'operator2@example.com' },
        { id: 4, username: 'admin', email: 'admin@example.com' }
      ]);
    }
  }, [id, isOperator]);

  // Durum güncelleme
  const handleStatusChange = async (statusId) => {
    setLoadingAction(true);
    setError('');
    
    try {
      const data = await ticketService.updateTicketStatus(id, statusId);
      setTicket(data.ticket);
    } catch (error) {
      setError(error.message || 'Durum güncellenirken bir hata oluştu.');
    } finally {
      setLoadingAction(false);
    }
  };

  // Operatör atama
  const handleAssignOperator = async (operatorId) => {
    setLoadingAction(true);
    setError('');
    
    try {
      const data = await ticketService.assignOperator(id, operatorId);
      setTicket(data.ticket);
    } catch (error) {
      setError(error.message || 'Operatör atanırken bir hata oluştu.');
    } finally {
      setLoadingAction(false);
    }
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

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Yükleniyor...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">
          {error}
          <div className="mt-3">
            <Button variant="primary" onClick={() => navigate('/tickets/my')}>
              Destek Taleplerime Dön
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  if (!ticket) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          Ticket bulunamadı.
          <div className="mt-3">
            <Button variant="primary" onClick={() => navigate('/tickets/my')}>
              Destek Taleplerime Dön
            </Button>
          </div>
        </Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Destek Talebi #{ticket.id}</h2>
        <Button variant="outline-secondary" onClick={() => navigate('/tickets/my')}>
          Destek Taleplerime Dön
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Header>
          <Row>
            <Col md={8}>
              <h5>{ticket.subject}</h5>
            </Col>
            <Col md={4} className="text-md-end">
              {getStatusBadge(ticket.Status)} {getPriorityBadge(ticket.priority)}
            </Col>
          </Row>
        </Card.Header>
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <strong>Oluşturan:</strong> {ticket.User?.username || 'Bilinmiyor'}
            </Col>
            <Col md={6}>
              <strong>Atanan Operatör:</strong> {ticket.assignedOperator?.username || 'Atanmadı'}
            </Col>
          </Row>
          <Row className="mb-3">
            <Col md={6}>
              <strong>Oluşturulma Tarihi:</strong> {new Date(ticket.createdAt).toLocaleString()}
            </Col>
            <Col md={6}>
              <strong>Son Güncelleme:</strong> {new Date(ticket.updatedAt).toLocaleString()}
            </Col>
          </Row>
          {ticket.category && (
            <Row className="mb-3">
              <Col>
                <strong>Kategori:</strong> {ticket.category}
              </Col>
            </Row>
          )}
          <Row>
            <Col>
              <strong>Açıklama:</strong>
              <p className="mt-2">{ticket.description}</p>
            </Col>
          </Row>
        </Card.Body>
      </Card>
      
      {isOperator && (
        <Card className="mb-4">
          <Card.Header>Operatör İşlemleri</Card.Header>
          <Card.Body>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Group>
                  <Form.Label>Durum Güncelle</Form.Label>
                  <Form.Select
                    value={ticket.statusId}
                    onChange={(e) => handleStatusChange(e.target.value)}
                    disabled={loadingAction}
                  >
                    {statuses.map(status => (
                      <option key={status.id} value={status.id}>
                        {status.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Operatör Ata</Form.Label>
                  <Form.Select
                    value={ticket.assignedOperatorId || ''}
                    onChange={(e) => handleAssignOperator(e.target.value || null)}
                    disabled={loadingAction}
                  >
                    <option value="">Atanmadı</option>
                    {operators.map(operator => (
                      <option key={operator.id} value={operator.id}>
                        {operator.username} ({operator.email})
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Card.Body>
        </Card>
      )}
      
      <ChatWindow ticketId={id} />
    </Container>
  );
};

export default TicketDetailPage;
