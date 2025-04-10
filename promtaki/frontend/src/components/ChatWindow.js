import React, { useState, useEffect, useRef } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';

const ChatWindow = ({ ticketId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const [isInternal, setIsInternal] = useState(false);
  
  const messagesEndRef = useRef(null);
  const { user, isOperator } = useAuth();
  const typingTimeoutRef = useRef(null);

  // Socket.IO bağlantısı kurma
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    // Socket.IO bağlantısı oluştur
    const socketInstance = io('http://localhost:5000', {
      auth: { token }
    });

    // Bağlantı olayları
    socketInstance.on('connect', () => {
      console.log('Socket.IO bağlantısı kuruldu');
      setIsConnected(true);
      
      // Ticket odasına katıl
      socketInstance.emit('join_ticket', ticketId);
    });

    socketInstance.on('connect_error', (err) => {
      console.error('Socket.IO bağlantı hatası:', err.message);
      setError(`Sohbet bağlantısı kurulamadı: ${err.message}`);
      setIsConnected(false);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO bağlantısı kesildi');
      setIsConnected(false);
    });

    // Mesaj alma olayı
    socketInstance.on('receive_message', (message) => {
      // Internal mesajları sadece operatörler görebilir
      if (message.isInternal && !isOperator) return;
      
      setMessages(prevMessages => [...prevMessages, message]);
    });

    // Kullanıcı yazıyor olayı
    socketInstance.on('user_typing', (data) => {
      // Kendi yazma bildirimini gösterme
      if (data.user.id === user.id) return;
      
      setTypingUsers(prev => {
        if (!prev.some(u => u.id === data.user.id)) {
          return [...prev, data.user];
        }
        return prev;
      });
    });

    // Kullanıcı yazmayı durdurdu olayı
    socketInstance.on('user_stop_typing', (data) => {
      setTypingUsers(prev => prev.filter(u => u.id !== data.user.id));
    });

    // Hata olayı
    socketInstance.on('error', (data) => {
      setError(data.message);
    });

    // Socket.IO instance'ını state'e kaydet
    setSocket(socketInstance);

    // Temizleme fonksiyonu
    return () => {
      if (socketInstance) {
        // Ticket odasından ayrıl
        socketInstance.emit('leave_ticket', ticketId);
        socketInstance.disconnect();
      }
    };
  }, [ticketId, user.id, isOperator]);

  // Mesajları getir
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/messages/ticket/${ticketId}`, {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Mesajlar yüklenirken bir hata oluştu.');
        }
        
        const data = await response.json();
        setMessages(data.messages);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      fetchMessages();
    }
  }, [ticketId]);

  // Mesajlar güncellendiğinde otomatik kaydırma
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Mesaj gönderme
  const handleSendMessage = (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !socket || !isConnected) return;
    
    // Mesajı gönder
    socket.emit('send_message', {
      content: newMessage,
      ticketId,
      isInternal
    });
    
    // Yazıyor bildirimini durdur
    socket.emit('stop_typing', ticketId);
    
    // Form alanını temizle
    setNewMessage('');
    setIsInternal(false);
  };

  // Yazıyor bildirimi gönderme
  const handleTyping = () => {
    if (!socket || !isConnected) return;
    
    // Yazıyor bildirimini gönder
    socket.emit('typing', ticketId);
    
    // Önceki zamanlayıcıyı temizle
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Yazma durduruldu bildirimini 2 saniye sonra gönder
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit('stop_typing', ticketId);
    }, 2000);
  };

  // Mesaj kartı
  const MessageCard = ({ message }) => {
    const isOwnMessage = message.senderId === user.id;
    const sender = message.User || { username: 'Bilinmeyen Kullanıcı', role: 'unknown' };
    
    return (
      <div 
        className={`d-flex mb-2 ${isOwnMessage ? 'justify-content-end' : 'justify-content-start'}`}
      >
        <div 
          className={`p-2 rounded ${isOwnMessage ? 'bg-primary text-white' : 'bg-light'}`}
          style={{ 
            maxWidth: '75%', 
            position: 'relative',
            borderTopLeftRadius: !isOwnMessage ? 0 : undefined,
            borderTopRightRadius: isOwnMessage ? 0 : undefined,
            backgroundColor: message.isInternal ? '#ffc107' : undefined
          }}
        >
          <div className="small mb-1">
            <strong>{sender.username}</strong>
            {message.isInternal && <span className="ms-2 badge bg-warning text-dark">Internal</span>}
            <span className="ms-2 text-muted" style={{ fontSize: '0.75rem' }}>
              {new Date(message.createdAt).toLocaleTimeString()}
            </span>
          </div>
          <div style={{ wordBreak: 'break-word' }}>{message.content}</div>
        </div>
      </div>
    );
  };

  return (
    <Card>
      <Card.Header>
        <h5 className="mb-0">Mesajlar</h5>
      </Card.Header>
      <Card.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        
        {loading ? (
          <div className="text-center my-3">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Yükleniyor...</span>
            </Spinner>
          </div>
        ) : (
          <>
            <div 
              className="chat-messages mb-3" 
              style={{ 
                height: '300px', 
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {messages.length === 0 ? (
                <div className="text-center text-muted my-5">
                  Henüz mesaj yok. İlk mesajı gönderen siz olun!
                </div>
              ) : (
                messages.map(message => (
                  <MessageCard key={message.id} message={message} />
                ))
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {typingUsers.length > 0 && (
              <div className="text-muted small mb-2">
                {typingUsers.map(user => user.username).join(', ')} yazıyor...
              </div>
            )}
            
            <Form onSubmit={handleSendMessage}>
              <div className="d-flex">
                <Form.Group className="flex-grow-1 me-2">
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Mesajınızı yazın..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyUp={handleTyping}
                    disabled={!isConnected}
                  />
                </Form.Group>
                <div className="d-flex flex-column">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={!newMessage.trim() || !isConnected}
                    className="mb-1"
                  >
                    Gönder
                  </Button>
                  
                  {isOperator && (
                    <Form.Check
                      type="checkbox"
                      id="internal-message"
                      label="Internal"
                      checked={isInternal}
                      onChange={(e) => setIsInternal(e.target.checked)}
                      className="mt-1"
                    />
                  )}
                </div>
              </div>
            </Form>
          </>
        )}
      </Card.Body>
    </Card>
  );
};

export default ChatWindow;
