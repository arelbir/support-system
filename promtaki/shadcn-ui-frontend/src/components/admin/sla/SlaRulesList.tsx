import React from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Edit, MoreHorizontal, Trash } from 'lucide-react'

export interface SlaRule {
  id: string
  name: string
  priority: 'low' | 'medium' | 'high' | 'urgent'
  firstResponseTime: number 
  resolutionTime: number
  businessHours: boolean
  active: boolean
}

interface SlaRulesListProps {
  rules: SlaRule[]
  onEditRule: (rule: SlaRule) => void
  onDeleteRule: (ruleId: string) => void
}

export function SlaRulesList({ rules, onEditRule, onDeleteRule }: SlaRulesListProps) {
  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${hours * 60} dakika`
    } else if (hours === 1) {
      return '1 saat'
    } else {
      return `${hours} saat`
    }
  }
  
  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low':
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Düşük</Badge>
      case 'medium':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Orta</Badge>
      case 'high':
        return <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">Yüksek</Badge>
      case 'urgent':
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Acil</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>SLA Kuralları</CardTitle>
        <CardDescription>
          Bilet önceliklerine göre tanımlanmış hizmet seviyesi anlaşmaları (SLA).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kural Adı</TableHead>
                <TableHead>Öncelik</TableHead>
                <TableHead>İlk Yanıt</TableHead>
                <TableHead>Çözüm Süresi</TableHead>
                <TableHead>Çalışma Saatleri</TableHead>
                <TableHead>Durum</TableHead>
                <TableHead className="text-right">İşlemler</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell>{getPriorityBadge(rule.priority)}</TableCell>
                  <TableCell>{formatTime(rule.firstResponseTime)}</TableCell>
                  <TableCell>{formatTime(rule.resolutionTime)}</TableCell>
                  <TableCell>
                    {rule.businessHours ? 'Sadece çalışma saatleri' : '7/24'}
                  </TableCell>
                  <TableCell>
                    {rule.active ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Aktif</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-gray-50 text-gray-700 border-gray-200">Pasif</Badge>
                    )}
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => onEditRule(rule)}>
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Düzenle</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          className="text-destructive" 
                          onClick={() => onDeleteRule(rule.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" />
                          <span>Sil</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
}
