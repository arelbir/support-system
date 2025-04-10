import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Alert, Badge, Spinner, Row, Col } from 'react-bootstrap';
import axios from 'axios';

const StatusesPage = () => {
  const [statuses, setStatuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentStatus, setCurrentStatus] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    color: '#777777',
    description: '',
    isDefault: false,
    order: 0
  });

  // Durumları getir
  const fetchStatuses = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/statuses', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setStatuses(response.data.statuses);
    } catch (error) {
      setError(error.response?.data?.message || 'Durumlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde durumları getir
  useEffect(() => {
    fetchStatuses();
  }, []);

  // Form değişikliklerini işle
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Durum oluştur veya güncelle
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (modalMode === 'create') {
        // Yeni durum oluştur
        await axios.post('/api/admin/statuses', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setShowModal(false);
        fetchStatuses();
      } else {
        // Durumu güncelle
        await axios.put(`/api/admin/statuses/${currentStatus.id}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setShowModal(false);
        fetchStatuses();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'İşlem sırasında bir hata oluştu.');
    }
  };

  // Durum silme
  const handleDeleteStatus = async (statusId) => {
    if (!window.confirm('Bu durumu silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`/api/admin/statuses/${statusId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchStatuses();
    } catch (error) {
      setError(error.response?.data?.message || 'Durum silinirken bir hata oluştu.');
    }
  };

  // Yeni durum oluşturma modalını aç
  const openCreateModal = () => {
    setFormData({
      name: '',
      color: '#777777',
      description: '',
      isDefault: false,
      order: statuses.length
    });
    setModalMode('create');
    setShowModal(true);
  };

  // Durum düzenleme modalını aç
  const openEditModal = (status) => {
    setCurrentStatus(status);
    setFormData({
      name: status.name,
      color: status.color,
      description: status.description || '',
      isDefault: status.isDefault,
      order: status.order
    });
    setModalMode('edit');
    setShowModal(true);
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Durum Yönetimi</h2>
        <Button variant="primary" onClick={openCreateModal}>
          Yeni Durum Ekle
        </Button>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Yükleniyor...</span>
          </Spinner>
        </div>
      ) : (
        <Table responsive striped hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Durum</th>
              <th>Renk</th>
              <th>Açıklama</th>
              <th>Varsayılan</th>
              <th>Sıra</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {statuses.map(status => (
              <tr key={status.id}>
                <td>{status.id}</td>
                <td>
                  <Badge 
                    style={{ 
                      backgroundColor: status.color,
                      color: isLightColor(status.color) ? '#000' : '#fff'
                    }}
                  >
                    {status.name}
                  </Badge>
                </td>
                <td>
                  <div 
                    style={{ 
                      width: '20px', 
                      height: '20px', 
                      backgroundColor: status.color,
                      border: '1px solid #ddd',
                      display: 'inline-block'
                    }}
                  ></div>
                  <span className="ms-2">{status.color}</span>
                </td>
                <td>{status.description || '-'}</td>
                <td>
                  {status.isDefault ? (
                    <Badge bg="success">Evet</Badge>
                  ) : (
                    <Badge bg="secondary">Hayır</Badge>
                  )}
                </td>
                <td>{status.order}</td>
                <td>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-1"
                    onClick={() => openEditModal(status)}
                  >
                    Düzenle
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDeleteStatus(status.id)}
                    disabled={status.isDefault}
                  >
                    Sil
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      
      {/* Durum Oluşturma/Düzenleme Modalı */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'create' ? 'Yeni Durum Ekle' : 'Durumu Düzenle'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Durum Adı</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Renk</Form.Label>
              <Row>
                <Col xs={3}>
                  <Form.Control
                    type="color"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    title="Durum rengini seçin"
                  />
                </Col>
                <Col xs={9}>
                  <Form.Control
                    type="text"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                    required
                  />
                </Col>
              </Row>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Açıklama</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Sıra</Form.Label>
              <Form.Control
                type="number"
                name="order"
                value={formData.order}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Varsayılan Durum"
                name="isDefault"
                checked={formData.isDefault}
                onChange={handleChange}
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowModal(false)}>
                İptal
              </Button>
              <Button variant="primary" type="submit">
                {modalMode === 'create' ? 'Oluştur' : 'Güncelle'}
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

// Rengin açık mı koyu mu olduğunu kontrol et
const isLightColor = (color) => {
  // Hex renk kodunu RGB'ye dönüştür
  let hex = color.replace('#', '');
  let r = parseInt(hex.substr(0, 2), 16);
  let g = parseInt(hex.substr(2, 2), 16);
  let b = parseInt(hex.substr(4, 2), 16);
  
  // Parlaklık hesapla (YIQ formülü)
  let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
  
  // 128'den büyükse açık renk, değilse koyu renk
  return yiq >= 128;
};

export default StatusesPage;
