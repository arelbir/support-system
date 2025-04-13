import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { AuditLog } from './AuditLogTable'
import { Copy, Download, XCircle } from 'lucide-react'

interface AuditLogDetailsProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  log: AuditLog | null
}

export function AuditLogDetails({ open, onOpenChange, log }: AuditLogDetailsProps) {
  if (!log) return null
  
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info':
        return 'text-blue-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }
  
  const copyToClipboard = () => {
    const logText = `
      ID: ${log.id}
      Zaman: ${log.timestamp}
      Kullanıcı: ${log.userName} (${log.userId})
      İşlem: ${log.action}
      Kaynak: ${log.resource} ${log.resourceId ? `#${log.resourceId}` : ''}
      IP Adresi: ${log.ipAddress}
      Önem: ${log.severity}
      Detaylar: ${log.details || 'Belirtilmemiş'}
    `.trim().replace(/\s+/g, ' ')
    
    navigator.clipboard.writeText(logText)
      .then(() => alert('Denetim kaydı panoya kopyalandı'))
      .catch(err => console.error('Kopyalama hatası:', err))
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Denetim Kaydı Detayları</DialogTitle>
          <DialogDescription>
            ID: {log.id}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-x-4 gap-y-2">
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Zaman</p>
              <p>{log.timestamp}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Önem</p>
              <p className={getSeverityColor(log.severity)}>
                {log.severity === 'info' && 'Bilgi'}
                {log.severity === 'warning' && 'Uyarı'}
                {log.severity === 'error' && 'Hata'}
              </p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Kullanıcı</p>
              <p>{log.userName}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Kullanıcı ID</p>
              <p>{log.userId}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">İşlem</p>
              <p>{log.action}</p>
            </div>
            
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">IP Adresi</p>
              <p>{log.ipAddress}</p>
            </div>
            
            <div className="space-y-1 col-span-2">
              <p className="text-sm font-medium text-muted-foreground">Kaynak</p>
              <p>
                {log.resource}
                {log.resourceId && <span className="ml-1">#{log.resourceId}</span>}
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">Detaylar</p>
            <Card className="bg-muted/50">
              <CardContent className="p-4">
                <pre className="text-sm whitespace-pre-wrap">
                  {log.details || 'Ek detay bulunmuyor.'}
                </pre>
              </CardContent>
            </Card>
          </div>
        </div>
        
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={copyToClipboard}
          >
            <Copy className="h-4 w-4" />
            <span>Kopyala</span>
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            <XCircle className="h-4 w-4 mr-2" />
            <span>Kapat</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
