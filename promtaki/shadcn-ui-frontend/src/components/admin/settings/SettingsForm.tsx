import React from 'react'
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'

interface SettingGroup {
  title: string
  description: string
  settings: Setting[]
}

interface Setting {
  id: string
  label: string
  description?: string
  type: 'text' | 'number' | 'email' | 'select' | 'switch'
  value: string | number | boolean
  options?: { value: string, label: string }[]
}

interface SettingsFormProps {
  settingGroup: SettingGroup
  onSave: (settings: Setting[]) => void
}

export function SettingsForm({ settingGroup, onSave }: SettingsFormProps) {
  const [settings, setSettings] = React.useState<Setting[]>(settingGroup.settings)
  const [hasChanges, setHasChanges] = React.useState(false)
  
  const handleChange = (id: string, value: string | number | boolean) => {
    setSettings(
      settings.map(setting => 
        setting.id === id 
          ? { ...setting, value } 
          : setting
      )
    )
    setHasChanges(true)
  }
  
  const handleSave = () => {
    onSave(settings)
    setHasChanges(false)
  }
  
  const renderSettingInput = (setting: Setting) => {
    switch (setting.type) {
      case 'text':
      case 'email':
        return (
          <Input 
            id={setting.id} 
            type={setting.type} 
            value={setting.value as string} 
            onChange={(e) => handleChange(setting.id, e.target.value)} 
          />
        )
      case 'number':
        return (
          <Input 
            id={setting.id} 
            type="number" 
            value={setting.value as number} 
            onChange={(e) => handleChange(setting.id, Number(e.target.value))} 
          />
        )
      case 'select':
        return (
          <Select
            value={setting.value as string}
            onValueChange={(value) => handleChange(setting.id, value)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {setting.options?.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case 'switch':
        return (
          <div className="flex items-center space-x-2">
            <Switch 
              id={setting.id} 
              checked={setting.value as boolean} 
              onCheckedChange={(checked) => handleChange(setting.id, checked)} 
            />
            <Label htmlFor={setting.id}>{setting.value ? 'Açık' : 'Kapalı'}</Label>
          </div>
        )
      default:
        return null
    }
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{settingGroup.title}</CardTitle>
        <CardDescription>{settingGroup.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {settings.map((setting) => (
          <div key={setting.id} className="space-y-2">
            <Label htmlFor={setting.id}>{setting.label}</Label>
            {renderSettingInput(setting)}
            {setting.description && (
              <p className="text-sm text-muted-foreground">{setting.description}</p>
            )}
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={!hasChanges}>
          Değişiklikleri Kaydet
        </Button>
      </CardFooter>
    </Card>
  )
}
