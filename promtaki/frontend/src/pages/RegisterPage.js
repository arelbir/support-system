import React, { useState } from 'react';
import { Form, Button, Alert, Container, Card } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register } = useAuth();
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
    
    // Şifre doğrulama kontrolü
    if (formData.password !== formData.confirmPassword) {
      return setError('Şifreler eşleşmiyor.');
    }
    
    // Şifre uzunluğu kontrolü
    if (formData.password.length < 6) {
      return setError('Şifre en az 6 karakter olmalıdır.');
    }
    
    setLoading(true);
    
    try {
      // confirmPassword'ü çıkar
      const { confirmPassword, ...userData } = formData;
      await register(userData);
      navigate('/dashboard');
    } catch (error) {
      setError(error.message || 'Kayıt olurken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <div className="w-100" style={{ maxWidth: '400px' }}>
        <Card className="shadow"> {/* Kart'a gölge eklendi */}
          <Card.Body>
            <h2 className="text-center mb-4">Kayıt Ol</h2>
            {error && <Alert variant="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
              <Form.Group id="username" className="mb-3">
                <Form.Label>Kullanıcı Adı</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  placeholder="Kullanıcı adınızı girin" // Placeholder eklendi
                />
              </Form.Group>
              <Form.Group id="email" className="mb-3">
                <Form.Label>E-posta</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="E-posta adresinizi girin" // Placeholder eklendi
                />
              </Form.Group>
              <Form.Group id="password" className="mb-3">
                <Form.Label>Şifre</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Şifrenizi girin (en az 6 karakter)" // Placeholder eklendi
                />
              </Form.Group>
              <Form.Group id="confirmPassword" className="mb-3">
                <Form.Label>Şifre Tekrar</Form.Label>
                <Form.Control
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="Şifrenizi tekrar girin" // Placeholder eklendi
                />
              </Form.Group>
              <Button disabled={loading} className="w-100 mt-3 rounded-pill" type="submit"> {/* Buton stili güncellendi */}
                {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
              </Button>
            </Form>
            <div className="text-center mt-3"> {/* Ek bilgi kartın içine alındı */}
              Zaten hesabınız var mı? <Link to="/login" className="text-primary">Giriş Yap</Link> {/* Link belirginleştirildi */}
            </div>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default RegisterPage;
