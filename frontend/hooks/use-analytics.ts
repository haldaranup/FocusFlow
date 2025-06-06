import { useState, useEffect } from 'react';
import { analyticsApi } from '../services/api';

export interface DailyStats {
  date: string;
  totalFocusTime: number;
  completedSessions: number;
  totalSessions: number;
  successRate: number;
}

export interface WeeklyStats {
  week: string;
  totalFocusTime: number;
  completedSessions: number;
  averageSessionLength: number;
  successRate: number;
}

export interface ProductivityHour {
  hour: number;
  totalFocusTime: number;
  completedSessions: number;
  averageSessionLength: number;
}

export interface SessionTypeDistribution {
  type: string;
  count: number;
  totalTime: number;
  percentage: number;
}

export interface AnalyticsInsights {
  peakProductivityHour: number;
  averageDailyFocusTime: number;
  currentStreak: number;
  improvementFromLastWeek: number;
  totalFocusTimeThisWeek: number;
  mostProductiveDay: string;
  recommendations: string[];
}

export interface AnalyticsOverview {
  daily: DailyStats[];
  weekly: WeeklyStats[];
  productivityHours: ProductivityHour[];
  sessionTypes: SessionTypeDistribution[];
  insights: AnalyticsInsights;
}

export const useAnalytics = () => {
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch comprehensive analytics overview
  const fetchOverview = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await analyticsApi.getOverview();
      setOverview(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch specific daily stats
  const fetchDailyStats = async (days?: number) => {
    try {
      setError(null);
      const response = await analyticsApi.getDailyStats(days);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch daily stats');
      throw err;
    }
  };

  // Fetch specific weekly stats
  const fetchWeeklyStats = async (weeks?: number) => {
    try {
      setError(null);
      const response = await analyticsApi.getWeeklyStats(weeks);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch weekly stats');
      throw err;
    }
  };

  // Fetch productivity hours
  const fetchProductivityHours = async (days?: number) => {
    try {
      setError(null);
      const response = await analyticsApi.getProductivityHours(days);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch productivity hours');
      throw err;
    }
  };

  // Fetch session type distribution
  const fetchSessionTypes = async (days?: number) => {
    try {
      setError(null);
      const response = await analyticsApi.getSessionTypes(days);
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch session types');
      throw err;
    }
  };

  // Fetch insights
  const fetchInsights = async () => {
    try {
      setError(null);
      const response = await analyticsApi.getInsights();
      return response.data;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch insights');
      throw err;
    }
  };

  // Helper functions for formatting
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const formatHour = (hour: number) => {
    if (hour === 0) return '12 AM';
    if (hour < 12) return `${hour} AM`;
    if (hour === 12) return '12 PM';
    return `${hour - 12} PM`;
  };

  const getProductivityLevel = (focusTime: number) => {
    if (focusTime >= 4 * 3600) return 'Excellent'; // 4+ hours
    if (focusTime >= 2 * 3600) return 'Good'; // 2+ hours
    if (focusTime >= 1 * 3600) return 'Fair'; // 1+ hour
    return 'Low';
  };

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Start your streak today!';
    if (streak === 1) return 'Great start! Keep it going.';
    if (streak < 7) return `${streak} days strong! Keep building.`;
    if (streak < 30) return `Amazing ${streak}-day streak!`;
    return `Incredible ${streak}-day streak! You're unstoppable!`;
  };

  // Initialize data on mount
  useEffect(() => {
    fetchOverview();
  }, []);

  return {
    overview,
    loading,
    error,
    fetchOverview,
    fetchDailyStats,
    fetchWeeklyStats,
    fetchProductivityHours,
    fetchSessionTypes,
    fetchInsights,
    formatTime,
    formatHour,
    getProductivityLevel,
    getStreakMessage,
  };
}; 