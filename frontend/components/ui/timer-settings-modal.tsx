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
import { Settings, Clock, Coffee, Pause, Volume2 } from 'lucide-react'
import { toast } from 'sonner'
import { NotificationManager, type NotificationSettings } from '@/utils/notifications'

interface TimerSettings {
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  longBreakInterval: number
  autoStartBreaks: boolean
  autoStartPomodoros: boolean
  // Notification settings
  soundEnabled: boolean
  soundType: 'beep' | 'chime' | 'bell' | 'digital'
  soundVolume: number
  browserNotifications: boolean
  flashScreen: boolean
}

interface TimerSettingsModalProps {
  children: React.ReactNode
  settings: TimerSettings
  onSettingsChange: (settings: TimerSettings) => void
}

export function TimerSettingsModal({ children, settings, onSettingsChange }: TimerSettingsModalProps) {
  const [open, setOpen] = useState(false)
  const [localSettings, setLocalSettings] = useState(settings)

  // Create notification manager for testing sounds
  const [notificationManager, setNotificationManager] = useState<NotificationManager | null>(null)
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const manager = new NotificationManager({
        soundEnabled: localSettings.soundEnabled,
        soundType: localSettings.soundType,
        soundVolume: localSettings.soundVolume,
        browserNotifications: localSettings.browserNotifications,
        flashScreen: localSettings.flashScreen,
      })
      setNotificationManager(manager)
    }
  }, [localSettings])

  const testSound = async () => {
    if (notificationManager && localSettings.soundEnabled) {
      await notificationManager.testSound()
    }
  }

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
      autoStartPomodoros: false,
      // Notification settings
      soundEnabled: true,
      soundType: 'beep',
      soundVolume: 50,
      browserNotifications: true,
      flashScreen: true
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

          {/* Notification Settings */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-900 dark:text-white">Notifications</h4>
            
            <div className="space-y-4">
              {/* Sound Settings */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sound-enabled" className="text-sm">
                    Enable sounds
                  </Label>
                  <input
                    id="sound-enabled"
                    type="checkbox"
                    checked={localSettings.soundEnabled}
                    onChange={(e) => setLocalSettings(prev => ({
                      ...prev,
                      soundEnabled: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {localSettings.soundEnabled && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="sound-type" className="text-sm">
                        Sound type
                      </Label>
                      <div className="flex gap-2">
                        <select
                          id="sound-type"
                          value={localSettings.soundType}
                          onChange={(e) => setLocalSettings(prev => ({
                            ...prev,
                            soundType: e.target.value as 'beep' | 'chime' | 'bell' | 'digital'
                          }))}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm"
                        >
                          <option value="beep">Beep</option>
                          <option value="chime">Chime</option>
                          <option value="bell">Bell</option>
                          <option value="digital">Digital</option>
                        </select>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={testSound}
                          disabled={!localSettings.soundEnabled}
                          className="px-3"
                        >
                          <Volume2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="sound-volume" className="text-sm">
                        Volume: {localSettings.soundVolume}%
                      </Label>
                      <input
                        id="sound-volume"
                        type="range"
                        min="0"
                        max="100"
                        value={localSettings.soundVolume}
                        onChange={(e) => setLocalSettings(prev => ({
                          ...prev,
                          soundVolume: parseInt(e.target.value)
                        }))}
                        className="w-full accent-blue-600"
                      />
                    </div>
                  </>
                )}
              </div>

              {/* Other Notification Options */}
              <div className="flex items-center justify-between">
                <Label htmlFor="browser-notifications" className="text-sm">
                  Browser notifications
                </Label>
                <input
                  id="browser-notifications"
                  type="checkbox"
                  checked={localSettings.browserNotifications}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    browserNotifications: e.target.checked
                  }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="flash-screen" className="text-sm">
                  Flash screen on completion
                </Label>
                <input
                  id="flash-screen"
                  type="checkbox"
                  checked={localSettings.flashScreen}
                  onChange={(e) => setLocalSettings(prev => ({
                    ...prev,
                    flashScreen: e.target.checked
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