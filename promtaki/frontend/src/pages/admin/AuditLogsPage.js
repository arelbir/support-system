import React, { useState, useEffect } from 'react';
import { Table, Form, Alert, Spinner, Pagination, Badge, Row, Col, Button } from 'react-bootstrap';
import axios from 'axios';

const AuditLogsPage = () => {
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0
  });
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    startDate: '',
    endDate: ''
  });
  const [actions, setActions] = useState([]);
  const [users, setUsers] = useState([]);

  // Denetim kayıtlarını getir
  const fetchAuditLogs = async (page = 1) => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      
      // Filtre parametrelerini oluştur
      const params = new URLSearchParams();
      params.append('page', page);
      
      if (filters.action) params.append('action', filters.action);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      
      const response = await axios.get(`/api/admin/audit-logs?${params.toString()}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAuditLogs(response.data.auditLogs);
      setPagination({
        currentPage: response.data.currentPage,
        totalPages: response.data.totalPages,
        totalItems: response.data.totalItems
      });
    } catch (error) {
      setError(error.response?.data?.message || 'Denetim kayıtları yüklenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  // Eylem türlerini getir
  const fetchActions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/audit-logs/actions', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setActions(response.data.actions);
    } catch (error) {
      console.error('Eylem türleri yüklenirken bir hata oluştu:', error);
    }
  };

  // Kullanıcıları getir
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data.users);
    } catch (error) {
      console.error('Kullanıcılar yüklenirken bir hata oluştu:', error);
    }
  };

  // Sayfa yüklendiğinde denetim kayıtlarını, eylem türlerini ve kullanıcıları getir
  useEffect(() => {
    fetchAuditLogs();
    fetchActions();
    fetchUsers();
  }, []);

  // Filtre değişikliklerini işle
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  // Filtreleri uygula
  const handleApplyFilters = (e) => {
    e.preventDefault();
    fetchAuditLogs(1); // Filtreleri uygularken ilk sayfaya dön
  };

  // Filtreleri sıfırla
  const handleResetFilters = () => {
    setFilters({
      action: '',
      userId: '',
      startDate: '',
      endDate: ''
    });
    
    // Filtreleri sıfırladıktan sonra denetim kayıtlarını yeniden getir
    setTimeout(() => {
      fetchAuditLogs(1);
    }, 0);
  };

  // Sayfa değiştirme
  const handlePageChange = (page) => {
    fetchAuditLogs(page);
  };

  // Eylem badge'i
  const getActionBadge = (action) => {
    switch (action) {
      case 'CREATE_USER':
      case 'CREATE_STATUS':
      case 'CREATE_SETTING':
        return <Badge bg="success">Oluşturma</Badge>;
      case 'UPDATE_USER':
      case 'UPDATE_STATUS':
      case 'UPDATE_SETTING':
        return <Badge bg="primary">Güncelleme</Badge>;
      case 'DELETE_USER':
      case 'DELETE_STATUS':
      case 'DELETE_SETTING':
        return <Badge bg="danger">Silme</Badge>;
      case 'RESET_PASSWORD':
        return <Badge bg="warning">Şifre Sıfırlama</Badge>;
      default:
        return <Badge bg="secondary">{action}</Badge>;
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
      <h2 className="mb-4">Denetim Kayıtları</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Filtreler */}
      <Form onSubmit={handleApplyFilters} className="mb-4">
        <Row>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Eylem Türü</Form.Label>
              <Form.Select
                name="action"
                value={filters.action}
                onChange={handleFilterChange}
              >
                <option value="">Tümü</option>
                {actions.map(action => (
                  <option key={action} value={action}>{action}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Kullanıcı</Form.Label>
              <Form.Select
                name="userId"
                value={filters.userId}
                onChange={handleFilterChange}
              >
                <option value="">Tümü</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Başlangıç Tarihi</Form.Label>
              <Form.Control
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group className="mb-3">
              <Form.Label>Bitiş Tarihi</Form.Label>
              <Form.Control
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
              />
            </Form.Group>
          </Col>
        </Row>
        <div className="d-flex justify-content-end">
          <Button variant="secondary" className="me-2" onClick={handleResetFilters}>
            Filtreleri Sıfırla
          </Button>
          <Button variant="primary" type="submit">
            Filtreleri Uygula
          </Button>
        </div>
      </Form>
      
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
                <th>Eylem</th>
                <th>Kullanıcı</th>
                <th>Detaylar</th>
                <th>Tarih</th>
              </tr>
            </thead>
            <tbody>
              {auditLogs.map(log => (
                <tr key={log.id}>
                  <td>{log.id}</td>
                  <td>{getActionBadge(log.action)}</td>
                  <td>{log.user?.username || 'Bilinmeyen Kullanıcı'}</td>
                  <td>{log.details}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          
          {auditLogs.length === 0 && (
            <Alert variant="info">
              Belirtilen kriterlere uygun denetim kaydı bulunamadı.
            </Alert>
          )}
          
          {renderPagination()}
        </>
      )}
    </div>
  );
};

export default AuditLogsPage;
