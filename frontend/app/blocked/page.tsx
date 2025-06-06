"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Clock, ArrowLeft, Coffee, Target } from 'lucide-react'
import Link from 'next/link'

export default function BlockedPage() {
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [blockedSite, setBlockedSite] = useState<string>('')
  const [sessionType, setSessionType] = useState<string>('work')

  useEffect(() => {
    // Get the blocked URL from query params
    const urlParams = new URLSearchParams(window.location.search)
    const site = urlParams.get('site') || 'this website'
    setBlockedSite(site)

    // Check current session status
    checkSessionStatus()
    
    // Update time remaining every second
    const interval = setInterval(checkSessionStatus, 1000)
    return () => clearInterval(interval)
  }, [])

  const checkSessionStatus = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/sessions/status/blocking`, {
        credentials: 'include',
      })
      
      if (response.ok) {
        const status = await response.json()
        if (status.activeSession) {
          const startTime = new Date(status.activeSession.startedAt).getTime()
          const plannedDuration = status.activeSession.plannedDuration * 1000
          const endTime = startTime + plannedDuration
          const now = Date.now()
          const remaining = Math.max(0, endTime - now)
          
          if (remaining > 0) {
            const minutes = Math.floor(remaining / 60000)
            const seconds = Math.floor((remaining % 60000) / 1000)
            setTimeRemaining(`${minutes}:${seconds.toString().padStart(2, '0')}`)
            setSessionType(status.activeSession.type)
          } else {
            setTimeRemaining('Session completed')
          }
        } else {
          setTimeRemaining('No active session')
        }
      }
    } catch (error) {
      console.error('Error checking session status:', error)
      setTimeRemaining('Unable to check session')
    }
  }

  const getSessionIcon = () => {
    switch (sessionType) {
      case 'work': return <Clock className="h-8 w-8 text-blue-500" />
      case 'break': return <Coffee className="h-8 w-8 text-green-500" />
      case 'longBreak': return <Target className="h-8 w-8 text-purple-500" />
      default: return <Shield className="h-8 w-8 text-gray-500" />
    }
  }

  const getSessionColor = () => {
    switch (sessionType) {
      case 'work': return 'from-blue-500 to-blue-600'
      case 'break': return 'from-green-500 to-green-600'
      case 'longBreak': return 'from-purple-500 to-purple-600'
      default: return 'from-gray-500 to-gray-600'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border border-red-200 dark:border-red-800 shadow-2xl">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
              <Shield className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <CardTitle className="text-2xl text-red-700 dark:text-red-300">
            Site Blocked
          </CardTitle>
          <CardDescription className="text-red-600 dark:text-red-400">
            This website is blocked during your focus session
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Blocked Site Info */}
          <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400 mb-1">Blocked Site:</p>
            <p className="font-semibold text-red-800 dark:text-red-200 break-all">{blockedSite}</p>
          </div>

          {/* Current Session Info */}
          <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-center gap-2 mb-2">
              {getSessionIcon()}
              <span className="font-semibold text-gray-800 dark:text-gray-200 capitalize">
                {sessionType} Session
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Time Remaining:</p>
            <div className={`text-2xl font-mono font-bold bg-gradient-to-r ${getSessionColor()} bg-clip-text text-transparent`}>
              {timeRemaining}
            </div>
          </div>

          {/* Motivational Message */}
          <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
              🎯 Stay focused! You're building great habits.
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
              This block will automatically lift when your session ends.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/dashboard" className="block">
              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Return to Dashboard
              </Button>
            </Link>
            
            <Button 
              variant="outline" 
              className="w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={() => window.close()}
            >
              Close Tab
            </Button>
          </div>

          {/* Tips */}
          <div className="text-center">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              💡 Tip: Use this time to focus on your current task or take a mindful break
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 