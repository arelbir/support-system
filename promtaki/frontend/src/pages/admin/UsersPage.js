import React, { useState, useEffect } from 'react';
import { Table, Button, Form, Modal, Alert, Pagination, Badge, Spinner } from 'react-bootstrap';
import axios from 'axios';

const UsersPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'customer',
    isActive: true
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordData, setPasswordData] = useState({
    userId: null,
    newPassword: '',
    confirmPassword: ''
  });

  // Kullanıcıları getir
  const fetchUsers = async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/api/admin/users?page=${page}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data.users);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalItems: response.data.totalItems
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Kullanıcılar yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Sayfa yüklendiğinde kullanıcıları getir
  useEffect(() => {
    fetchUsers();
  }, []);

  // Form değişikliklerini işle
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Şifre formu değişikliklerini işle
  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  // Kullanıcı oluştur veya güncelle
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      if (modalMode === 'create') {
        // Yeni kullanıcı oluştur
        await axios.post('/api/admin/users', formData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setShowModal(false);
        fetchUsers();
      } else {
        // Kullanıcıyı güncelle
        const { password, ...updateData } = formData; // Şifreyi çıkar
        
        await axios.put(`/api/admin/users/${currentUser.id}`, updateData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setShowModal(false);
        fetchUsers();
      }
    } catch (error) {
      setError(error.response?.data?.message || 'İşlem sırasında bir hata oluştu.');
    }
  };

  // Şifre sıfırlama
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Şifreler eşleşmiyor.');
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.put(`/api/admin/users/${passwordData.userId}/reset-password`, {
        newPassword: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setShowPasswordModal(false);
      setPasswordData({
        userId: null,
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Şifre sıfırlanırken bir hata oluştu.');
    }
  };

  // Kullanıcı silme
  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Bu kullanıcıyı silmek istediğinizden emin misiniz?')) {
      return;
    }
    
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      fetchUsers();
    } catch (error) {
      setError(error.response?.data?.message || 'Kullanıcı silinirken bir hata oluştu.');
    }
  };

  // Yeni kullanıcı oluşturma modalını aç
  const openCreateModal = () => {
    setFormData({
      username: '',
      email: '',
      password: '',
      role: 'customer',
      isActive: true
    });
    setModalMode('create');
    setShowModal(true);
  };

  // Kullanıcı düzenleme modalını aç
  const openEditModal = (user) => {
    setCurrentUser(user);
    setFormData({
      username: user.username,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive
    });
    setModalMode('edit');
    setShowModal(true);
  };

  // Şifre sıfırlama modalını aç
  const openPasswordModal = (userId) => {
    setPasswordData({
      userId,
      newPassword: '',
      confirmPassword: ''
    });
    setShowPasswordModal(true);
  };

  // Sayfa değiştirme
  const handlePageChange = (page) => {
    fetchUsers(page);
  };

  // Rol badge'i
  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return <Badge bg="danger">Admin</Badge>;
      case 'operator':
        return <Badge bg="primary">Operatör</Badge>;
      case 'customer':
        return <Badge bg="success">Müşteri</Badge>;
      default:
        return <Badge bg="secondary">{role}</Badge>;
    }
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
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Kullanıcı Yönetimi</h2>
        <Button variant="primary" onClick={openCreateModal}>
          Yeni Kullanıcı Ekle
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
        <>
          <Table responsive striped hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Kullanıcı Adı</th>
                <th>E-posta</th>
                <th>Rol</th>
                <th>Durum</th>
                <th>Kayıt Tarihi</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{getRoleBadge(user.role)}</td>
                  <td>
                    {user.isActive ? (
                      <Badge bg="success">Aktif</Badge>
                    ) : (
                      <Badge bg="danger">Pasif</Badge>
                    )}
                  </td>
                  <td>{new Date(user.createdAt).toLocaleString()}</td>
                  <td>
                    <Button 
                      variant="outline-primary" 
                      size="sm" 
                      className="me-1"
                      onClick={() => openEditModal(user)}
                    >
                      Düzenle
                    </Button>
                    <Button 
                      variant="outline-warning" 
                      size="sm" 
                      className="me-1"
                      onClick={() => openPasswordModal(user.id)}
                    >
                      Şifre Sıfırla
                    </Button>
                    <Button 
                      variant="outline-danger" 
                      size="sm"
                      onClick={() => handleDeleteUser(user.id)}
                    >
                      Sil
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {renderPagination()}
        </>
      )}
      
      {/* Kullanıcı Oluşturma/Düzenleme Modalı */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === 'create' ? 'Yeni Kullanıcı Ekle' : 'Kullanıcıyı Düzenle'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Kullanıcı Adı</Form.Label>
              <Form.Control
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>E-posta</Form.Label>
              <Form.Control
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </Form.Group>
            
            {modalMode === 'create' && (
              <Form.Group className="mb-3">
                <Form.Label>Şifre</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required={modalMode === 'create'}
                />
              </Form.Group>
            )}
            
            <Form.Group className="mb-3">
              <Form.Label>Rol</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="customer">Müşteri</option>
                <option value="operator">Operatör</option>
                <option value="admin">Admin</option>
              </Form.Select>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Check
                type="checkbox"
                label="Aktif"
                name="isActive"
                checked={formData.isActive}
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
      
      {/* Şifre Sıfırlama Modalı */}
      <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Şifre Sıfırla</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleResetPassword}>
            <Form.Group className="mb-3">
              <Form.Label>Yeni Şifre</Form.Label>
              <Form.Control
                type="password"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Şifre Tekrar</Form.Label>
              <Form.Control
                type="password"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                required
              />
            </Form.Group>
            
            <div className="d-flex justify-content-end">
              <Button variant="secondary" className="me-2" onClick={() => setShowPasswordModal(false)}>
                İptal
              </Button>
              <Button variant="primary" type="submit">
                Şifreyi Sıfırla
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default UsersPage;
