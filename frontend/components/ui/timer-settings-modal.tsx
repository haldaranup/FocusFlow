"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Settings, Clock, Coffee, Pause } from 'lucide-react'
import { toast } from 'sonner'

interface TimerSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
}

interface TimerSettingsModalProps {
  children: React.ReactNode
  settings: TimerSettings
  onSettingsChange: (settings: TimerSettings) => void
}

export function TimerSettingsModal({ children, settings, onSettingsChange }: TimerSettingsModalProps) {
  const [open, setOpen] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings)

  // Sync local settings when settings prop changes (e.g., after page refresh)
  useEffect(() => {
    setLocalSettings(settings)
  }, [settings])

  const handleSave = () => {
    // Validate settings
    if (localSettings.workDuration < 1 || localSettings.workDuration > 60) {
      toast.error('Work session must be between 1 and 60 minutes')
      return
    }
    if (localSettings.shortBreakDuration < 1 || localSettings.shortBreakDuration > 30) {
      toast.error('Short break must be between 1 and 30 minutes')
      return
    }
    if (localSettings.longBreakDuration < 5 || localSettings.longBreakDuration > 60) {
      toast.error('Long break must be between 5 and 60 minutes')
      return
    }
    if (localSettings.longBreakInterval < 2 || localSettings.longBreakInterval > 10) {
      toast.error('Long break interval must be between 2 and 10 sessions')
      return
    }

    onSettingsChange(localSettings)
    setOpen(false)
    toast.success('Timer settings updated!')
  }

  const handleReset = () => {
    const defaultSettings: TimerSettings = {
      workDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      longBreakInterval: 4,
      autoStartBreaks: false,
      autoStartPomodoros: false
    }
    setLocalSettings(defaultSettings)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Timer Settings
          </DialogTitle>
          <DialogDescription>
            Customize your Pomodoro timer durations and behavior.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Duration Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Session Durations</h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="work-duration" className="text-xs">
                  <Clock className="h-3 w-3 inline mr-1" />
                  Work (min)
                </Label>
                <Input
                  id="work-duration"
                  type="number"
                  min="1"
                  max="60"
                  value={localSettings.workDuration}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    workDuration: parseInt(e.target.value) || 25
                  }))}
                  className="text-center"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="short-break-duration" className="text-xs">
                  <Coffee className="h-3 w-3 inline mr-1" />
                  Break (min)
                </Label>
                <Input
                  id="short-break-duration"
                  type="number"
                  min="1"
                  max="30"
                  value={localSettings.shortBreakDuration}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    shortBreakDuration: parseInt(e.target.value) || 5
                  }))}
                  className="text-center"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="long-break-duration" className="text-xs">
                  <Pause className="h-3 w-3 inline mr-1" />
                  Long (min)
                </Label>
                <Input
                  id="long-break-duration"
                  type="number"
                  min="5"
                  max="60"
                  value={localSettings.longBreakDuration}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    longBreakDuration: parseInt(e.target.value) || 15
                  }))}
                  className="text-center"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="long-break-interval" className="text-sm">
                Long break every (sessions)
              </Label>
              <Input
                id="long-break-interval"
                type="number"
                min="2"
                max="10"
                value={localSettings.longBreakInterval}
                onChange={(e) => setLocalSettings(prev => ({
                  ...prev,
                  longBreakInterval: parseInt(e.target.value) || 4
                }))}
                className="w-20"
              />
            </div>
          </div>

          {/* Auto-start Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Automation</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-start-breaks" className="text-sm">
                  Auto-start breaks
                </Label>
                <input
                  id="auto-start-breaks"
                  type="checkbox"
                  checked={localSettings.autoStartBreaks}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    autoStartBreaks: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="auto-start-pomodoros" className="text-sm">
                  Auto-start work sessions
                </Label>
                <input
                  id="auto-start-pomodoros"
                  type="checkbox"
                  checked={localSettings.autoStartPomodoros}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    autoStartPomodoros: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-between">
          <Button variant="outline" onClick={handleReset}>
            Reset to Default
          </Button>
          <div className="space-x-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Settings
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 