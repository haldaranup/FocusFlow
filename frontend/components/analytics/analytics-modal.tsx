"use client"

import { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  Target, 
  Zap, 
  Calendar,
  Award,
  Brain,
  ChevronRight,
  Lightbulb,
  Star,
  Activity,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { useAnalytics } from '@/hooks/use-analytics';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

interface AnalyticsModalProps {
  children: React.ReactNode;
}

export function AnalyticsModal({ children }: AnalyticsModalProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'trends' | 'productivity' | 'insights'>('overview');
  
  const { 
    overview, 
    loading, 
    error, 
    formatTime, 
    formatHour, 
    getProductivityLevel,
    getStreakMessage 
  } = useAnalytics();

  const formatChartTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}.${Math.round(mins/6)}h`;
    }
    return `${mins}m`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600 dark:text-green-400';
    if (rate >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getImprovementBadge = (improvement: number) => {
    if (improvement > 0) {
      return (
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          <TrendingUp className="h-3 w-3 mr-1" />
          +{improvement}%
        </Badge>
      );
    } else if (improvement < 0) {
      return (
        <Badge className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400">
          <TrendingUp className="h-3 w-3 mr-1 rotate-180" />
          {improvement}%
        </Badge>
      );
    }
    return (
      <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400">
        No change
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            Analytics & Insights
          </DialogTitle>
          <DialogDescription>
            Track your productivity patterns and discover insights to optimize your focus sessions
          </DialogDescription>
        </DialogHeader>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {[
            { key: 'overview', label: 'Overview', icon: Activity },
            { key: 'trends', label: 'Trends', icon: TrendingUp },
            { key: 'productivity', label: 'Productivity', icon: Clock },
            { key: 'insights', label: 'Insights', icon: Brain },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading analytics...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 m-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                <p className="text-red-800 dark:text-red-400">{error}</p>
              </div>
            </div>
          )}

          {overview && (
            <>
              {/* Overview Tab */}
              {activeTab === 'overview' && (
                <div className="p-4 space-y-6">
                  {/* Key Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Current Streak</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {overview.insights.currentStreak}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {getStreakMessage(overview.insights.currentStreak)}
                            </p>
                          </div>
                          <Award className="h-8 w-8 text-yellow-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {formatTime(overview.insights.totalFocusTimeThisWeek)}
                            </p>
                            <div className="mt-1">
                              {getImprovementBadge(overview.insights.improvementFromLastWeek)}
                            </div>
                          </div>
                          <Calendar className="h-8 w-8 text-blue-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Peak Hour</p>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {formatHour(overview.insights.peakProductivityHour)}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Most productive time</p>
                          </div>
                          <Clock className="h-8 w-8 text-green-500" />
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-gray-600 dark:text-gray-400">Best Day</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {overview.insights.mostProductiveDay}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">Top performing</p>
                          </div>
                          <Star className="h-8 w-8 text-purple-500" />
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Weekly Trend Chart */}
                  <Card>
                    <CardHeader>
                      <CardTitle>7-Day Focus Trend</CardTitle>
                      <CardDescription>Daily focus time and success rate</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={overview.daily}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="date" 
                            tickFormatter={formatDate}
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis 
                            yAxisId="time"
                            orientation="left"
                            tickFormatter={formatChartTime}
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis 
                            yAxisId="rate"
                            orientation="right"
                            domain={[0, 100]}
                            tickFormatter={(value) => `${value}%`}
                            style={{ fontSize: '12px' }}
                          />
                          <Tooltip 
                            labelFormatter={(value) => formatDate(value as string)}
                            formatter={(value: any, name: string) => {
                              if (name === 'totalFocusTime') {
                                return [formatTime(value), 'Focus Time'];
                              }
                              return [`${value}%`, 'Success Rate'];
                            }}
                          />
                          <Legend />
                          <Area
                            yAxisId="time"
                            type="monotone"
                            dataKey="totalFocusTime"
                            stackId="1"
                            stroke="#3B82F6"
                            fill="#3B82F6"
                            fillOpacity={0.6}
                            name="Focus Time"
                          />
                          <Line
                            yAxisId="rate"
                            type="monotone"
                            dataKey="successRate"
                            stroke="#10B981"
                            strokeWidth={2}
                            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                            name="Success Rate"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Trends Tab */}
              {activeTab === 'trends' && (
                <div className="p-4 space-y-6">
                  {/* Daily vs Weekly Comparison */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Daily Performance</CardTitle>
                        <CardDescription>Last 7 days focus time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={overview.daily}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="date" 
                              tickFormatter={formatDate}
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                              tickFormatter={formatChartTime}
                              style={{ fontSize: '12px' }}
                            />
                            <Tooltip 
                              labelFormatter={(value) => formatDate(value as string)}
                              formatter={(value: any) => [formatTime(value), 'Focus Time']}
                            />
                            <Bar 
                              dataKey="totalFocusTime" 
                              fill="#3B82F6" 
                              radius={[4, 4, 0, 0]}
                            />
                          </BarChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Weekly Trends</CardTitle>
                        <CardDescription>Last 4 weeks progress</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <ResponsiveContainer width="100%" height={250}>
                          <LineChart data={overview.weekly}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis 
                              dataKey="week" 
                              tickFormatter={formatDate}
                              style={{ fontSize: '12px' }}
                            />
                            <YAxis 
                              tickFormatter={formatChartTime}
                              style={{ fontSize: '12px' }}
                            />
                            <Tooltip 
                              labelFormatter={(value) => `Week of ${formatDate(value as string)}`}
                              formatter={(value: any) => [formatTime(value), 'Total Focus Time']}
                            />
                            <Line
                              type="monotone"
                              dataKey="totalFocusTime"
                              stroke="#10B981"
                              strokeWidth={3}
                              dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Session Type Distribution */}
                  {overview.sessionTypes.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Session Type Distribution</CardTitle>
                        <CardDescription>How you spend your focus time</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={overview.sessionTypes}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                label={({ type, percentage }) => `${type}: ${percentage}%`}
                              >
                                {overview.sessionTypes.map((entry, index) => (
                                  <Cell 
                                    key={`cell-${index}`} 
                                    fill={CHART_COLORS[index % CHART_COLORS.length]} 
                                  />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                          
                          <div className="space-y-3">
                            {overview.sessionTypes.map((type, index) => (
                              <div key={type.type} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-4 h-4 rounded-full"
                                    style={{ backgroundColor: CHART_COLORS[index % CHART_COLORS.length] }}
                                  />
                                  <span className="text-sm font-medium capitalize">{type.type}</span>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold">{type.count} sessions</p>
                                  <p className="text-xs text-gray-500">{formatTime(type.totalTime)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* Productivity Tab */}
              {activeTab === 'productivity' && (
                <div className="p-4 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Productivity Heatmap</CardTitle>
                      <CardDescription>Your focus patterns throughout the day</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={overview.productivityHours}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis 
                            dataKey="hour"
                            tickFormatter={formatHour}
                            style={{ fontSize: '12px' }}
                          />
                          <YAxis 
                            tickFormatter={formatChartTime}
                            style={{ fontSize: '12px' }}
                          />
                          <Tooltip 
                            labelFormatter={(value) => formatHour(value as number)}
                            formatter={(value: any, name: string) => {
                              if (name === 'totalFocusTime') {
                                return [formatTime(value), 'Focus Time'];
                              }
                              return [value, 'Sessions'];
                            }}
                          />
                          <Legend />
                          <Bar 
                            dataKey="totalFocusTime" 
                            fill="#3B82F6" 
                            name="Focus Time"
                            radius={[4, 4, 0, 0]}
                          />
                          <Bar 
                            dataKey="completedSessions" 
                            fill="#10B981" 
                            name="Sessions"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  {/* Performance Metrics */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatTime(overview.insights.averageDailyFocusTime)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Average Daily Focus</p>
                        <Badge className="mt-2">
                          {getProductivityLevel(overview.insights.averageDailyFocusTime)}
                        </Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {formatHour(overview.insights.peakProductivityHour)}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Peak Hour</p>
                        <Badge className="mt-2">Prime Time</Badge>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardContent className="p-4 text-center">
                        <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mx-auto mb-3">
                          <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {overview.insights.improvementFromLastWeek > 0 ? '+' : ''}{overview.insights.improvementFromLastWeek}%
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Weekly Change</p>
                        <Badge className={`mt-2 ${overview.insights.improvementFromLastWeek >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                          {overview.insights.improvementFromLastWeek >= 0 ? 'Improving' : 'Declining'}
                        </Badge>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Insights Tab */}
              {activeTab === 'insights' && (
                <div className="p-4 space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Lightbulb className="h-5 w-5 text-yellow-500" />
                        Personalized Recommendations
                      </CardTitle>
                      <CardDescription>
                        AI-powered insights to help you optimize your productivity
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {overview.insights.recommendations.map((recommendation, index) => (
                          <div key={index} className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-gray-700 dark:text-gray-300">{recommendation}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Quick Stats Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Success Patterns</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak</span>
                          <span className="font-semibold">{overview.insights.currentStreak} days</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Best Day</span>
                          <span className="font-semibold">{overview.insights.mostProductiveDay}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Peak Hour</span>
                          <span className="font-semibold">{formatHour(overview.insights.peakProductivityHour)}</span>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Weekly Progress</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">This Week</span>
                          <span className="font-semibold">{formatTime(overview.insights.totalFocusTimeThisWeek)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Daily Average</span>
                          <span className="font-semibold">{formatTime(overview.insights.averageDailyFocusTime)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Improvement</span>
                          <span className={`font-semibold ${overview.insights.improvementFromLastWeek >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {overview.insights.improvementFromLastWeek >= 0 ? '+' : ''}{overview.insights.improvementFromLastWeek}%
                          </span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
} 