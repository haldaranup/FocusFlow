"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, Clock, ArrowLeft, Coffee, Target, Pause, Lightbulb } from 'lucide-react'
import Link from 'next/link'
import { Home } from 'lucide-react'

export default function BlockedPage() {
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [sessionType, setSessionType] = useState<string>('work')
  const [blockedSite, setBlockedSite] = useState<string>('')

  useEffect(() => {
    // Get query parameters
    const urlParams = new URLSearchParams(window.location.search)
    const site = urlParams.get('site') || 'this website'
    const type = urlParams.get('sessionType') || 'work'
    const remaining = urlParams.get('timeRemaining') || '25:00'
    
    setBlockedSite(site)
    setSessionType(type)
    setTimeRemaining(remaining)
  }, [])

  const getSessionColor = () => {
    switch (sessionType) {
      case 'work':
        return 'from-blue-500 to-blue-700'
      case 'break':
        return 'from-green-500 to-green-700'
      case 'longBreak':
        return 'from-purple-500 to-purple-700'
      default:
        return 'from-blue-500 to-blue-700'
    }
  }

  const getSessionIcon = () => {
    switch (sessionType) {
      case 'work':
        return <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
      case 'break':
        return <Coffee className="h-5 w-5 sm:h-6 sm:w-6" />
      case 'longBreak':
        return <Pause className="h-5 w-5 sm:h-6 sm:w-6" />
      default:
        return <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 dark:from-gray-900 dark:via-red-900 dark:to-orange-900 flex items-center justify-center p-4 overflow-x-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-red-500/10 dark:bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-orange-500/10 dark:bg-orange-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-yellow-500/5 dark:bg-yellow-500/3 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-lg w-full relative z-10">
        <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-2xl border border-red-200/50 dark:border-red-800/50 hover:shadow-3xl transition-all duration-300">
          <CardHeader className="text-center pb-6 sm:pb-8 px-6 sm:px-8 pt-8 sm:pt-10">
            <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
              <Shield className="h-10 w-10 sm:h-12 sm:w-12 text-white" />
            </div>
            <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-red-800 dark:text-red-200 mb-3">
              Site Blocked
            </CardTitle>
            <CardDescription className="text-base sm:text-lg text-red-600 dark:text-red-400 font-medium">
              Focus mode is active - stay on track! 🎯
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 sm:space-y-8 px-6 sm:px-8 pb-8 sm:pb-10">
            {/* Blocked Site Info */}
            <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-red-200 dark:border-red-800 shadow-inner">
              <p className="text-sm sm:text-base text-red-600 dark:text-red-400 mb-2 font-medium">Blocked Site:</p>
              <p className="font-bold text-base sm:text-lg lg:text-xl text-red-800 dark:text-red-200 break-all bg-white/50 dark:bg-gray-800/50 px-3 py-2 rounded-lg">
                {blockedSite}
              </p>
            </div>

            {/* Current Session Info */}
            <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg">
              <div className="flex items-center justify-center gap-3 mb-4">
                <div className={`p-3 rounded-2xl bg-gradient-to-r ${getSessionColor()} shadow-lg`}>
                  {getSessionIcon()}
                </div>
                <span className="font-bold text-lg sm:text-xl text-gray-800 dark:text-gray-200 capitalize">
                  {sessionType} Session
                </span>
              </div>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-3 font-medium">Time Remaining:</p>
              <div className={`text-3xl sm:text-4xl lg:text-5xl font-mono font-extrabold bg-gradient-to-r ${getSessionColor()} bg-clip-text text-transparent drop-shadow-lg`}>
                {timeRemaining}
              </div>
            </div>

            {/* Motivational Message */}
            <div className="text-center p-4 sm:p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl border-2 border-blue-200 dark:border-blue-800 shadow-lg">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600 dark:text-blue-400" />
                <p className="text-sm sm:text-base text-blue-700 dark:text-blue-300 font-bold">
                  Stay focused! You're building great habits.
                </p>
              </div>
              <p className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 leading-relaxed">
                This block will automatically lift when your session ends. Use this time to focus on your most important tasks.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <Button 
                onClick={() => window.close()} 
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold text-base sm:text-lg py-3 sm:py-4 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                Go Back
              </Button>
              <Button 
                variant="outline" 
                onClick={() => window.location.href = '/dashboard'}
                className="w-full border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-500 font-semibold text-base sm:text-lg py-3 sm:py-4 transition-all duration-300"
              >
                <Home className="h-4 w-4 sm:h-5 sm:w-5 mr-2 sm:mr-3" />
                Dashboard
              </Button>
            </div>

            {/* Pro Tip */}
            <div className="bg-gradient-to-r from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-2xl p-4 sm:p-6 border-2 border-purple-200 dark:border-purple-800 shadow-lg">
              <div className="flex items-start gap-3 sm:gap-4">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-2xl flex-shrink-0 shadow-lg">
                  <Lightbulb className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-sm sm:text-base text-purple-800 dark:text-purple-200 mb-2">💡 Pro Tip</h4>
                  <p className="text-xs sm:text-sm text-purple-700 dark:text-purple-300 leading-relaxed">
                    The best results come from sustained concentration. Use this focused time to tackle your most challenging and important tasks. 
                    You've got this! 🚀
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 