'use client'

import React, { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { PlusCircle } from 'lucide-react'

// Modüler bileşenleri içe aktarıyoruz
import { SlaRulesList, SlaRule } from '@/components/admin/sla/SlaRulesList'
import { SlaRuleForm } from '@/components/admin/sla/SlaRuleForm'
import { BusinessHoursConfig } from '@/components/admin/sla/BusinessHoursConfig'

export default function SlaSettingsPage() {
  // SLA Kuralları için state
  const [slaRules, setSlaRules] = useState<SlaRule[]>([
    {
      id: '1',
      name: 'Acil Öncelikli SLA',
      priority: 'urgent',
      firstResponseTime: 0.5, // 30 dakika
      resolutionTime: 4,
      businessHours: true,
      active: true
    },
    {
      id: '2',
      name: 'Yüksek Öncelikli SLA',
      priority: 'high',
      firstResponseTime: 1, // 1 saat
      resolutionTime: 8,
      businessHours: true,
      active: true
    },
    {
      id: '3',
      name: 'Orta Öncelikli SLA',
      priority: 'medium',
      firstResponseTime: 4, // 4 saat
      resolutionTime: 24,
      businessHours: true,
      active: true
    },
    {
      id: '4',
      name: 'Düşük Öncelikli SLA',
      priority: 'low',
      firstResponseTime: 8, // 8 saat
      resolutionTime: 48,
      businessHours: true,
      active: true
    },
    {
      id: '5',
      name: 'VIP Müşteri SLA',
      priority: 'high',
      firstResponseTime: 0.5, // 30 dakika
      resolutionTime: 4,
      businessHours: false, // 7/24
      active: true
    }
  ])
  
  // Çalışma saatleri için state
  const [workingDays, setWorkingDays] = useState([
    { day: 'monday', enabled: true, startTime: '09:00', endTime: '18:00' },
    { day: 'tuesday', enabled: true, startTime: '09:00', endTime: '18:00' },
    { day: 'wednesday', enabled: true, startTime: '09:00', endTime: '18:00' },
    { day: 'thursday', enabled: true, startTime: '09:00', endTime: '18:00' },
    { day: 'friday', enabled: true, startTime: '09:00', endTime: '18:00' },
    { day: 'saturday', enabled: false, startTime: '10:00', endTime: '16:00' },
    { day: 'sunday', enabled: false, startTime: '10:00', endTime: '16:00' },
  ])
  
  // Dialog yönetimi
  const [showRuleForm, setShowRuleForm] = useState(false)
  const [currentRule, setCurrentRule] = useState<SlaRule | undefined>(undefined)
  
  const handleAddRule = () => {
    setCurrentRule(undefined) // Yeni kural, mevcut verisi olmayacak
    setShowRuleForm(true)
  }
  
  const handleEditRule = (rule: SlaRule) => {
    setCurrentRule(rule)
    setShowRuleForm(true)
  }
  
  const handleSaveRule = (rule: SlaRule) => {
    if (currentRule) {
      // Mevcut kuralı güncelle
      setSlaRules(slaRules.map(r => r.id === rule.id ? rule : r))
    } else {
      // Yeni kural ekle
      setSlaRules([...slaRules, rule])
    }
  }
  
  const handleDeleteRule = (ruleId: string) => {
    setSlaRules(slaRules.filter(rule => rule.id !== ruleId))
  }
  
  const handleSaveBusinessHours = (updatedWorkingDays: any[]) => {
    setWorkingDays(updatedWorkingDays)
    // Normalde burada API çağrısı yapılır veya veri tabanına kaydedilir
    // Örneğin: await api.updateBusinessHours(updatedWorkingDays)
    
    // Bildirim eklenebilir
    alert('Çalışma saatleri başarıyla güncellendi.')
  }
  
  return (
    <AdminLayout title="SLA Ayarları">
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">SLA Ayarları</h1>
            <p className="text-muted-foreground">
              Hizmet seviyesi anlaşmalarını (SLA) ve çalışma saatlerini yapılandırın.
            </p>
          </div>
          <Button onClick={handleAddRule}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Yeni SLA Kuralı
          </Button>
        </div>
        
        <Separator />
        
        <Tabs defaultValue="rules" className="space-y-4">
          <TabsList>
            <TabsTrigger value="rules">SLA Kuralları</TabsTrigger>
            <TabsTrigger value="hours">Çalışma Saatleri</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rules" className="space-y-4">
            <div className="grid gap-6">
              <SlaRulesList 
                rules={slaRules} 
                onEditRule={handleEditRule} 
                onDeleteRule={handleDeleteRule} 
              />
              
              <div className="text-sm text-muted-foreground">
                <p>
                  <strong>Not:</strong> SLA kuralları, bilet önceliğine göre uygulanır. Her öncelik seviyesi için birden fazla kural tanımlayabilirsiniz, 
                  ancak aynı öncelik için birden fazla aktif kural varsa, sistem ilk eşleşen kuralı uygular.
                </p>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="hours" className="space-y-4">
            <BusinessHoursConfig 
              workingDays={workingDays} 
              onSave={handleSaveBusinessHours} 
            />
          </TabsContent>
        </Tabs>
      </div>
      
      {/* SLA Kural Formu Dialog */}
      <SlaRuleForm
        open={showRuleForm}
        onOpenChange={setShowRuleForm}
        initialData={currentRule}
        onSubmit={handleSaveRule}
      />
      
    </AdminLayout>
  )
}
