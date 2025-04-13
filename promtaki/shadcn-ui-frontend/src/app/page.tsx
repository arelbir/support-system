'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Image from 'next/image'

// Temsili kullanıcı kontrol fonksiyonu - gerçek projede auth sistemi ile değiştirilecek
const checkUserRole = () => {
  // Burada normalde bir auth servisi kullanılır
  // Mock olarak rasgele bir rol döndürelim
  return ['customer', 'operator', 'admin'][Math.floor(Math.random() * 3)]
}

export default function Home() {
  const router = useRouter()
  
  // Sayfa yüklendiğinde kullanıcı rolüne göre yönlendirme yap
  useEffect(() => {
    // Gerçek projede oturum kontrolü ve yetkilendirme burada yapılır
    // const role = checkUserRole()
    // if (role === 'customer') router.push('/customer/tickets')
    // else if (role === 'operator') router.push('/operator/inbox')
    // else if (role === 'admin') router.push('/admin')
    
    // Şimdilik kullanıcı seçimine izin verelim
  }, [router])
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-slate-50">
      <div className="max-w-6xl w-full my-8 text-center space-y-4">
        <h1 className="text-4xl font-bold">Support Ticket System</h1>
        <p className="text-muted-foreground">Modern ve kullanıcı dostu destek sistemi</p>
      </div>
      
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Giriş</CardTitle>
          <CardDescription>Rolünüze göre sisteme erişin</CardDescription>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="customer" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="customer">Müşteri</TabsTrigger>
              <TabsTrigger value="operator">Operatör</TabsTrigger>
              <TabsTrigger value="admin">Yönetici</TabsTrigger>
            </TabsList>
            
            <TabsContent value="customer" className="mt-4 text-center space-y-4">
              <p>Müşteri olarak taleplerinizi görüntüleyin ve yeni talepler oluşturun.</p>
              <Button onClick={() => router.push('/customer/tickets')}>
                Devam Et
              </Button>
            </TabsContent>
            
            <TabsContent value="operator" className="mt-4 text-center space-y-4">
              <p>Operatör olarak bilet kuyruğunu yönetin ve müşteri taleplerine yanıt verin.</p>
              <Button onClick={() => router.push('/operator/inbox')}>
                Devam Et
              </Button>
            </TabsContent>
            
            <TabsContent value="admin" className="mt-4 text-center space-y-4">
              <p>Yönetici olarak sistem ayarlarını ve kullanıcıları yönetin.</p>
              <Button onClick={() => router.push('/admin')}>
                Devam Et
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
        
        <CardFooter className="flex justify-center border-t pt-4">
          <p className="text-xs text-muted-foreground">
            Shadcn UI ile oluşturulmuştur - {new Date().getFullYear()}
          </p>
        </CardFooter>
      </Card>
    </div>
  )
}
