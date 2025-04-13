'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, Mail, LockKeyhole, Info, EyeOff, Eye } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email || !password) {
      return toast({
        title: "Hata",
        description: "Lütfen e-posta ve şifre giriniz",
        variant: "destructive"
      })
    }
    
    setIsSubmitting(true)
    
    try {
      await login(email, password)
      // Başarılı login sonrası useAuth içindeki yönlendirme çalışacak
    } catch (error) {
      toast({
        title: "Giriş başarısız",
        description: "E-posta veya şifre hatalı. Lütfen tekrar deneyin.",
        variant: "destructive"
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sol taraf - Login formu */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
        <div className="max-w-md mx-auto w-full space-y-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Tekrar Hoş Geldiniz!</h1>
            <p className="text-muted-foreground mt-2">Bimser Destek Sistemine Hoşgeldiniz</p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1">
              <label htmlFor="email" className="text-sm font-medium">
                E-posta Adresi
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="user3@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <div className="space-y-1">
              <div className="flex justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Şifre
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Şifremi Unuttum?
                </Link>
              </div>
              <div className="relative">
                <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-muted-foreground"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            
            <Button
              type="submit"
              className="w-full bg-slate-800 hover:bg-slate-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Giriş Yapılıyor
                </>
              ) : (
                "Giriş Yap"
              )}
            </Button>
          </form>
          
          <div className="text-center text-sm text-muted-foreground">
            <Link
              href="#"
              className="text-primary hover:underline flex items-center justify-center gap-1"
            >
              <Info className="h-4 w-4" />
              Kayıt Ol
            </Link>
          </div>
        </div>
      </div>
      
      {/* Sağ taraf - Marka/Ürün görüntüsü */}
      <div className="hidden md:block md:w-1/2 bg-slate-900">
        <div className="h-full flex flex-col justify-center items-center p-12 text-white">
          <h2 className="text-3xl font-bold mb-2">Bimser Destek Sistemi</h2>
          <p className="text-sm mb-6 text-center">
            Bimser Destek Sistemi ile kolay ve hızlı destek
          </p>
          {/* Opsiyonel: Logo veya ürün görseli */}
          {/* <Image src="/logo.png" alt="Logo" width={200} height={100} /> */}
        </div>
      </div>
    </div>
  )
}
