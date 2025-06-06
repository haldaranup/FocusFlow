"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import Cookies from 'js-cookie'

interface User {
  id: string
  email: string
  firstName?: string
  lastName?: string
  workDuration: number
  shortBreakDuration: number
  longBreakDuration: number
  sessionsUntilLongBreak: number
  soundEnabled: boolean
  soundVolume: number
  notificationsEnabled: boolean
}

interface AuthState {
  user: User | null
  loading: boolean
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
  })

  const router = useRouter()

  useEffect(() => {
    const token = Cookies.get('access_token')
    if (token) {
      // Verify token and get user data
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
      fetchUser()
    } else {
      setAuthState({ user: null, loading: false })
    }
  }, [])

  const fetchUser = async () => {
    try {
      const response = await axios.get(`${API_URL}/auth/me`)
      setAuthState({ user: response.data, loading: false })
    } catch (error) {
      // Token is invalid, remove it
      Cookies.remove('access_token')
      delete axios.defaults.headers.common['Authorization']
      setAuthState({ user: null, loading: false })
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signin`, {
        email,
        password,
      })
      
      const { access_token, user } = response.data
      
      // Store token in cookie
      Cookies.set('access_token', access_token, { expires: 7 })
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      setAuthState({ user, loading: false })
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Sign in failed' 
      }
    }
  }

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/signup`, {
        email,
        password,
        firstName,
        lastName,
      })
      
      const { access_token, user } = response.data
      
      // Store token in cookie
      Cookies.set('access_token', access_token, { expires: 7 })
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`
      
      setAuthState({ user, loading: false })
      return { success: true }
    } catch (error: any) {
      return { 
        success: false, 
        error: error.response?.data?.message || 'Sign up failed' 
      }
    }
  }

  const signOut = () => {
    Cookies.remove('access_token')
    delete axios.defaults.headers.common['Authorization']
    setAuthState({ user: null, loading: false })
    router.push('/auth/login')
  }

  return {
    user: authState.user,
    loading: authState.loading,
    signIn,
    signUp,
    signOut,
  }
} 