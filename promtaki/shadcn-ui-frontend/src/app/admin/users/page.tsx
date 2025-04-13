'use client'

import React, { useState } from 'react'
import { AdminLayout } from '@/components/layout/AdminLayout'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { 
  PlusCircle, 
  MoreHorizontal, 
  UserPlus, 
  UserMinus, 
  UserCog, 
  ShieldAlert, 
  ShieldCheck,
  Trash,
  Edit,
  User,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTranslation } from 'react-i18next'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface UserType {
  id: string
  name: string
  email: string
  role: string
  status: string
  lastActive: string
  createdAt: string
  department?: string
  avatar?: string
}

export default function UsersManagementPage() {
  const { t } = useTranslation()
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewUserDialog, setShowNewUserDialog] = useState(false)
  const [showEditUserDialog, setShowEditUserDialog] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [currentTab, setCurrentTab] = useState('all')
  
  const users: UserType[] = [
    {
      id: '1',
      name: 'Ahmet Yılmaz',
      email: 'ahmet.yilmaz@ornek.com',
      role: 'admin',
      status: 'active',
      lastActive: '10 dakika önce',
      createdAt: '15.01.2025',
      department: 'Yönetim',
      avatar: '/avatars/01.png'
    },
    {
      id: '2',
      name: 'Ayşe Demir',
      email: 'ayse.demir@ornek.com',
      role: 'operator',
      status: 'active',
      lastActive: '45 dakika önce',
      createdAt: '03.02.2025',
      department: 'Destek',
      avatar: '/avatars/02.png'
    },
    {
      id: '3',
      name: 'Mehmet Kaya',
      email: 'mehmet.kaya@ornek.com',
      role: 'operator',
      status: 'inactive',
      lastActive: '3 gün önce',
      createdAt: '20.01.2025',
      department: 'Destek',
      avatar: '/avatars/03.png'
    },
    {
      id: '4',
      name: 'Zeynep Çelik',
      email: 'zeynep.celik@ornek.com',
      role: 'customer',
      status: 'active',
      lastActive: '2 saat önce',
      createdAt: '10.03.2025',
      avatar: '/avatars/04.png'
    },
    {
      id: '5',
      name: 'Mustafa Şahin',
      email: 'mustafa.sahin@ornek.com',
      role: 'customer',
      status: 'active',
      lastActive: '1 gün önce',
      createdAt: '05.03.2025',
      avatar: '/avatars/05.png'
    },
    {
      id: '6',
      name: 'Elif Yıldız',
      email: 'elif.yildiz@ornek.com',
      role: 'operator',
      status: 'active',
      lastActive: '30 dakika önce',
      createdAt: '12.02.2025',
      department: 'Müşteri İlişkileri',
      avatar: '/avatars/06.png'
    },
  ]
  
  // Role filters for tabs
  const filteredUsers = users.filter(user => {
    // First apply tab filter
    if (currentTab !== 'all' && user.role !== currentTab) return false
    
    // Then apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        user.name.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query) ||
        user.department?.toLowerCase().includes(query)
      )
    }
    
    return true
  })
  
  const handleEditUser = (user: UserType) => {
    setSelectedUser(user)
    setShowEditUserDialog(true)
  }
  
  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
        return <Badge variant="default" className="bg-blue-500">Yönetici</Badge>
      case 'operator':
        return <Badge variant="outline" className="border-green-500 text-green-600">Operatör</Badge>
      case 'customer':
        return <Badge variant="secondary">Müşteri</Badge>
      default:
        return <Badge variant="outline">{role}</Badge>
    }
  }
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="border-green-500 text-green-600">Aktif</Badge>
      case 'inactive':
        return <Badge variant="outline" className="border-gray-500 text-gray-600">İnaktif</Badge>
      case 'suspended':
        return <Badge variant="outline" className="border-red-500 text-red-600">Askıya Alınmış</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }
  
  return (
    <AdminLayout title="Kullanıcı Yönetimi">
      <div className="p-6 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Kullanıcı Yönetimi</CardTitle>
              <CardDescription>
                Sistem kullanıcılarını görüntüle, ekle, düzenle ve yönet.
              </CardDescription>
            </div>
            <Button onClick={() => setShowNewUserDialog(true)}>
              <UserPlus className="mr-2 h-4 w-4" /> Kullanıcı Ekle
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="relative md:w-96">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="İsim, e-posta veya departman ara..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Tabs 
                  defaultValue="all" 
                  className="w-full md:w-auto"
                  onValueChange={setCurrentTab}
                >
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="all">Tümü</TabsTrigger>
                    <TabsTrigger value="admin">Yöneticiler</TabsTrigger>
                    <TabsTrigger value="operator">Operatörler</TabsTrigger>
                    <TabsTrigger value="customer">Müşteriler</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
              
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Kullanıcı</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Son Aktivite</TableHead>
                      <TableHead>Oluşturulma</TableHead>
                      <TableHead className="text-right">İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredUsers.length > 0 ? (
                      filteredUsers.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={user.avatar} alt={user.name} />
                                <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{user.name}</div>
                                <div className="text-xs text-muted-foreground">{user.email}</div>
                                {user.department && (
                                  <div className="text-xs text-muted-foreground">{user.department}</div>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{getStatusBadge(user.status)}</TableCell>
                          <TableCell>{user.lastActive}</TableCell>
                          <TableCell>{user.createdAt}</TableCell>
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
                                <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                  <Edit className="mr-2 h-4 w-4" />
                                  <span>Düzenle</span>
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  <span>Yetkileri Düzenle</span>
                                </DropdownMenuItem>
                                {user.status === 'active' ? (
                                  <DropdownMenuItem>
                                    <UserMinus className="mr-2 h-4 w-4" />
                                    <span>Devre Dışı Bırak</span>
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem>
                                    <UserPlus className="mr-2 h-4 w-4" />
                                    <span>Aktifleştir</span>
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-destructive">
                                  <Trash className="mr-2 h-4 w-4" />
                                  <span>Sil</span>
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center">
                          Gösterilecek kullanıcı bulunamadı.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex items-center justify-between border-t px-6 py-3">
            <div className="text-xs text-muted-foreground">
              Toplam {filteredUsers.length} kullanıcı gösteriliyor
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled>
                Önceki
              </Button>
              <Button variant="outline" size="sm" disabled>
                Sonraki
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      {/* Yeni Kullanıcı Ekleme Dialog */}
      <Dialog open={showNewUserDialog} onOpenChange={setShowNewUserDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Yeni Kullanıcı Ekle</DialogTitle>
            <DialogDescription>
              Sisteme yeni bir kullanıcı ekleyin. Eklenen kullanıcıya otomatik bir e-posta gönderilecektir.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                İsim
              </Label>
              <Input id="name" placeholder="Ad Soyad" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                E-posta
              </Label>
              <Input id="email" type="email" placeholder="ornek@email.com" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="role" className="text-right">
                Rol
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Bir rol seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Yönetici</SelectItem>
                  <SelectItem value="operator">Operatör</SelectItem>
                  <SelectItem value="customer">Müşteri</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="department" className="text-right">
                Departman
              </Label>
              <Input id="department" placeholder="Departman (opsiyonel)" className="col-span-3" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right col-span-1">
                <Label>Ayarlar</Label>
              </div>
              <div className="col-span-3 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="send-invitation" defaultChecked />
                  <label
                    htmlFor="send-invitation"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Davet e-postası gönder
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="require-password-change" defaultChecked />
                  <label
                    htmlFor="require-password-change"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    İlk girişte şifre değişikliği iste
                  </label>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewUserDialog(false)}>
              İptal
            </Button>
            <Button type="submit">Kullanıcı Oluştur</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Kullanıcı Düzenleme Dialog */}
      <Dialog open={showEditUserDialog} onOpenChange={setShowEditUserDialog}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>Kullanıcı Düzenle</DialogTitle>
            <DialogDescription>
              Seçilen kullanıcının bilgilerini düzenleyin.
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-name" className="text-right">
                  İsim
                </Label>
                <Input 
                  id="edit-name" 
                  defaultValue={selectedUser.name} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-email" className="text-right">
                  E-posta
                </Label>
                <Input 
                  id="edit-email" 
                  type="email" 
                  defaultValue={selectedUser.email} 
                  className="col-span-3" 
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-role" className="text-right">
                  Rol
                </Label>
                <Select defaultValue={selectedUser.role}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Yönetici</SelectItem>
                    <SelectItem value="operator">Operatör</SelectItem>
                    <SelectItem value="customer">Müşteri</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">
                  Durum
                </Label>
                <Select defaultValue={selectedUser.status}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktif</SelectItem>
                    <SelectItem value="inactive">İnaktif</SelectItem>
                    <SelectItem value="suspended">Askıya Alınmış</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-department" className="text-right">
                  Departman
                </Label>
                <Input 
                  id="edit-department" 
                  defaultValue={selectedUser.department || ''}
                  placeholder="Departman (opsiyonel)" 
                  className="col-span-3" 
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditUserDialog(false)}>
              İptal
            </Button>
            <Button type="submit">Değişiklikleri Kaydet</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  )
}
