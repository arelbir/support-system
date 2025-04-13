import React from 'react'
import { useTranslation } from 'react-i18next'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Eye } from "lucide-react"

export type Ticket = {
  id: number
  subject: string
  status: 'open' | 'pending' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  category: string
  createdAt: string
  assignedTo?: string
}

interface TicketsListProps {
  tickets: Ticket[]
  isLoading?: boolean
  hasMore?: boolean
  isLoadingMore?: boolean
  onLoadMore?: () => void
  onTicketClick?: (ticketId: number) => void
}

export function TicketsList({
  tickets,
  isLoading = false,
  hasMore = false,
  isLoadingMore = false,
  onLoadMore,
  onTicketClick
}: TicketsListProps) {
  const { t, i18n } = useTranslation()
  
  console.log('TicketsList bileşenine gelen biletler:', tickets);
  
  // Tickets array validation to prevent rendering errors
  const validTickets = Array.isArray(tickets) 
    ? tickets.filter(ticket => 
        ticket && 
        typeof ticket === 'object' && 
        ticket.id !== undefined
      )
    : [];
  
  if (isLoading) {
    return (
      <div className="border rounded-md">
        <Table>
          <TableBody>
            {[1, 2, 3].map((i) => (
              <TableRow key={`skeleton-${i}`}>
                <TableCell><Skeleton className="h-6 w-10" /></TableCell>
                <TableCell><Skeleton className="h-6 w-full" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (validTickets.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{t('tickets.noTickets')}</p>
        <p className="text-sm text-muted-foreground mt-2">{t('tickets.createNewTicket')}</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-500/20 text-green-700 hover:bg-green-500/30'
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30'
      case 'closed': return 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      default: return 'bg-gray-200 text-gray-700 hover:bg-gray-300'
    }
  }
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low':
        return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20'
      case 'medium':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20'
      case 'high':
        return 'bg-orange-500/10 text-orange-500 hover:bg-orange-500/20'
      case 'urgent':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
      default:
        return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20'
    }
  }

  // Tarih formatı
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')
  }
  
  return (
    <div className="border rounded-md">
      <div className="relative overflow-hidden">
        {/* Tek bir tablo ile tüm içeriği yapılandır */}
        <div className="max-h-[calc(100vh-380px)] overflow-y-auto">
          <Table className="relative w-full">
            {/* Sabit başlıklar */}
            <TableHeader className="sticky top-0 z-50 bg-background">
              <TableRow>
                <TableHead className="bg-background border-b w-[80px] text-left">{t('tickets.id')}</TableHead>
                <TableHead className="bg-background border-b w-[300px] text-left">{t('tickets.subject')}</TableHead>
                <TableHead className="bg-background border-b w-[120px] text-left">{t('tickets.status')}</TableHead>
                <TableHead className="bg-background border-b w-[120px] text-left">{t('tickets.priority')}</TableHead>
                <TableHead className="bg-background border-b w-[150px] text-left">{t('tickets.category')}</TableHead>
                <TableHead className="bg-background border-b w-[150px] text-left">{t('tickets.createdAt')}</TableHead>
                <TableHead className="bg-background border-b w-[80px] text-right">{t('tickets.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            
            {/* Tablo içeriği */}
            <TableBody>
              {validTickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium w-[80px]">#{ticket.id}</TableCell>
                  <TableCell className="w-[300px]">{ticket.subject}</TableCell>
                  <TableCell className="w-[120px]">
                    <Badge variant="outline" className={getStatusColor(ticket.status)}>
                      {t(`tickets.statusTypes.${ticket.status}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[120px]">
                    <Badge variant="outline" className={getPriorityColor(ticket.priority)}>
                      {t(`tickets.priorityTypes.${ticket.priority}`)}
                    </Badge>
                  </TableCell>
                  <TableCell className="w-[150px]">{ticket.category}</TableCell>
                  <TableCell className="w-[150px]">{formatDate(ticket.createdAt)}</TableCell>
                  <TableCell className="text-right w-[80px]">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onTicketClick?.(ticket.id)}
                      aria-label={t('tickets.viewTicket')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              
              {/* Yükleme durumu skeleton görünümü */}
              {isLoadingMore && (
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={`skeleton-${i}`}>
                    <TableCell className="w-[80px]"><Skeleton className="h-6 w-10" /></TableCell>
                    <TableCell className="w-[300px]"><Skeleton className="h-6 w-full" /></TableCell>
                    <TableCell className="w-[120px]"><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="w-[120px]"><Skeleton className="h-6 w-20" /></TableCell>
                    <TableCell className="w-[150px]"><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="w-[150px]"><Skeleton className="h-6 w-24" /></TableCell>
                    <TableCell className="text-right w-[80px]"><Skeleton className="h-8 w-8 rounded-full ml-auto" /></TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
