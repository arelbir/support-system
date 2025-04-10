import React, { useState } from 'react';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ticketService from '../services/ticketService';

const CreateTicketPage = () => {
  const [formData, setFormData] = useState({
    subject: '',
    description: '',
    priority: 'medium',
    category: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setSuccess(false);
    
    try {
      const response = await ticketService.createTicket(formData);
      setSuccess(true);
      setTimeout(() => {
        navigate(`/tickets/${response.ticket.id}`);
      }, 1500);
    } catch (error) {
      setError(error.message || 'Ticket oluşturulurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Yeni Destek Talebi Oluştur</h2>
      <Card>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          {success && <Alert variant="success">Destek talebiniz başarıyla oluşturuldu! Yönlendiriliyorsunuz...</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Konu</Form.Label>
              <Form.Control
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                disabled={loading || success}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Açıklama</Form.Label>
              <Form.Control
                as="textarea"
                rows={5}
                name="description"
                value={formData.description}
                onChange={handleChange}
                required
                disabled={loading || success}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Öncelik</Form.Label>
              <Form.Select
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                disabled={loading || success}
              >
                <option value="low">Düşük</option>
                <option value="medium">Orta</option>
                <option value="high">Yüksek</option>
                <option value="urgent">Acil</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Kategori</Form.Label>
              <Form.Control
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                disabled={loading || success}
              />
            </Form.Group>
            
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading || success}
              className="mt-3"
            >
              {loading ? 'Gönderiliyor...' : 'Destek Talebi Oluştur'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateTicketPage;
