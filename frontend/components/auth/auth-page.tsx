"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Eye, EyeOff, Timer, Shield, BarChart3 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: ''
  })

  const { signIn, signUp } = useAuth()
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let result
      if (isSignUp) {
        result = await signUp(
          formData.email,
          formData.password,
          formData.firstName,
          formData.lastName
        )
      } else {
        result = await signIn(formData.email, formData.password)
      }

      if (result.success) {
        toast.success(isSignUp ? 'Account created successfully!' : 'Welcome back!')
      } else {
        toast.error(result.error)
      }
    } catch (error) {
      toast.error('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-purple-900 dark:to-indigo-900 flex items-center justify-center p-4 overflow-x-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/10 dark:bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/5 dark:bg-indigo-500/3 rounded-full blur-3xl"></div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-4 h-4 bg-blue-400/20 rounded-full animate-bounce"></div>
        <div className="absolute top-40 right-20 w-6 h-6 bg-purple-400/20 rounded-full animate-bounce delay-100"></div>
        <div className="absolute bottom-20 left-20 w-5 h-5 bg-indigo-400/20 rounded-full animate-bounce delay-200"></div>
        <div className="absolute bottom-40 right-10 w-3 h-3 bg-pink-400/20 rounded-full animate-bounce delay-300"></div>
      </div>

      <div className="w-full max-w-7xl grid lg:grid-cols-2 gap-12 sm:gap-16 items-center relative z-10">
        {/* Left side - Hero content */}
        <div className="space-y-10 sm:space-y-12 text-center lg:text-left order-2 lg:order-1">
          <div className="space-y-6 sm:space-y-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 text-purple-700 dark:text-purple-300 text-sm font-medium mb-8 shadow-sm border border-purple-200/50 dark:border-purple-700/50">
              <Timer className="w-4 h-4 mr-2" />
              Productivity Made Simple
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              FocusFlow
            </h1>
            <p className="text-xl sm:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
              Boost your productivity with Pomodoro timer and intelligent distraction blocking. 
              <span className="text-blue-600 dark:text-blue-400 font-semibold block mt-2"> Start focusing today.</span>
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 max-w-2xl mx-auto lg:mx-0">
            <div className="group flex items-center gap-5 sm:gap-6 p-6 sm:p-8 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Timer className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-2">Pomodoro Timer</h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Customizable work and break intervals with smart notifications to maintain focus
                </p>
              </div>
            </div>

            <div className="group flex items-center gap-5 sm:gap-6 p-6 sm:p-8 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Shield className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-2">Distraction Blocker</h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Block websites and apps during focus sessions for uninterrupted productivity
                </p>
              </div>
            </div>

            <div className="group flex items-center gap-5 sm:gap-6 p-6 sm:p-8 rounded-2xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-lg shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 border border-gray-200/50 dark:border-gray-700/50">
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BarChart3 className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-lg sm:text-xl text-gray-900 dark:text-white mb-2">Analytics Dashboard</h3>
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                  Track your focus patterns and productivity insights with detailed analytics
                </p>
              </div>
            </div>
          </div>

          {/* Benefits Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 sm:p-8 border border-blue-200/50 dark:border-blue-700/50 shadow-lg">
            <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 text-center lg:text-left">
              ✨ Why Choose FocusFlow?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Increase focus by 300%</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Science-backed techniques</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                <span>Works across all devices</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                <span>Privacy-first approach</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right side - Auth form */}
        <div className="w-full max-w-lg mx-auto order-1 lg:order-2">
          <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg shadow-2xl border border-gray-200/50 dark:border-gray-700/50 hover:shadow-3xl transition-all duration-300">
            <CardHeader className="text-center pb-8 sm:pb-10 px-8 sm:px-10 pt-10 sm:pt-12">
              <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center shadow-xl">
                <Timer className="h-10 w-10 text-white" />
              </div>
              <CardTitle className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </CardTitle>
              <CardDescription className="text-lg sm:text-xl text-gray-600 dark:text-gray-400 leading-relaxed">
                {isSignUp ? 'Join the productivity revolution' : 'Continue your focus journey'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-8 sm:space-y-10 px-8 sm:px-10 pb-10 sm:pb-12">
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                {isSignUp && (
                  <div className="grid grid-cols-2 gap-4 sm:gap-5">
                    <div>
                      <Label htmlFor="firstName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">First Name</Label>
                      <Input
                        id="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={(e) => setFormData(prev => ({...prev, firstName: e.target.value}))}
                        required={isSignUp}
                        className="mt-2 h-14 text-lg border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors rounded-xl"
                        placeholder="John"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Last Name</Label>
                      <Input
                        id="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={(e) => setFormData(prev => ({...prev, lastName: e.target.value}))}
                        required={isSignUp}
                        className="mt-2 h-14 text-lg border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors rounded-xl"
                        placeholder="Doe"
                      />
                    </div>
                  </div>
                )}
                
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({...prev, email: e.target.value}))}
                    required
                    className="mt-2 h-14 text-lg border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors rounded-xl"
                    placeholder="john@example.com"
                  />
                </div>
                
                <div>
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({...prev, password: e.target.value}))}
                    required
                    className="mt-2 h-14 text-lg border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors rounded-xl"
                    placeholder="••••••••"
                  />
                </div>
                
                {isSignUp && (
                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 dark:text-gray-300">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => setFormData(prev => ({...prev, confirmPassword: e.target.value}))}
                      required={isSignUp}
                      className="mt-2 h-14 text-lg border-2 focus:border-blue-500 dark:focus:border-blue-400 transition-colors rounded-xl"
                      placeholder="••••••••"
                    />
                  </div>
                )}
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-5 text-lg sm:text-xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 rounded-xl"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      {isSignUp ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    isSignUp ? 'Create Account' : 'Sign In'
                  )}
                </Button>
              </form>
              
              <div className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
                  <button
                    type="button"
                    onClick={() => setIsSignUp(!isSignUp)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-semibold hover:underline transition-colors text-base sm:text-lg"
                  >
                    {isSignUp ? 'Sign In' : 'Sign Up'}
                  </button>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 