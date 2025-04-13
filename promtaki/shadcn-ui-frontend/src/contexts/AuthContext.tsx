import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import userServiceV2, { User } from '@/services/userServiceV2'

type AuthContextType = {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  checkAuth: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  
  // İlk yükleme sırasında mevcut token'ı kontrol et
  useEffect(() => {
    const initAuth = async () => {
      try {
        const isAuthenticated = await checkAuth()
        if (!isAuthenticated) {
          // Eğer auth sayfasında değilsek, login sayfasına yönlendir
          const pathname = window.location.pathname
          if (!pathname.includes('/auth')) {
            router.push('/auth/login')
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    initAuth()
  }, [router])
  
  // Token ile kullanıcı verilerini getir
  const checkAuth = async (): Promise<boolean> => {
    const token = localStorage.getItem('auth_token')
    
    if (!token) {
      return false
    }
    
    try {
      const userData = await userServiceV2.getCurrentUser()
      setUser(userData)
      return true
    } catch (error) {
      console.error('Authentication check failed:', error)
      localStorage.removeItem('auth_token')
      setUser(null)
      return false
    }
  }
  
  // Kullanıcı girişi
  const login = async (email: string, password: string) => {
    setIsLoading(true)
    
    try {
      const response = await userServiceV2.login(email, password)
      
      // Kullanıcı bilgisini ayarla ve rol bazlı yönlendirme yap
      setUser(response.user)
      
      // Kullanıcı rolüne göre yönlendirme
      if (response.user.role === 'admin') {
        router.push('/admin')
      } else if (response.user.role === 'operator') {
        router.push('/operator')
      } else {
        router.push('/customer')
      }
      
    } catch (error) {
      console.error('Login error:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }
  
  // Kullanıcı çıkışı
  const logout = async () => {
    setIsLoading(true)
    
    try {
      await userServiceV2.logout()
      setUser(null)
      router.push('/auth/login')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  const value = {
    user,
    isAuthenticated: !!user || !!localStorage.getItem('auth_token'),
    isLoading,
    login,
    logout,
    checkAuth
  }
  
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
