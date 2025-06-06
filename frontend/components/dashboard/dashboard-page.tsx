"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { BlocklistModal } from '@/components/blocklist/blocklist-modal'
import { AnalyticsModal } from '@/components/analytics/analytics-modal'
import { useBlocklist } from '@/hooks/use-blocklist'
import { toast } from 'sonner'
import { 
  Timer, 
  Play, 
  Pause, 
  Square, 
  Settings, 
  BarChart3, 
  Shield, 
  LogOut,
  Clock,
  TrendingUp,
  CheckCircle,
  Target,
  Zap,
  Volume2,
  VolumeX
} from 'lucide-react'

type SessionType = 'work' | 'break' | 'longBreak'
type SessionStatus = 'idle' | 'running' | 'paused' | 'completed'

interface SessionStats {
  completedSessions: number
  totalFocusTime: number
  interruptions: number
  successRate: number
}

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const { items: blocklistItems, getActiveItems } = useBlocklist()
  
  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [currentSession, setCurrentSession] = useState<SessionType>('work')
  const [timeLeft, setTimeLeft] = useState(25 * 60) // 25 minutes in seconds
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle')
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  
  // Session statistics
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    completedSessions: 0,
    totalFocusTime: 0,
    interruptions: 0,
    successRate: 100
  })

  // Refs for timer and audio
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Timer configurations
  const sessionConfigs = {
    work: { duration: 25 * 60, label: 'Work', color: 'blue' },
    break: { duration: 5 * 60, label: 'Break', color: 'green' },
    longBreak: { duration: 15 * 60, label: 'Long Break', color: 'purple' }
  }

  // Progress calculation for the progress bar
  const totalTime = sessionConfigs[currentSession].duration
  const progress = ((totalTime - timeLeft) / totalTime) * 100

  // Initialize audio
  useEffect(() => {
    // Create audio context for notification sounds
    audioRef.current = new Audio()
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Timer countdown logic
  useEffect(() => {
    if (isTimerRunning && timeLeft > 0) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleSessionComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isTimerRunning, timeLeft])

  // Format time display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Format duration for display
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${mins}m`
    }
    return `${mins}m`
  }

  // Play notification sound
  const playNotificationSound = (type: 'start' | 'complete') => {
    if (!soundEnabled || !audioRef.current) return
    
    try {
      // Create different frequency tones for different notifications
      const audioContext = new AudioContext()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      if (type === 'start') {
        // Higher pitch for start
        oscillator.frequency.setValueAtTime(800, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
      } else {
        // Lower pitch for complete
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime)
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.1)
        oscillator.frequency.setValueAtTime(500, audioContext.currentTime + 0.2)
      }
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.3)
    } catch (error) {
      console.log('Audio not supported')
    }
  }

  // Handle session completion
  const handleSessionComplete = async () => {
    setIsTimerRunning(false)
    setSessionStatus('completed')
    
    // Play completion sound
    playNotificationSound('complete')
    
    // Show notification
    if (currentSession === 'work') {
      toast.success('🎉 Work session completed! Time for a break.')
      setCompletedPomodoros(prev => prev + 1)
      
      // Update stats
      setSessionStats(prev => ({
        ...prev,
        completedSessions: prev.completedSessions + 1,
        totalFocusTime: prev.totalFocusTime + (25 * 60)
      }))
      
      // Save session to backend
      await saveSession('work', 25 * 60, true)
    } else {
      toast.success('✨ Break completed! Ready to focus again?')
    }

    // Auto-switch to next session type
    setTimeout(() => {
      autoSwitchSession()
    }, 2000)
  }

  // Auto-switch between sessions
  const autoSwitchSession = () => {
    let nextSession: SessionType
    
    if (currentSession === 'work') {
      // After work: short break or long break (every 4 pomodoros)
      nextSession = completedPomodoros > 0 && completedPomodoros % 4 === 0 ? 'longBreak' : 'break'
    } else {
      // After break: back to work
      nextSession = 'work'
    }
    
    setCurrentSession(nextSession)
    setTimeLeft(sessionConfigs[nextSession].duration)
    setSessionStatus('idle')
    
    toast.info(`Switched to ${sessionConfigs[nextSession].label} session`)
  }

  // Save session to backend
  const saveSession = async (type: string, duration: number, completed: boolean) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          type,
          duration,
          completed,
          startedAt: new Date(Date.now() - duration * 1000).toISOString(),
          completedAt: completed ? new Date().toISOString() : null
        })
      })
      
      if (!response.ok) {
        throw new Error('Failed to save session')
      }
    } catch (error) {
      console.error('Error saving session:', error)
    }
  }

  // Handle timer start/pause
  const handleTimerToggle = () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true)
      setSessionStatus('running')
      playNotificationSound('start')
      toast.success(`${sessionConfigs[currentSession].label} session started!`)
    } else {
      setIsTimerRunning(false)
      setSessionStatus('paused')
      toast.info('Timer paused')
    }
  }

  // Handle timer stop
  const handleTimerStop = () => {
    setIsTimerRunning(false)
    setTimeLeft(sessionConfigs[currentSession].duration)
    setSessionStatus('idle')
    
    if (sessionStatus === 'running') {
      setSessionStats(prev => ({
        ...prev,
        interruptions: prev.interruptions + 1
      }))
      toast.warning('Session interrupted')
    }
  }

  // Handle manual session change
  const handleSessionChange = (sessionType: SessionType) => {
    if (isTimerRunning) {
      toast.error('Stop the current session before switching')
      return
    }
    
    setCurrentSession(sessionType)
    setIsTimerRunning(false)
    setTimeLeft(sessionConfigs[sessionType].duration)
    setSessionStatus('idle')
  }

  // Get session color class
  const getSessionColorClass = (type: SessionType) => {
    const colors = {
      work: 'from-blue-500 to-blue-600',
      break: 'from-green-500 to-green-600',
      longBreak: 'from-purple-500 to-purple-600'
    }
    return colors[type]
  }

  // Get status indicator
  const getStatusIndicator = () => {
    const colors = {
      work: 'bg-blue-500',
      break: 'bg-green-500',
      longBreak: 'bg-purple-500'
    }
    return (
      <div className={`w-3 h-3 rounded-full ${colors[currentSession]} ${isTimerRunning ? 'animate-pulse' : ''}`} />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 dark:bg-blue-500 rounded-lg flex items-center justify-center">
              <Timer className="h-5 w-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              FocusFlow
            </h1>
            {isTimerRunning && (
              <span className="text-sm bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-1 rounded-full">
                Active
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block">
              Welcome, {user?.firstName || user?.email?.split('@')[0]}
            </span>
            
            {/* Sound toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Disable sound' : 'Enable sound'}
            >
              {soundEnabled ? (
                <Volume2 className="h-4 w-4" />
              ) : (
                <VolumeX className="h-4 w-4" />
              )}
            </Button>
            
            <ThemeToggle />
            
            <Button variant="ghost" size="icon">
              <Settings className="h-4 w-4" />
            </Button>
            
            <Button variant="ghost" size="icon" onClick={signOut}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Timer Section */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Timer Card */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700 shadow-xl">
              <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center gap-2 mb-2">
                  {getStatusIndicator()}
                  <CardTitle className="text-2xl">
                    {sessionConfigs[currentSession].label} Session
                  </CardTitle>
                </div>
                <CardDescription>
                  {currentSession === 'work' 
                    ? 'Stay focused and avoid distractions'
                    : currentSession === 'break'
                    ? 'Take a well-deserved break'
                    : 'Enjoy your long break!'
                  }
                </CardDescription>
              </CardHeader>
              
              <CardContent className="text-center space-y-8">
                {/* Timer Display */}
                <div className="space-y-6">
                  <div className={`text-6xl md:text-8xl font-mono font-bold ${
                    timeLeft <= 60 && isTimerRunning ? 'text-red-500 animate-pulse' : 'text-gray-900 dark:text-white'
                  }`}>
                    {formatTime(timeLeft)}
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full max-w-md mx-auto">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div 
                        className={`h-3 rounded-full transition-all duration-1000 bg-gradient-to-r ${getSessionColorClass(currentSession)}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between mt-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>0:00</span>
                      <span>{formatTime(totalTime)}</span>
                    </div>
                  </div>
                  
                  {/* Session count */}
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Completed Pomodoros: {completedPomodoros}
                  </div>
                </div>

                {/* Timer Controls */}
                <div className="flex items-center justify-center gap-4">
                  <Button
                    size="lg"
                    onClick={handleTimerToggle}
                    className={`px-8 bg-gradient-to-r ${getSessionColorClass(currentSession)} hover:opacity-90 text-white shadow-lg`}
                    disabled={timeLeft === 0}
                  >
                    {isTimerRunning ? (
                      <>
                        <Pause className="h-5 w-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="h-5 w-5 mr-2" />
                        {sessionStatus === 'paused' ? 'Resume' : 'Start'}
                      </>
                    )}
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleTimerStop}
                    disabled={sessionStatus === 'idle'}
                  >
                    <Square className="h-5 w-5 mr-2" />
                    Stop
                  </Button>
                </div>

                {/* Session Type Toggle */}
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <Button
                    variant={currentSession === 'work' ? 'default' : 'outline'}
                    onClick={() => handleSessionChange('work')}
                    className={currentSession === 'work' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                    disabled={isTimerRunning}
                  >
                    <Clock className="h-4 w-4 mr-2" />
                    Work (25m)
                  </Button>
                  <Button
                    variant={currentSession === 'break' ? 'default' : 'outline'}
                    onClick={() => handleSessionChange('break')}
                    className={currentSession === 'break' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                    disabled={isTimerRunning}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Break (5m)
                  </Button>
                  <Button
                    variant={currentSession === 'longBreak' ? 'default' : 'outline'}
                    onClick={() => handleSessionChange('longBreak')}
                    className={currentSession === 'longBreak' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
                    disabled={isTimerRunning}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Long Break (15m)
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Today's Overview */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{sessionStats.completedSessions}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Completed Sessions</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatDuration(sessionStats.totalFocusTime)}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Focus Time</p>
                </CardContent>
              </Card>

              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
                <CardContent className="p-6 text-center">
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{sessionStats.successRate}%</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Success Rate</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Progress Card */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Today's Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Completed Sessions
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{sessionStats.completedSessions}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Focus Time
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{formatDuration(sessionStats.totalFocusTime)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Interruptions
                  </span>
                  <span className="font-semibold text-gray-900 dark:text-white">{sessionStats.interruptions}</span>
                </div>
              </CardContent>
            </Card>

            {/* Distraction Blocker */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  Distraction Blocker
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                    <span className={`text-sm font-semibold ${
                      isTimerRunning && currentSession === 'work'
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {isTimerRunning && currentSession === 'work' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Blocked Sites</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">{getActiveItems().length}</span>
                  </div>
                  <BlocklistModal>
                    <Button variant="outline" size="sm" className="w-full">
                      Manage Blocklist
                    </Button>
                  </BlocklistModal>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <AnalyticsModal>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                </AnalyticsModal>
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Settings className="h-4 w-4 mr-2" />
                  Timer Settings
                </Button>
                <BlocklistModal>
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Shield className="h-4 w-4 mr-2" />
                    Manage Blocklist
                  </Button>
                </BlocklistModal>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
} 