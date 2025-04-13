'use client'

import React from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  BarChart, 
  FileSpreadsheet, 
  CheckCircle2, 
  Clock, 
  Users, 
  AlertTriangle, 
  Activity
} from 'lucide-react'

// Modüler bileşenleri içe aktarıyoruz
import { ReportCard } from '@/components/admin/reports/ReportCard'
import { PerformanceChart } from '@/components/admin/reports/PerformanceChart'

export default function ReportsPage() {
  // Rapor verileri
  const reports = [
    {
      id: '1',
      title: 'Bilet Analizi',
      description: 'Bilet hacmi, kategoriler ve çözüm süreleri',
      icon: <BarChart className="h-5 w-5 text-primary" />,
      lastUpdated: '12.04.2025, 09:15'
    },
    {
      id: '2',
      title: 'Operatör Performansı',
      description: 'Operatör bazlı çözüm süreleri ve memnuniyet',
      icon: <Users className="h-5 w-5 text-primary" />,
      lastUpdated: '11.04.2025, 18:30'
    },
    {
      id: '3',
      title: 'SLA Raporları',
      description: 'SLA karşılama oranları ve ihlaller',
      icon: <Clock className="h-5 w-5 text-primary" />,
      lastUpdated: '12.04.2025, 08:00'
    },
    {
      id: '4',
      title: 'Müşteri Memnuniyeti',
      description: 'Memnuniyet anketleri ve puanlamalar',
      icon: <CheckCircle2 className="h-5 w-5 text-primary" />,
      lastUpdated: '10.04.2025, 14:45'
    },
    {
      id: '5',
      title: 'Etiket Analizi',
      description: 'Etiket bazlı analiz ve dağılım',
      icon: <FileSpreadsheet className="h-5 w-5 text-primary" />,
      lastUpdated: '09.04.2025, 11:20'
    },
    {
      id: '6',
      title: 'İhlal Raporu',
      description: 'SLA ihlalleri ve sebep analizi',
      icon: <AlertTriangle className="h-5 w-5 text-primary" />,
      lastUpdated: '11.04.2025, 16:10'
    }
  ]
  
  // Demo performans verileri
  const performanceData = [
    {
      id: 'Açılan Biletler',
      data: [
        { x: '05.04', y: 42 },
        { x: '06.04', y: 35 },
        { x: '07.04', y: 58 },
        { x: '08.04', y: 45 },
        { x: '09.04', y: 52 },
        { x: '10.04', y: 48 },
        { x: '11.04', y: 38 },
        { x: '12.04', y: 30 }
      ]
    },
    {
      id: 'Kapatılan Biletler',
      data: [
        { x: '05.04', y: 38 },
        { x: '06.04', y: 40 },
        { x: '07.04', y: 45 },
        { x: '08.04', y: 50 },
        { x: '09.04', y: 47 },
        { x: '10.04', y: 55 },
        { x: '11.04', y: 42 },
        { x: '12.04', y: 28 }
      ]
    }
  ]
  
  // Rapor işlemleri için fonksiyonlar
  const handleGenerateReport = (reportId: string) => {
    console.log(`Generating report: ${reportId}`)
    // Gerçek uygulamada burada API çağrısı yapılacak
    alert(`"${reports.find(r => r.id === reportId)?.title}" raporu güncelleniyor...`)
  }
  
  const handleDownloadReport = (reportId: string) => {
    console.log(`Downloading report: ${reportId}`)
    // Gerçek uygulamada burada API çağrısı yapılacak
    alert(`"${reports.find(r => r.id === reportId)?.title}" raporu indiriliyor...`)
  }
  
  return (
    <AdminLayout title="Raporlar">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Raporlar</h1>
          <p className="text-muted-foreground">
            Sistem verileriyle ilgili raporları görüntüleyin, güncelleyin ve indirin.
          </p>
        </div>
        
        {/* Grafik */}
        <PerformanceChart 
          title="Bilet Performansı"
          description="Belirli bir zaman aralığında açılan ve kapatılan biletlerin sayısı"
          performanceData={performanceData}
        />
        
        {/* Rapor Kartları Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => (
            <ReportCard
              key={report.id}
              title={report.title}
              description={report.description}
              icon={report.icon}
              lastUpdated={report.lastUpdated}
              onGenerate={() => handleGenerateReport(report.id)}
              onDownload={() => handleDownloadReport(report.id)}
            />
          ))}
        </div>
        
        <div className="text-sm text-muted-foreground border-t pt-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            <p>
              Raporlar otomatik olarak her gün 00:00'da güncellenir. İhtiyaç duyduğunuzda manuel olarak da güncelleyebilirsiniz.
            </p>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
