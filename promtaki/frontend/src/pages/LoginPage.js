import React, { useState } from 'react';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
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
    
    try {
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Giriş yapılırken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <Card className="shadow"> {/* Kart'a gölge eklendi */}
          <Card.Body className="p-4"> {/* Kart içeriği padding'i artırıldı */}
            <h2 className="text-center mb-4">Giriş Yap</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="email" className="mb-3">
                <Form.Label>E-posta</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="E-posta adresinizi girin" // Placeholder eklendi
                  required
                />
              </Form.Group>
              <Form.Group id="password" className="mb-3">
                <Form.Label>Şifre</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Şifrenizi girin" // Placeholder eklendi
                  required
                />
              </Form.Group>
              <Button disabled={loading} className="w-100 mt-3 rounded-pill" type="submit"> {/* Buton stili güncellendi */}
                {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
              </Button>
            </Form>
            <div className="text-center mt-3"> {/* Ek bilgi kartın içine alındı */}
              Hesabınız yok mu? <Link to="/register" className="text-primary">Kayıt Ol</Link> {/* Link belirginleştirildi */}
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default LoginPage;
