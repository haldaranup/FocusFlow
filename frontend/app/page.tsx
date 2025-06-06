'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Timer, BarChart3, Shield, ArrowRight, Sparkles, Zap, Play, Target, Clock, TrendingUp, ChevronDown } from 'lucide-react'

export default function HomePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const scrollToFeatures = () => {
    document.getElementById('features-section')?.scrollIntoView({ 
      behavior: 'smooth' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-indigo-900 overflow-x-hidden">
      {/* Background decorations */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/3 rounded-full blur-3xl"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="max-w-7xl mx-auto flex justify-between items-center px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <span className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              FocusFlow
            </span>
          </div>
          
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="sm"
              className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-white/60 dark:hover:bg-gray-800/60 text-sm font-medium"
              onClick={() => router.push('/auth/login')}
            >
              Sign In
            </Button>
            <Button 
              size="sm"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 text-sm font-semibold px-4 sm:px-6"
              onClick={() => router.push('/auth/signup')}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Full-Screen Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center max-w-5xl mx-auto">
            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold leading-tight mb-6 sm:mb-8 lg:mb-10">
              <span className="text-gray-900 dark:text-white">Master Your</span>{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400">
                Focus
              </span>
            </h1>
            
            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 mb-10 sm:mb-12 lg:mb-16 max-w-4xl mx-auto leading-relaxed font-medium">
              Transform your productivity with our elegant Pomodoro timer, intelligent distraction blocker, and comprehensive analytics. 
              <span className="text-blue-600 dark:text-blue-400 font-semibold block mt-2"> Take control of your time.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 lg:gap-8 justify-center mb-16 sm:mb-20 lg:mb-24">
              <Button 
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 sm:px-12 lg:px-16 py-4 sm:py-5 lg:py-6 text-lg sm:text-xl lg:text-2xl font-semibold shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition-all duration-300 group w-full sm:w-auto"
                onClick={() => router.push('/auth/signup')}
              >
                Start Focusing Now
                <ArrowRight className="ml-3 sm:ml-4 h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 group-hover:translate-x-1 transition-transform" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-white/80 dark:hover:bg-gray-800/80 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 px-8 sm:px-12 lg:px-16 py-4 sm:py-5 lg:py-6 text-lg sm:text-xl lg:text-2xl font-semibold backdrop-blur-sm transition-all duration-300 w-full sm:w-auto"
                onClick={() => router.push('/auth/login')}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce cursor-pointer" onClick={scrollToFeatures}>
          <div className="flex flex-col items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
            <span className="text-sm font-medium mb-2">Scroll to explore</span>
            <ChevronDown className="h-6 w-6" />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features-section" className="relative py-16 sm:py-20 lg:py-24 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 sm:mb-20 lg:mb-24">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 dark:text-white mb-6 sm:mb-8">
              Everything You Need to Stay Focused
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Powerful tools designed to help you eliminate distractions and maximize productivity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12 mb-20 sm:mb-24 lg:mb-28">
            {/* Feature 1 */}
            <Card className="group p-8 sm:p-10 lg:p-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Timer className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Pomodoro Timer</h3>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  Customizable work and break intervals with smart notifications to maintain peak focus and productivity
                </p>
              </div>
            </Card>

            {/* Feature 2 */}
            <Card className="group p-8 sm:p-10 lg:p-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <Shield className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Distraction Blocker</h3>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  Intelligently block websites and apps during focus sessions for uninterrupted deep work
                </p>
              </div>
            </Card>

            {/* Feature 3 */}
            <Card className="group p-8 sm:p-10 lg:p-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border border-gray-200/50 dark:border-gray-700/50 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-105 cursor-pointer md:col-span-3 lg:col-span-1">
              <div className="flex flex-col items-center text-center space-y-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300">
                  <BarChart3 className="h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h3>
                <p className="text-base sm:text-lg lg:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                  Comprehensive insights into your productivity patterns with actionable recommendations
                </p>
              </div>
            </Card>
          </div>

          {/* Benefits Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 lg:gap-10">
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Play className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h4 className="font-bold text-base sm:text-lg lg:text-xl text-gray-900 dark:text-white mb-3">Instant Start</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Begin focusing in seconds with one-click session start</p>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Target className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h4 className="font-bold text-base sm:text-lg lg:text-xl text-gray-900 dark:text-white mb-3">Goal Tracking</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Set and achieve daily productivity goals effortlessly</p>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Clock className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h4 className="font-bold text-base sm:text-lg lg:text-xl text-gray-900 dark:text-white mb-3">Time Tracking</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Automatic time logging for all your work sessions</p>
            </div>

            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-lg rounded-2xl p-6 sm:p-8 border border-gray-200/50 dark:border-gray-700/50 shadow-lg hover:shadow-xl transition-all duration-300 text-center">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <TrendingUp className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <h4 className="font-bold text-base sm:text-lg lg:text-xl text-gray-900 dark:text-white mb-3">Progress Insights</h4>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">Detailed analytics to improve your focus habits</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-16 sm:py-20 lg:py-24">
        <div className="max-w-5xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl sm:rounded-3xl p-10 sm:p-16 lg:p-20 shadow-2xl">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6 sm:mb-8 lg:mb-10">
              Ready to Transform Your Productivity?
            </h2>
            <p className="text-lg sm:text-xl lg:text-2xl xl:text-3xl text-blue-100 mb-10 sm:mb-12 lg:mb-16 leading-relaxed max-w-3xl mx-auto">
              Start your journey to better focus and productivity today
            </p>
            <Button 
              size="lg"
              className="bg-white text-blue-600 hover:bg-blue-50 px-10 sm:px-16 lg:px-20 py-5 sm:py-6 lg:py-7 text-xl sm:text-2xl lg:text-3xl font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 group"
              onClick={() => router.push('/auth/signup')}
            >
              Start Your Free Journey
              <ArrowRight className="ml-4 sm:ml-5 h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
} 