'use client'

import React, { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTranslation } from 'react-i18next'
import { 
  CirclePlus,
  MoreHorizontal, 
  Trash, 
  Edit, 
  ArrowUpDown, 
  Check, 
  XCircle,
  Clock,
  PauseCircle,
  CheckCircle,
  AlertCircle,
  Pencil 
} from 'lucide-react'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { Textarea } from '@/components/ui/textarea'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

interface StatusType {
  id: string
  name: string
  description: string
  color: string
  icon: string
  isDefault: boolean
  isSystem: boolean
  category: 'open' | 'pending' | 'solved' | 'closed'
  position: number
}

// Sortable row component
function SortableTableRow({ status }: { status: StatusType }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: status.id })
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 1 : 0,
    position: 'relative' as const,
  }
  
  const getStatusIcon = (icon: string) => {
    switch (icon) {
      case 'clock':
        return <Clock className="h-5 w-5" />
      case 'check':
        return <CheckCircle className="h-5 w-5" />
      case 'pause':
        return <PauseCircle className="h-5 w-5" />
      case 'alert':
        return <AlertCircle className="h-5 w-5" />
      case 'edit':
        return <Pencil className="h-5 w-5" />
      default:
        return <Clock className="h-5 w-5" />
    }
  }
  
  const getStatusStyle = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-100 text-blue-600 border-blue-600'
      case 'green':
        return 'bg-green-100 text-green-600 border-green-600'
      case 'yellow':
        return 'bg-yellow-100 text-yellow-600 border-yellow-600'
      case 'orange':
        return 'bg-orange-100 text-orange-600 border-orange-600'
      case 'red':
        return 'bg-red-100 text-red-600 border-red-600'
      case 'purple':
        return 'bg-purple-100 text-purple-600 border-purple-600'
      case 'gray':
        return 'bg-gray-100 text-gray-600 border-gray-600'
      default:
        return 'bg-gray-100 text-gray-600 border-gray-600'
    }
  }
  
  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell>
        <Button 
          variant="ghost" 
          size="icon" 
          className="cursor-grab" 
          {...attributes} 
          {...listeners}
        >
          <ArrowUpDown className="h-4 w-4" />
        </Button>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <div className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full border',
            getStatusStyle(status.color)
          )}>
            {getStatusIcon(status.icon)}
          </div>
          <div className="font-medium">{status.name}</div>
        </div>
      </TableCell>
      <TableCell>{status.description}</TableCell>
      <TableCell>
        {status.category === 'open' && <span className="text-blue-600">Açık</span>}
        {status.category === 'pending' && <span className="text-yellow-600">Beklemede</span>}
        {status.category === 'solved' && <span className="text-green-600">Çözüldü</span>}
        {status.category === 'closed' && <span className="text-gray-600">Kapalı</span>}
      </TableCell>
      <TableCell>
        {status.isDefault ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-muted-foreground" />
        )}
      </TableCell>
      <TableCell>
        {status.isSystem ? (
          <Check className="h-4 w-4 text-green-600" />
        ) : (
          <XCircle className="h-4 w-4 text-muted-foreground" />
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
            <DropdownMenuItem disabled={status.isSystem}>
              <Edit className="mr-2 h-4 w-4" />
              <span>Düzenle</span>
            </DropdownMenuItem>
            {!status.isDefault && (
              <DropdownMenuItem disabled={status.isSystem}>
                <Check className="mr-2 h-4 w-4" />
                <span>Varsayılan Yap</span>
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="text-destructive" 
              disabled={status.isSystem || status.isDefault}
            >
              <Trash className="mr-2 h-4 w-4" />
              <span>Sil</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export default function StatusManagementPage() {
  const { t } = useTranslation()
  const [statuses, setStatuses] = useState<StatusType[]>([
    {
      id: '1',
      name: 'Yeni',
      description: 'Yeni oluşturulan bilet',
      color: 'blue',
      icon: 'clock',
      isDefault: true,
      isSystem: true,
      category: 'open',
      position: 1
    },
    {
      id: '2',
      name: 'Atanmış',
      description: 'Operatöre atanmış bilet',
      color: 'blue',
      icon: 'edit',
      isDefault: false,
      isSystem: true,
      category: 'open',
      position: 2
    },
    {
      id: '3',
      name: 'İşleniyor',
      description: 'Üzerinde çalışılan bilet',
      color: 'blue',
      icon: 'edit',
      isDefault: false,
      isSystem: true,
      category: 'open',
      position: 3
    },
    {
      id: '4',
      name: 'Müşteri Yanıtı Bekleniyor',
      description: 'Müşteriden yanıt bekleyen bilet',
      color: 'yellow',
      icon: 'pause',
      isDefault: false,
      isSystem: true,
      category: 'pending',
      position: 4
    },
    {
      id: '5',
      name: 'Üçüncü Taraf Bekleniyor',
      description: 'Üçüncü taraftan yanıt bekleyen bilet',
      color: 'yellow',
      icon: 'pause',
      isDefault: false,
      isSystem: false,
      category: 'pending',
      position: 5
    },
    {
      id: '6',
      name: 'Çözüldü',
      description: 'Çözülmüş bilet',
      color: 'green',
      icon: 'check',
      isDefault: false,
      isSystem: true,
      category: 'solved',
      position: 6
    },
    {
      id: '7',
      name: 'Kapatıldı',
      description: 'Kapatılmış bilet',
      color: 'gray',
      icon: 'check',
      isDefault: false,
      isSystem: true,
      category: 'closed',
      position: 7
    },
  ])
  
  const [showNewStatusDialog, setShowNewStatusDialog] = useState(false)
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    
    if (over && active.id !== over.id) {
      setStatuses((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        
        const newArray = arrayMove(items, oldIndex, newIndex)
        
        // Update positions
        return newArray.map((item, index) => ({
          ...item,
          position: index + 1
        }))
      })
    }
  }
  
  const categoryOptions = [
    { value: 'open', label: 'Açık' },
    { value: 'pending', label: 'Beklemede' },
    { value: 'solved', label: 'Çözüldü' },
    { value: 'closed', label: 'Kapalı' },
  ]
  
  const colorOptions = [
    { value: 'blue', label: 'Mavi' },
    { value: 'green', label: 'Yeşil' },
    { value: 'yellow', label: 'Sarı' },
    { value: 'orange', label: 'Turuncu' },
    { value: 'red', label: 'Kırmızı' },
    { value: 'purple', label: 'Mor' },
    { value: 'gray', label: 'Gri' },
  ]
  
  const iconOptions = [
    { value: 'clock', label: 'Saat' },
    { value: 'check', label: 'Tik' },
    { value: 'pause', label: 'Duraklat' },
    { value: 'alert', label: 'Uyarı' },
    { value: 'edit', label: 'Kalem' },
  ]
  
  return (
    <AdminLayout title="Durum Ayarları">
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Durum Yönetimi</CardTitle>
              <CardDescription>
                Bilet durumlarını görüntüle, ekle, düzenle ve yeniden sırala.
              </CardDescription>
            </div>
            <Button onClick={() => setShowNewStatusDialog(true)}>
              <CirclePlus className="mr-2 h-4 w-4" /> Durum Ekle
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Durumları sürükleyerek yeniden sıralayabilirsiniz. Sistem durumları silinemez veya düzenlenemez.
              </p>
              
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[60px]"></TableHead>
                        <TableHead>Durum</TableHead>
                        <TableHead>Açıklama</TableHead>
                        <TableHead>Kategori</TableHead>
                        <TableHead>Varsayılan</TableHead>
                        <TableHead>Sistem</TableHead>
                        <TableHead className="text-right">İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <SortableContext
                        items={statuses.map(status => status.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        {statuses.map(status => (
                          <SortableTableRow key={status.id} status={status} />
                        ))}
                      </SortableContext>
                    </TableBody>
                  </Table>
                </div>
              </DndContext>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-medium">Durum Kategorileri</CardTitle>
            <CardDescription>
              Bilet durumları dört ana kategoriye ayrılır. Her kategori bilet yaşam döngüsünde farklı bir aşamayı temsil eder.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Clock className="h-3 w-3" />
                  </div>
                  <h3 className="font-medium text-blue-600">Açık</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Açık biletler aktif olarak çalışılan biletlerdir. Bu durumlar SLA takibi yapar.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-yellow-100 text-yellow-600">
                    <PauseCircle className="h-3 w-3" />
                  </div>
                  <h3 className="font-medium text-yellow-600">Beklemede</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Beklemedeki biletler başka bir taraftan yanıt bekliyor. Bu durumlar SLA süresini durdurur.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-green-100 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                  <h3 className="font-medium text-green-600">Çözüldü</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Çözülmüş biletler operatör tarafından çözülmüş ancak henüz kapatılmamış biletlerdir.
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                    <CheckCircle className="h-3 w-3" />
                  </div>
                  <h3 className="font-medium text-gray-600">Kapalı</h3>
                </div>
                <p className="text-sm text-muted-foreground">
                  Kapalı biletler müşteri veya operatör tarafından kesin olarak kapatılmış biletlerdir.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Yeni Durum Ekleme Dialog */}
      <Dialog open={showNewStatusDialog} onOpenChange={setShowNewStatusDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Yeni Durum Ekle</DialogTitle>
            <DialogDescription>
              Sisteme yeni bir bilet durumu ekleyin.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status-name" className="text-right">
                Durum Adı
              </Label>
              <Input id="status-name" placeholder="Durum adını girin" className="col-span-3" />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status-description" className="text-right">
                Açıklama
              </Label>
              <Textarea 
                id="status-description" 
                placeholder="Durumun açıklaması" 
                className="col-span-3" 
                rows={2}
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status-category" className="text-right">
                Kategori
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Kategori seçin" />
                </SelectTrigger>
                <SelectContent>
                  {categoryOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status-color" className="text-right">
                Renk
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Renk seçin" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status-icon" className="text-right">
                İkon
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="İkon seçin" />
                </SelectTrigger>
                <SelectContent>
                  {iconOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="col-span-4">
                <div className="flex items-center justify-between border rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="is-default" className="cursor-pointer">
                      Varsayılan durum olarak ayarla
                    </Label>
                  </div>
                  <Switch id="is-default" />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewStatusDialog(false)}>
              İptal
            </Button>
            <Button type="submit">Durum Oluştur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
