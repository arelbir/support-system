// Frontend test script
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../src/contexts/AuthContext';
import LoginPage from '../src/pages/LoginPage';
import RegisterPage from '../src/pages/RegisterPage';
import CreateTicketPage from '../src/pages/CreateTicketPage';
import MyTicketsPage from '../src/pages/MyTicketsPage';

// Mock axios
jest.mock('axios', () => ({
  post: jest.fn(() => Promise.resolve({ 
    data: { 
      token: 'test-token',
      user: {
        id: 1,
        username: 'testuser',
        email: 'test@example.com',
        role: 'customer'
      }
    } 
  })),
  get: jest.fn(() => Promise.resolve({ 
    data: { 
      tickets: [
        {
          id: 1,
          title: 'Test Ticket',
          description: 'Test Description',
          status: 'Open',
          createdAt: new Date().toISOString()
        }
      ],
      totalPages: 1,
      currentPage: 1
    } 
  }))
}));

// Mock localStorage
const localStorageMock = (function() {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value.toString();
    }),
    clear: jest.fn(() => {
      store = {};
    }),
    removeItem: jest.fn(key => {
      delete store[key];
    })
  };
})();
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock
});

// Helper function to render with providers
const renderWithProviders = (ui) => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        {ui}
      </AuthProvider>
    </BrowserRouter>
  );
};

// Test suites
describe('LoginPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.clear();
  });

  test('renders login form', () => {
    renderWithProviders(<LoginPage />);
    
    expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /giriş yap/i })).toBeInTheDocument();
  });

  test('submits login form with user credentials', async () => {
    const axios = require('axios');
    renderWithProviders(<LoginPage />);
    
    fireEvent.change(screen.getByLabelText(/e-posta/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/şifre/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /giriş yap/i }));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/auth/login',
        { email: 'test@example.com', password: 'password123' }
      );
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'test-token');
    });
  });
});

describe('RegisterPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders registration form', () => {
    renderWithProviders(<RegisterPage />);
    
    expect(screen.getByLabelText(/kullanıcı adı/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-posta/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/şifre tekrar/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /kayıt ol/i })).toBeInTheDocument();
  });

  test('validates password match', async () => {
    renderWithProviders(<RegisterPage />);
    
    fireEvent.change(screen.getByLabelText(/kullanıcı adı/i), {
      target: { value: 'testuser' }
    });
    
    fireEvent.change(screen.getByLabelText(/e-posta/i), {
      target: { value: 'test@example.com' }
    });
    
    fireEvent.change(screen.getByLabelText(/şifre/i), {
      target: { value: 'password123' }
    });
    
    fireEvent.change(screen.getByLabelText(/şifre tekrar/i), {
      target: { value: 'password456' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /kayıt ol/i }));
    
    await waitFor(() => {
      expect(screen.getByText(/şifreler eşleşmiyor/i)).toBeInTheDocument();
    });
  });
});

describe('CreateTicketPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.setItem('token', 'test-token');
  });

  test('renders ticket creation form', () => {
    renderWithProviders(<CreateTicketPage />);
    
    expect(screen.getByLabelText(/başlık/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/açıklama/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/öncelik/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /oluştur/i })).toBeInTheDocument();
  });

  test('submits ticket creation form', async () => {
    const axios = require('axios');
    renderWithProviders(<CreateTicketPage />);
    
    fireEvent.change(screen.getByLabelText(/başlık/i), {
      target: { value: 'Test Ticket' }
    });
    
    fireEvent.change(screen.getByLabelText(/açıklama/i), {
      target: { value: 'This is a test ticket' }
    });
    
    fireEvent.change(screen.getByLabelText(/öncelik/i), {
      target: { value: 'high' }
    });
    
    fireEvent.click(screen.getByRole('button', { name: /oluştur/i }));
    
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        '/api/tickets',
        { title: 'Test Ticket', description: 'This is a test ticket', priority: 'high' },
        { headers: { Authorization: 'Bearer test-token' } }
      );
    });
  });
});

describe('MyTicketsPage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.setItem('token', 'test-token');
  });

  test('renders tickets list', async () => {
    const axios = require('axios');
    renderWithProviders(<MyTicketsPage />);
    
    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        '/api/tickets/my',
        { headers: { Authorization: 'Bearer test-token' } }
      );
    });
    
    await waitFor(() => {
      expect(screen.getByText(/test ticket/i)).toBeInTheDocument();
    });
  });
});
