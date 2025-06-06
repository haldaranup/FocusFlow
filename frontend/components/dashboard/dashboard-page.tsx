"use client"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { BlocklistModal } from '@/components/blocklist/blocklist-modal'
import { AnalyticsModal } from '@/components/analytics/analytics-modal'
import { TimerSettingsModal } from '@/components/ui/timer-settings-modal'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { useBlocklist } from '@/hooks/use-blocklist'
import { toast } from 'sonner'
import Cookies from 'js-cookie'
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

export function DashboardPage() {
  const { user, signOut } = useAuth()
  const { items: blocklistItems, getActiveItems } = useBlocklist()
  
  // Timer settings with defaults
  const [timerSettings, setTimerSettings] = useState<TimerSettings>({
    workDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartPomodoros: false,
    soundEnabled: true,
    soundType: 'beep',
    soundVolume: 50,
    browserNotifications: true,
    flashScreen: true
  })
  
  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [currentSession, setCurrentSession] = useState<SessionType>('work')
  const [timeLeft, setTimeLeft] = useState(25 * 60) // Will be updated based on settings
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>('idle')
  const [completedPomodoros, setCompletedPomodoros] = useState(0)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  
  // Session statistics
  const [sessionStats, setSessionStats] = useState<SessionStats>({
    completedSessions: 0,
    totalFocusTime: 0,
    interruptions: 0,
    successRate: 100
  })

  // Blocking state
  const [isBlockingActive, setIsBlockingActive] = useState(false)
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
  const [blockedItemsCount, setBlockedItemsCount] = useState(0)

  // Refs for timer and audio
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Timer configurations - now dynamic based on settings
  const sessionConfigs = {
    work: { duration: timerSettings.workDuration * 60, label: 'Work', color: 'blue' },
    break: { duration: timerSettings.shortBreakDuration * 60, label: 'Break', color: 'green' },
    longBreak: { duration: timerSettings.longBreakDuration * 60, label: 'Long Break', color: 'purple' }
  }

  // Load settings from localStorage on mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('focusflow-timer-settings')
    if (savedSettings) {
      try {
        const parsed = JSON.parse(savedSettings)
        setTimerSettings(parsed)
      } catch (error) {
        console.error('Failed to load timer settings:', error)
      }
    }
    
    // Check blocking status on mount
    checkBlockingStatus()
  }, [])

  // Update timeLeft when settings change and timer is idle
  useEffect(() => {
    if (sessionStatus === 'idle') {
      setTimeLeft(sessionConfigs[currentSession].duration)
    }
  }, [timerSettings, currentSession, sessionStatus])

  // Update blocking status based on timer state
  useEffect(() => {
    // If timer is not running or not a work session, blocking should be inactive
    if (!isTimerRunning || currentSession !== 'work') {
      setIsBlockingActive(false);
    }
  }, [isTimerRunning, currentSession])

  // Handle settings change
  const handleSettingsChange = (newSettings: TimerSettings) => {
    setTimerSettings(newSettings)
    localStorage.setItem('focusflow-timer-settings', JSON.stringify(newSettings))
    
    // Update current session duration if idle
    if (sessionStatus === 'idle') {
      const newConfigs = {
        work: { duration: newSettings.workDuration * 60 },
        break: { duration: newSettings.shortBreakDuration * 60 },
        longBreak: { duration: newSettings.longBreakDuration * 60 }
      }
      setTimeLeft(newConfigs[currentSession].duration)
    }
  }

  // Check blocking status
  const checkBlockingStatus = async () => {
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        console.log('No access token found');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/sessions/status/blocking`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const status = await response.json();
        // Only show blocking as active if there's actually an active session AND timer is running
        const shouldBeActive = status.isBlocking && status.activeSession && isTimerRunning && currentSession === 'work';
        setIsBlockingActive(shouldBeActive);
        setActiveSessionId(status.activeSession?.id || null);
        setBlockedItemsCount(status.blockedItems?.length || 0);
      } else {
        console.error('Failed to check blocking status:', response.status);
      }
    } catch (error) {
      console.error('Error checking blocking status:', error);
    }
  }

  // Start session with blocking integration
  const startSessionWithBlocking = async (sessionType: SessionType) => {
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        toast.error('Please sign in to start a session');
        return null;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/sessions/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionType })
      });
      
      if (response.ok) {
        const result = await response.json();
        setActiveSessionId(result.session.id);
        setIsBlockingActive(result.blocking.isActive);
        setBlockedItemsCount(result.blocking.count);
        
        if (result.blocking.isActive) {
          toast.success(`🛡️ Work session started! Blocking ${result.blocking.count} distracting sites.`);
        } else {
          toast.success(`✨ ${sessionType} session started!`);
        }
        
        return result.session;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to start session');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      toast.error('Failed to start session with blocking');
      return null;
    }
  }

  // End session with blocking integration
  const endSessionWithBlocking = async (sessionId: string, completed: boolean = true, interruptionReason?: string) => {
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        console.error('No access token found for ending session');
        return null;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/sessions/${sessionId}/end`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ completed, interruptionReason })
      });
      
      if (response.ok) {
        const result = await response.json();
        setActiveSessionId(null);
        setIsBlockingActive(false);
        setBlockedItemsCount(0);
        
        if (result.blocking.message === 'Blocking deactivated') {
          toast.success('🎉 Session completed! Blocking deactivated.');
        }
        
        return result.session;
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to end session');
      }
    } catch (error) {
      console.error('Error ending session:', error);
      toast.error('Failed to end session properly');
      return null;
    }
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
    
    // Calculate actual session duration
    const sessionDuration = sessionConfigs[currentSession].duration
    
    // Show notification and update stats
    if (currentSession === 'work') {
      setCompletedPomodoros(prev => prev + 1)
      
      // Update stats
      setSessionStats(prev => ({
        ...prev,
        completedSessions: prev.completedSessions + 1,
        totalFocusTime: prev.totalFocusTime + sessionDuration
      }))
      
      // End session with blocking integration
      if (activeSessionId) {
        await endSessionWithBlocking(activeSessionId, true);
      } else {
        // Fallback to old method if no active session ID
        await saveSession(currentSession, sessionDuration, true);
        toast.success('🎉 Work session completed! Time for a break.');
      }
    } else {
      toast.success('✨ Break completed! Ready to focus again?')
      // For breaks, just save normally since they don't have blocking
      await saveSession(currentSession, sessionDuration, true);
    }

    // Auto-switch to next session
    setTimeout(() => {
      autoSwitchSession()
    }, 2000)
  }

  // Auto-switch between sessions
  const autoSwitchSession = () => {
    let nextSession: SessionType
    
    if (currentSession === 'work') {
      // After work: short break or long break (based on configurable interval)
      nextSession = (completedPomodoros % timerSettings.longBreakInterval === 0) ? 'longBreak' : 'break'
    } else {
      // After any break: work session
      nextSession = 'work'
    }
    
    setCurrentSession(nextSession)
    setTimeLeft(sessionConfigs[nextSession].duration)
    setSessionStatus('idle')
    
    // Auto-start next session if enabled
    if ((nextSession !== 'work' && timerSettings.autoStartBreaks) || 
        (nextSession === 'work' && timerSettings.autoStartPomodoros)) {
      setTimeout(() => {
        setIsTimerRunning(true)
        setSessionStatus('running')
        playNotificationSound('start')
        toast.success(`${sessionConfigs[nextSession].label} session auto-started!`)
      }, 1000)
    } else {
      toast.info(`Ready for ${sessionConfigs[nextSession].label.toLowerCase()} session`)
    }
  }

  // Save session to backend
  const saveSession = async (type: SessionType, duration: number, completed: boolean) => {
    try {
      const token = Cookies.get('access_token');
      if (!token) {
        console.error('No access token found for saving session');
        return null;
      }

      // Map frontend session types to backend enum values
      const typeMapping = {
        'work': 'work',
        'break': 'break', 
        'longBreak': 'longBreak'
      };

      const sessionData = {
        type: typeMapping[type], // Use correct enum mapping
        plannedDuration: duration,
        actualDuration: completed ? duration : undefined,
        status: completed ? 'completed' : 'interrupted', // Use lowercase enum values
        startedAt: new Date(Date.now() - duration * 1000).toISOString(),
        completedAt: completed ? new Date().toISOString() : undefined,
        interruptionCount: completed ? 0 : 1
      };

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/sessions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(sessionData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save session');
      }

      const savedSession = await response.json();
      console.log('Session saved successfully:', savedSession);
      return savedSession;
    } catch (error) {
      console.error('Error saving session:', error);
      toast.error('Failed to save session data');
    }
  }

  // Handle timer start/pause
  const handleTimerToggle = async () => {
    if (!isTimerRunning) {
      setIsTimerRunning(true)
      setSessionStatus('running')
      playNotificationSound('start')
      
      // Start session with blocking integration for work sessions
      if (currentSession === 'work') {
        const session = await startSessionWithBlocking(currentSession);
        if (!session) {
          // If session creation failed, revert timer state
          setIsTimerRunning(false)
          setSessionStatus('idle')
          return;
        }
      } else {
        toast.success(`${sessionConfigs[currentSession].label} session started!`)
      }
    } else {
      setIsTimerRunning(false)
      setSessionStatus('paused')
      toast.info('Timer paused')
    }
  }

  // Handle timer stop
  const handleTimerStop = async () => {
    const wasRunning = sessionStatus === 'running'
    
    setIsTimerRunning(false)
    setTimeLeft(sessionConfigs[currentSession].duration)
    setSessionStatus('idle')
    
    if (wasRunning) {
      setSessionStats(prev => ({
        ...prev,
        interruptions: prev.interruptions + 1
      }))
      
      // End active session if there is one
      if (activeSessionId) {
        await endSessionWithBlocking(activeSessionId, false, 'User stopped timer');
      }
      
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
            
            <TimerSettingsModal
              settings={timerSettings}
              onSettingsChange={handleSettingsChange}
            >
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </TimerSettingsModal>
            
            <Button variant="ghost" size="icon" onClick={() => setShowLogoutConfirm(true)}>
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
                    Work ({timerSettings.workDuration}m)
                  </Button>
                  <Button
                    variant={currentSession === 'break' ? 'default' : 'outline'}
                    onClick={() => handleSessionChange('break')}
                    className={currentSession === 'break' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}
                    disabled={isTimerRunning}
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Break ({timerSettings.shortBreakDuration}m)
                  </Button>
                  <Button
                    variant={currentSession === 'longBreak' ? 'default' : 'outline'}
                    onClick={() => handleSessionChange('longBreak')}
                    className={currentSession === 'longBreak' ? 'bg-purple-600 hover:bg-purple-700 text-white' : ''}
                    disabled={isTimerRunning}
                  >
                    <Target className="h-4 w-4 mr-2" />
                    Long Break ({timerSettings.longBreakDuration}m)
                  </Button>
                </div>
                
                {/* Timer Configuration Info */}
                <div className="text-xs text-gray-500 dark:text-gray-400 text-center space-y-1">
                  <div>Long break every {timerSettings.longBreakInterval} work sessions</div>
                  {(timerSettings.autoStartBreaks || timerSettings.autoStartPomodoros) && (
                    <div className="flex items-center justify-center gap-2">
                      <span>Auto-start:</span>
                      {timerSettings.autoStartBreaks && <span className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full text-xs">Breaks</span>}
                      {timerSettings.autoStartPomodoros && <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full text-xs">Work</span>}
                    </div>
                  )}
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
                    <span className={`text-sm font-semibold flex items-center gap-2 ${
                      isBlockingActive
                        ? 'text-green-600 dark:text-green-400' 
                        : 'text-gray-500 dark:text-gray-400'
                    }`}>
                      {isBlockingActive && (
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      )}
                      {isBlockingActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Blocked Sites</span>
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {isBlockingActive ? blockedItemsCount : getActiveItems().length}
                    </span>
                  </div>
                  {isBlockingActive && (
                    <div className="text-xs text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20 p-2 rounded-md">
                      🛡️ Blocking {blockedItemsCount} distracting sites during work session
                    </div>
                  )}
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
                <TimerSettingsModal
                  settings={timerSettings}
                  onSettingsChange={handleSettingsChange}
                >
                  <Button variant="outline" size="sm" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Timer Settings
                  </Button>
                </TimerSettingsModal>
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
      
      {/* Logout Confirmation Modal */}
      <ConfirmationModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={signOut}
        title="Sign Out"
        description="Are you sure you want to sign out? Any unsaved progress will be lost."
        confirmText="Sign Out"
        cancelText="Cancel"
        variant="danger"
      />
    </div>
  )
} 