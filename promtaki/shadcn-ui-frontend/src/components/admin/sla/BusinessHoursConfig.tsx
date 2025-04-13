import React from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Clock, Save } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface WorkingDay {
  day: string
  enabled: boolean
  startTime: string
  endTime: string
}

interface BusinessHoursConfigProps {
  workingDays: WorkingDay[]
  onSave: (workingDays: WorkingDay[]) => void
}

export function BusinessHoursConfig({ workingDays, onSave }: BusinessHoursConfigProps) {
  const [days, setDays] = React.useState<WorkingDay[]>(workingDays)
  
  const handleDayToggle = (index: number, enabled: boolean) => {
    const newDays = [...days]
    newDays[index].enabled = enabled
    setDays(newDays)
  }
  
  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newDays = [...days]
    newDays[index][field] = value
    setDays(newDays)
  }
  
  const getDayLabel = (day: string) => {
    switch(day) {
      case 'monday': return 'Pazartesi'
      case 'tuesday': return 'Salı'
      case 'wednesday': return 'Çarşamba'
      case 'thursday': return 'Perşembe'
      case 'friday': return 'Cuma'
      case 'saturday': return 'Cumartesi'
      case 'sunday': return 'Pazar'
      default: return day
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Çalışma Saatleri</CardTitle>
        <CardDescription>
          SLA hesaplamaları için çalışma saatlerini tanımlayın. SLA kurallarında "Sadece çalışma saatleri" 
          seçeneği işaretlendiğinde sadece burada tanımlanan saatler içinde geçen süreler hesaplanır.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-12 gap-4 text-sm font-medium text-muted-foreground">
            <div className="col-span-3">Gün</div>
            <div className="col-span-3">Durum</div>
            <div className="col-span-3">Başlangıç</div>
            <div className="col-span-3">Bitiş</div>
          </div>
          
          {days.map((day, index) => (
            <div key={day.day} className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3">
                <Label>{getDayLabel(day.day)}</Label>
              </div>
              <div className="col-span-3">
                <Switch 
                  checked={day.enabled} 
                  onCheckedChange={(checked) => handleDayToggle(index, checked)} 
                />
              </div>
              <div className="col-span-3">
                <Input 
                  type="time" 
                  value={day.startTime} 
                  onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                  disabled={!day.enabled}
                />
              </div>
              <div className="col-span-3">
                <Input 
                  type="time" 
                  value={day.endTime} 
                  onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                  disabled={!day.enabled}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="justify-between border-t px-6 py-3">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span className="text-sm">Tüm saatler yerel zaman diliminizde (GMT+3)</span>
        </div>
        <Button onClick={() => onSave(days)}>
          <Save className="mr-2 h-4 w-4" />
          Değişiklikleri Kaydet
        </Button>
      </CardFooter>
    </Card>
  )
}
