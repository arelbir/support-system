'use client'

import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { OperatorLayout } from '@/components/layout/OperatorLayout'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  Search, 
  Tag as TagIcon, 
  PlusCircle, 
  Hash, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Ticket,
  Check,
  X,
  ArrowUpDown,
  FileText,
  Filter,
  AlertCircle
} from 'lucide-react'

// Etiket tipi tanımı
interface Tag {
  id: string;
  name: string;
  color: 'default' | 'red' | 'green' | 'blue' | 'yellow' | 'purple' | 'orange';
  ticketsCount: number;
  createdAt: string;
  createdBy: string;
}

export default function TagsPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [isAddTagDialogOpen, setIsAddTagDialogOpen] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState<Tag['color']>('default')
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [editTag, setEditTag] = useState<Tag | null>(null)
  
  // Demo etiket verileri
  const tags: Tag[] = [
    {
      id: '1',
      name: 'ödeme',
      color: 'green',
      ticketsCount: 48,
      createdAt: '2025-01-15T10:30:00',
      createdBy: 'Ahmet Uzman',
    },
    {
      id: '2',
      name: 'teknik sorun',
      color: 'red',
      ticketsCount: 65,
      createdAt: '2025-01-10T14:20:00',
      createdBy: 'Murat Görevli',
    },
    {
      id: '3',
      name: 'sipariş takibi',
      color: 'blue',
      ticketsCount: 36,
      createdAt: '2025-01-22T09:15:00',
      createdBy: 'Elif Sevgi',
    },
    {
      id: '4',
      name: 'iade',
      color: 'yellow',
      ticketsCount: 29,
      createdAt: '2025-02-05T11:45:00',
      createdBy: 'Zeynep Yardım',
    },
    {
      id: '5',
      name: 'kargo',
      color: 'purple',
      ticketsCount: 42,
      createdAt: '2025-02-12T13:20:00',
      createdBy: 'Kemal Teknik',
    },
    {
      id: '6',
      name: 'şifre',
      color: 'orange',
      ticketsCount: 24,
      createdAt: '2025-02-18T16:10:00',
      createdBy: 'Ahmet Uzman',
    },
    {
      id: '7',
      name: 'hesap erişimi',
      color: 'default',
      ticketsCount: 31,
      createdAt: '2025-03-01T10:00:00',
      createdBy: 'Murat Görevli',
    },
    {
      id: '8',
      name: 'fatura',
      color: 'blue',
      ticketsCount: 19,
      createdAt: '2025-03-10T14:30:00',
      createdBy: 'Elif Sevgi',
    },
  ]
  
  // Arama sorgusuna göre etiketleri filtrele
  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })
  
  // Renge göre badge stilini döndür
  const getTagBadgeStyles = (color: Tag['color']) => {
    switch(color) {
      case 'red': return 'bg-red-500/20 text-red-700 hover:bg-red-500/30'
      case 'green': return 'bg-green-500/20 text-green-700 hover:bg-green-500/30'
      case 'blue': return 'bg-blue-500/20 text-blue-700 hover:bg-blue-500/30'
      case 'yellow': return 'bg-yellow-500/20 text-yellow-700 hover:bg-yellow-500/30'
      case 'purple': return 'bg-purple-500/20 text-purple-700 hover:bg-purple-500/30'
      case 'orange': return 'bg-orange-500/20 text-orange-700 hover:bg-orange-500/30'
      default: return 'bg-gray-500/20 text-gray-700 hover:bg-gray-500/30'
    }
  }
  
  // Tag ekleme işlemi
  const handleAddTag = () => {
    if (!newTagName.trim()) return
    
    // API üzerinden etiket ekleme işlemi burada yapılacak
    console.log('Adding tag:', { name: newTagName, color: newTagColor })
    
    // Form temizle ve dialog kapat
    setNewTagName('')
    setNewTagColor('default')
    setIsAddTagDialogOpen(false)
  }
  
  // Etiket güncelleme işlemi
  const handleUpdateTag = () => {
    if (!editTag || !editTag.name.trim()) return
    
    // API üzerinden etiket güncelleme işlemi burada yapılacak
    console.log('Updating tag:', editTag)
    
    // Düzenleme modundan çık
    setEditTag(null)
  }
  
  // Etiket silme işlemi
  const handleDeleteTag = (id: string) => {
    // API üzerinden etiket silme işlemi burada yapılacak
    console.log('Deleting tag:', id)
    
    // Onay mesajını kapat
    setConfirmDeleteId(null)
  }
  
  // İnsan tarafından okunabilir tarih formatı
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('tr-TR', { 
      day: 'numeric', 
      month: 'long', 
      year: 'numeric' 
    })
  }
  
  return (
    <OperatorLayout title={t('tags.title', 'Etiketler')}>
      <div className="col-span-12 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight">
            {t('tags.title', 'Etiketler')}
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder={t('tags.search', 'Etiket ara...')}
                className="pl-8 w-full sm:w-[250px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <Dialog open={isAddTagDialogOpen} onOpenChange={setIsAddTagDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-1">
                  <PlusCircle className="h-4 w-4 mr-1" />
                  {t('tags.addNew', 'Yeni Etiket')}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('tags.addNew', 'Yeni Etiket')}</DialogTitle>
                  <DialogDescription>
                    Biletleri kategorize etmek için yeni bir etiket oluşturun.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <label htmlFor="tagName" className="text-sm font-medium">
                      Etiket Adı
                    </label>
                    <div className="flex gap-2 items-center">
                      <Hash className="h-4 w-4 text-muted-foreground" />
                      <Input
                        id="tagName"
                        value={newTagName}
                        onChange={(e) => setNewTagName(e.target.value)}
                        placeholder="ör. ödeme, kargo, teknik sorun"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Renk</label>
                    <div className="flex flex-wrap gap-2">
                      <Badge 
                        variant="outline" 
                        className={`${getTagBadgeStyles('default')} cursor-pointer ${newTagColor === 'default' ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setNewTagColor('default')}
                      >
                        Varsayılan
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${getTagBadgeStyles('red')} cursor-pointer ${newTagColor === 'red' ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setNewTagColor('red')}
                      >
                        Kırmızı
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${getTagBadgeStyles('green')} cursor-pointer ${newTagColor === 'green' ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setNewTagColor('green')}
                      >
                        Yeşil
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${getTagBadgeStyles('blue')} cursor-pointer ${newTagColor === 'blue' ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setNewTagColor('blue')}
                      >
                        Mavi
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${getTagBadgeStyles('yellow')} cursor-pointer ${newTagColor === 'yellow' ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setNewTagColor('yellow')}
                      >
                        Sarı
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${getTagBadgeStyles('purple')} cursor-pointer ${newTagColor === 'purple' ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setNewTagColor('purple')}
                      >
                        Mor
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={`${getTagBadgeStyles('orange')} cursor-pointer ${newTagColor === 'orange' ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setNewTagColor('orange')}
                      >
                        Turuncu
                      </Badge>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddTagDialogOpen(false)}>
                    İptal
                  </Button>
                  <Button onClick={handleAddTag}>
                    Etiket Ekle
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        <div className="grid grid-cols-12 gap-6">
          {/* Sol kolon - Etiket listesi */}
          <div className="col-span-12 md:col-span-8">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle>Etiket Listesi</CardTitle>
                <CardDescription>Biletlerde kullanılan tüm etiketler ({filteredTags.length})</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Etiket</TableHead>
                      <TableHead className="w-[100px]">
                        <div className="flex items-center gap-1">
                          <Ticket className="h-4 w-4" />
                          <span>Biletler</span>
                        </div>
                      </TableHead>
                      <TableHead>Oluşturan</TableHead>
                      <TableHead>Oluşturulma Tarihi</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTags.map(tag => (
                      <TableRow key={tag.id}>
                        <TableCell>
                          {editTag?.id === tag.id ? (
                            <div className="flex gap-2 items-center">
                              <Input
                                value={editTag.name}
                                onChange={(e) => setEditTag({...editTag, name: e.target.value})}
                                className="h-8 py-1"
                              />
                              <div className="flex gap-1">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8" 
                                  onClick={handleUpdateTag}
                                >
                                  <Check className="h-4 w-4 text-green-500" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8" 
                                  onClick={() => setEditTag(null)}
                                >
                                  <X className="h-4 w-4 text-red-500" />
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Badge variant="outline" className={getTagBadgeStyles(tag.color)}>
                              {tag.name}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{tag.ticketsCount}</TableCell>
                        <TableCell>{tag.createdBy}</TableCell>
                        <TableCell>{formatDate(tag.createdAt)}</TableCell>
                        <TableCell>
                          {confirmDeleteId === tag.id ? (
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={() => handleDeleteTag(tag.id)}
                              >
                                <Check className="h-4 w-4 text-green-500" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={() => setConfirmDeleteId(null)}
                              >
                                <X className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreHorizontal className="h-4 w-4" />
                                  <span className="sr-only">Menü</span>
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => setEditTag(tag)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Düzenle
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => setConfirmDeleteId(tag.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Sil
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Ticket className="h-4 w-4 mr-2" />
                                  İlgili Biletleri Gör
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                    
                    {filteredTags.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          Etiket bulunamadı. Yeni bir etiket eklemek için "Yeni Etiket" butonunu kullanın.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
          
          {/* Sağ kolon - İstatistikler ve yardım */}
          <div className="col-span-12 md:col-span-4 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TagIcon className="h-5 w-5 mr-2 text-primary" />
                  Etiket İstatistikleri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Toplam Etiket</span>
                  <span className="font-medium">{tags.length}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Etiketli Bilet</span>
                  <span className="font-medium">{tags.reduce((acc, tag) => acc + tag.ticketsCount, 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">En Çok Kullanılan</span>
                  <Badge variant="outline" className={getTagBadgeStyles(
                    tags.sort((a, b) => b.ticketsCount - a.ticketsCount)[0].color
                  )}>
                    {tags.sort((a, b) => b.ticketsCount - a.ticketsCount)[0].name}
                  </Badge>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-primary" />
                  Popüler Etiketler
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags
                    .sort((a, b) => b.ticketsCount - a.ticketsCount)
                    .slice(0, 8)
                    .map(tag => (
                      <Badge 
                        key={tag.id}
                        variant="outline" 
                        className={getTagBadgeStyles(tag.color)}
                      >
                        {tag.name}
                        <span className="ml-1 text-xs">({tag.ticketsCount})</span>
                      </Badge>
                    ))
                  }
                </div>
                <Button variant="outline" className="w-full gap-1">
                  <ArrowUpDown className="h-4 w-4 mr-1" />
                  Kullanım Raporunu Gör
                </Button>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertCircle className="h-5 w-5 mr-2 text-amber-500" />
                  Etiketleme İpuçları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-muted-foreground">
                  <p className="mb-2">Etkili etiketleme için öneriler:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Kısa ve açıklayıcı etiketler kullanın</li>
                    <li>Aynı anlamdaki etiketleri birleştirin</li>
                    <li>Renkleri öncelikle göre belirleyin</li>
                    <li>Biletleri en az 1-2 etiketle işaretleyin</li>
                  </ul>
                </div>
                <Button variant="ghost" className="w-full gap-1">
                  <Filter className="h-4 w-4 mr-1" />
                  Etiket Yönetimi Kılavuzu
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </OperatorLayout>
  )
}
