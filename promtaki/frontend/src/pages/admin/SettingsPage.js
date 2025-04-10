import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';

const SettingsPage = () => {
  const [settings, setSettings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentSetting, setCurrentSetting] = useState(null);
  const [formData, setFormData] = useState({
    key: '',
    value: '',
    description: '',
    type: 'string'
  });

  // Ayarları getir
  const fetchSettings = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setSettings(response.data.settings);
    } catch (error) {
      setError(error.response?.data?.message || 'Ayarlar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde ayarları getir
  useEffect(() => {
    fetchSettings();
  }, []);

  // Form değişikliklerini işle
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Ayar oluştur veya güncelle
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (modalMode === 'create') {
        // Yeni ayar oluştur
        await axios.post('/api/admin/settings', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setShowModal(false);
        fetchSettings();
      } else {
        // Ayarı güncelle
        await axios.put(`/api/admin/settings/${formData.key}`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setShowModal(false);
        fetchSettings();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'İşlem sırasında bir hata oluştu.');
    }
  };

  // Ayar silme
  const handleDeleteSetting = async (key) => {
    if (!window.confirm('Bu ayarı silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`/api/admin/settings/${key}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchSettings();
    } catch (error) {
      setError(error.response?.data?.message || 'Ayar silinirken bir hata oluştu.');
    }
  };

  // Yeni ayar oluşturma modalını aç
  const openCreateModal = () => {
    setFormData({
      key: '',
      value: '',
      description: '',
      type: 'string'
    });
    setModalMode('create');
    setShowModal(true);
  };

  // Ayar düzenleme modalını aç
  const openEditModal = (setting) => {
    setCurrentSetting(setting);
    setFormData({
      key: setting.key,
      value: setting.value,
      description: setting.description || '',
      type: setting.type
    });
    setModalMode('edit');
    setShowModal(true);
  };

  // Ayar değerini formatla
  const formatSettingValue = (value, type) => {
    if (type === 'boolean') {
      return value === 'true' ? 'Evet' : 'Hayır';
    } else if (type === 'json') {
      try {
        const jsonObj = JSON.parse(value);
        return <pre>{JSON.stringify(jsonObj, null, 2)}</pre>;
      } catch (e) {
        return value;
      }
    }
    return value;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Sistem Ayarları</h2>
        <Button variant="primary" onClick={openCreateModal}>
          Yeni Ayar Ekle
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
              <th>Anahtar</th>
              <th>Değer</th>
              <th>Tür</th>
              <th>Açıklama</th>
              <th>İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {settings.map(setting => (
              <tr key={setting.key}>
                <td><code>{setting.key}</code></td>
                <td>{formatSettingValue(setting.value, setting.type)}</td>
                <td>{setting.type}</td>
                <td>{setting.description || '-'}</td>
                <td>
                  <Button 
                    variant="outline-primary" 
                    size="sm" 
                    className="me-1"
                    onClick={() => openEditModal(setting)}
                  >
                    Düzenle
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={() => handleDeleteSetting(setting.key)}
                  >
                    Sil
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
      
      {/* Ayar Oluşturma/Düzenleme Modalı */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'create' ? 'Yeni Ayar Ekle' : 'Ayarı Düzenle'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Anahtar</Form.Label>
              <Form.Control
                type="text"
                name="key"
                value={formData.key}
                onChange={handleChange}
                required
                disabled={modalMode === 'edit'} // Düzenleme modunda anahtar değiştirilemez
              />
              <Form.Text className="text-muted">
                Ayar anahtarı benzersiz olmalıdır ve sadece harf, rakam, nokta ve alt çizgi içerebilir.
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Değer</Form.Label>
              <Form.Control
                as={formData.type === 'json' ? 'textarea' : 'input'}
                rows={formData.type === 'json' ? 5 : undefined}
                type={formData.type === 'number' ? 'number' : 'text'}
                name="value"
                value={formData.value}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Tür</Form.Label>
              <Form.Select
                name="type"
                value={formData.type}
                onChange={handleChange}
              >
                <option value="string">Metin (string)</option>
                <option value="number">Sayı (number)</option>
                <option value="boolean">Mantıksal (boolean)</option>
                <option value="json">JSON</option>
              </Form.Select>
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

export default SettingsPage;
