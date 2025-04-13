'use client'

import React from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { SettingsForm } from '@/components/admin/settings/SettingsForm'
import { Setting } from '@/components/admin/settings/SettingsForm'
import { 
  Mail, 
  Bell, 
  Server, 
  Globe, 
  Shield, 
  FileText, 
  UserCog, 
  Ticket
} from 'lucide-react'

export default function SystemSettingsPage() {
  // Örnek ayar grupları
  const generalSettings = {
    title: 'Genel Ayarlar',
    description: 'Sistem genelinde kullanılan temel ayarlar',
    settings: [
      {
        id: 'company_name',
        label: 'Şirket Adı',
        type: 'text',
        value: 'Destek Sistemi A.Ş.',
      },
      {
        id: 'app_name',
        label: 'Uygulama Adı',
        type: 'text',
        value: 'Destek Portalı',
      },
      {
        id: 'support_email',
        label: 'Destek E-posta Adresi',
        type: 'email',
        value: 'destek@ornek.com',
      },
      {
        id: 'default_language',
        label: 'Varsayılan Dil',
        type: 'select',
        value: 'tr',
        options: [
          { value: 'tr', label: 'Türkçe' },
          { value: 'en', label: 'İngilizce' },
          { value: 'de', label: 'Almanca' },
        ],
      },
      {
        id: 'enable_notifications',
        label: 'Bildirimler',
        description: 'Sistem bildirimleri aktif edilsin mi?',
        type: 'switch',
        value: true,
      },
    ],
  }
  
  const ticketSettings = {
    title: 'Bilet Ayarları',
    description: 'Biletlerin davranışını kontrol eden ayarlar',
    settings: [
      {
        id: 'auto_assign',
        label: 'Otomatik Atama',
        description: 'Yeni biletleri operatörlere otomatik olarak ata',
        type: 'switch',
        value: true,
      },
      {
        id: 'idle_timeout',
        label: 'Hareketsizlik Zaman Aşımı (gün)',
        description: 'Bilet bu süre boyunca aktivite göstermezse operatörlere bildirim gönderilir',
        type: 'number',
        value: 3,
      },
      {
        id: 'close_resolved_after',
        label: 'Çözülmüş Biletleri Kapat (gün)',
        description: 'Çözülmüş biletleri belirtilen gün sonra otomatik kapat',
        type: 'number',
        value: 7,
      },
      {
        id: 'allow_reopening',
        label: 'Yeniden Açılabilir',
        description: 'Kapatılan biletlerin müşteri tarafından yeniden açılabilmesini sağla',
        type: 'switch',
        value: true,
      },
    ],
  }
  
  const notificationSettings = {
    title: 'Bildirim Ayarları',
    description: 'E-posta ve anlık bildirim ayarları',
    settings: [
      {
        id: 'email_notifications',
        label: 'E-posta Bildirimleri',
        type: 'switch',
        value: true,
      },
      {
        id: 'push_notifications',
        label: 'Anlık Bildirimler',
        type: 'switch',
        value: true,
      },
      {
        id: 'notification_digest',
        label: 'Bildirim Özeti',
        description: 'Kullanıcılara gönderilecek bildirim özeti sıklığı',
        type: 'select',
        value: 'daily',
        options: [
          { value: 'disabled', label: 'Devre Dışı' },
          { value: 'hourly', label: 'Saatlik' },
          { value: 'daily', label: 'Günlük' },
          { value: 'weekly', label: 'Haftalık' },
        ],
      },
      {
        id: 'notify_operators_new_ticket',
        label: 'Operatörlere Yeni Bilet Bildirimi',
        type: 'switch',
        value: true,
      },
      {
        id: 'notify_customers_updates',
        label: 'Müşterilere Güncelleme Bildirimi',
        type: 'switch',
        value: true,
      },
    ],
  }
  
  const securitySettings = {
    title: 'Güvenlik Ayarları',
    description: 'Kimlik doğrulama ve güvenlik ayarları',
    settings: [
      {
        id: 'session_timeout',
        label: 'Oturum Zaman Aşımı (dakika)',
        description: 'Kullanıcıların hareketsizlik sonrası oturumlarının sona erme süresi',
        type: 'number',
        value: 60,
      },
      {
        id: 'password_expiry',
        label: 'Şifre Geçerlilik Süresi (gün)',
        description: 'Kullanıcıların şifrelerinin süresi dolduğunda değiştirmeleri istenir',
        type: 'number',
        value: 90,
      },
      {
        id: 'require_2fa',
        label: 'İki Faktörlü Doğrulama Zorunluluğu',
        description: 'Operatörler ve yöneticiler için 2FA gerekli olsun mu?',
        type: 'switch',
        value: true,
      },
      {
        id: 'login_attempts',
        label: 'Maksimum Başarısız Giriş Denemesi',
        description: 'Bu sayıdan sonra hesap geçici olarak kilitlenir',
        type: 'number',
        value: 5,
      },
    ],
  }
  
  const handleSaveSettings = (settings: Setting[]) => {
    console.log('Saving settings:', settings)
    // Gerçek uygulamada burada API çağrısı yapılacak
    // await api.updateSettings(settings)
    
    alert('Ayarlar başarıyla kaydedildi.')
  }
  
  return (
    <AdminLayout title="Sistem Ayarları">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sistem Ayarları</h1>
          <p className="text-muted-foreground">
            Destek sistemi genel yapılandırma ve ayarlarını yönetin.
          </p>
        </div>
        
        <Separator className="my-6" />
        
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList className="flex flex-wrap gap-2">
            <TabsTrigger value="general" className="flex items-center gap-2">
              <Globe size={16} />
              <span>Genel</span>
            </TabsTrigger>
            <TabsTrigger value="tickets" className="flex items-center gap-2">
              <Ticket size={16} />
              <span>Biletler</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center gap-2">
              <Bell size={16} />
              <span>Bildirimler</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center gap-2">
              <Shield size={16} />
              <span>Güvenlik</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="general" className="space-y-4">
            <SettingsForm 
              settingGroup={generalSettings} 
              onSave={handleSaveSettings} 
            />
          </TabsContent>
          
          <TabsContent value="tickets" className="space-y-4">
            <SettingsForm 
              settingGroup={ticketSettings} 
              onSave={handleSaveSettings} 
            />
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <SettingsForm 
              settingGroup={notificationSettings} 
              onSave={handleSaveSettings} 
            />
          </TabsContent>
          
          <TabsContent value="security" className="space-y-4">
            <SettingsForm 
              settingGroup={securitySettings} 
              onSave={handleSaveSettings} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
