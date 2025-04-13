import React from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Eye, 
  MoreHorizontal, 
  Download, 
  AlertCircle, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Settings, 
  Edit, 
  User,
  PlusCircle,
  Trash
} from 'lucide-react'

export interface AuditLog {
  id: string
  timestamp: string
  userId: string
  userName: string
  action: string
  resource: string
  resourceId?: string
  details?: string
  ipAddress: string
  severity: 'info' | 'warning' | 'error'
}

interface AuditLogTableProps {
  logs: AuditLog[]
  onViewDetails: (log: AuditLog) => void
}

export function AuditLogTable({ logs, onViewDetails }: AuditLogTableProps) {
  
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'info':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Bilgi</Badge>
      case 'warning':
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Uyarı</Badge>
      case 'error':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Hata</Badge>
      default:
        return <Badge variant="outline">{severity}</Badge>
    }
  }
  
  const getActionIcon = (action: string) => {
    if (action.includes('login') || action.includes('logout')) {
      return <User className="h-4 w-4 text-blue-600" />
    } else if (action.includes('create')) {
      return <PlusCircle className="h-4 w-4 text-green-600" />
    } else if (action.includes('update') || action.includes('edit')) {
      return <Edit className="h-4 w-4 text-amber-600" />
    } else if (action.includes('delete')) {
      return <Trash className="h-4 w-4 text-red-600" />
    } else if (action.includes('settings')) {
      return <Settings className="h-4 w-4 text-purple-600" />
    } else {
      return <Clock className="h-4 w-4 text-gray-600" />
    }
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Zaman</TableHead>
            <TableHead>Kullanıcı</TableHead>
            <TableHead>İşlem</TableHead>
            <TableHead>Kaynak</TableHead>
            <TableHead>IP Adresi</TableHead>
            <TableHead>Önem</TableHead>
            <TableHead className="text-right">İşlemler</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.length > 0 ? (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">
                  {log.timestamp}
                </TableCell>
                <TableCell>{log.userName}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {getActionIcon(log.action)}
                    <span>{log.action}</span>
                  </div>
                </TableCell>
                <TableCell>{log.resource} {log.resourceId ? `#${log.resourceId}` : ''}</TableCell>
                <TableCell>{log.ipAddress}</TableCell>
                <TableCell>{getSeverityBadge(log.severity)}</TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Menüyü aç</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>İşlemler</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onViewDetails(log)}>
                        <Eye className="mr-2 h-4 w-4" />
                        <span>Detayları Görüntüle</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-24 text-center">
                Gösterilecek denetim kaydı bulunamadı.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
