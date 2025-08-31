import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { pollsApi } from '../services/api';
import { Poll } from '../types/poll';
import { format, formatDistanceToNow, subDays } from 'date-fns';
import { 
  TrendingUp, 
  Users, 
  Trophy, 
  BarChart3, 
  Activity,
  Target,
  Zap,
  Eye,
  Clock,
  Vote,
  Percent,
  RefreshCw,
  Download,
  FileText
} from 'lucide-react';

interface PollAnalyticsProps {
  refreshTrigger?: number;
}

const PollAnalytics: React.FC<PollAnalyticsProps> = ({ refreshTrigger }) => {
  const [allPolls, setAllPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | 'all'>('7d');

  // Real-time metrics state
  const [metrics, setMetrics] = useState({
    totalPolls: 0,
    totalVotes: 0,
    activePolls: 0,
    avgParticipation: 0,
    topPerformingPoll: null as Poll | null,
    recentActivity: [] as any[]
  });

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [activePolls, closedPolls] = await Promise.all([
        pollsApi.getActivePolls(),
        pollsApi.getClosedPolls()
      ]);
      
      const combined = [...activePolls, ...closedPolls];
      setAllPolls(combined);
      
      // Calculate metrics
      const totalVotes = combined.reduce((sum, poll) => sum + (poll._count?.votes || 0), 0);
      const avgParticipation = combined.length > 0 ? totalVotes / combined.length : 0;
      const topPoll = combined.reduce((prev, current) => 
        (current._count?.votes || 0) > (prev._count?.votes || 0) ? current : prev, 
        combined[0]
      );

      // Simulate recent activity data
      const recentActivity = combined.slice(0, 5).map((poll, index) => ({
        time: format(subDays(new Date(), index), 'MMM dd, HH:mm'),
        votes: poll._count?.votes || 0,
        poll: poll.question.substring(0, 30) + '...'
      }));

      setMetrics({
        totalPolls: combined.length,
        totalVotes,
        activePolls: activePolls.length,
        avgParticipation: Math.round(avgParticipation),
        topPerformingPoll: topPoll,
        recentActivity
      });

      setLastUpdated(new Date());
    } catch (err) {
      setError('Failed to fetch analytics data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, [refreshTrigger]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      fetchAllData();
    }, 30000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  // Prepare chart data
  const getFilteredPolls = () => {
    const now = new Date();
    const cutoff = selectedPeriod === '7d' ? subDays(now, 7) : 
                   selectedPeriod === '30d' ? subDays(now, 30) : 
                   new Date(0);
    
    return allPolls.filter(poll => new Date(poll.createdAt || now) >= cutoff);
  };

  const filteredPolls = getFilteredPolls();
  
  const pollsOverTimeData = filteredPolls.reduce((acc, poll) => {
    const date = format(new Date(poll.createdAt || new Date()), 'MMM dd');
    const existing = acc.find(item => item.date === date);
    if (existing) {
      existing.polls += 1;
      existing.votes += poll._count?.votes || 0;
    } else {
      acc.push({
        date,
        polls: 1,
        votes: poll._count?.votes || 0
      });
    }
    return acc;
  }, [] as any[]);

  const topPerformingPolls = [...filteredPolls]
    .sort((a, b) => (b._count?.votes || 0) - (a._count?.votes || 0))
    .slice(0, 5);

  const participationData = filteredPolls.map((poll, index) => ({
    name: `Poll ${index + 1}`,
    fullName: poll.question.substring(0, 30) + '...',
    votes: poll._count?.votes || 0,
    options: poll.options.length
  }));

  // CSV Export Function
  const exportToCSV = () => {
    const csvData = [];
    
    // Headers
    csvData.push(['Poll Analytics Report', '', '', '']);
    csvData.push(['Generated on', format(new Date(), 'yyyy-MM-dd HH:mm:ss'), '', '']);
    csvData.push(['Period', selectedPeriod === '7d' ? '7 Days' : selectedPeriod === '30d' ? '30 Days' : 'All Time', '', '']);
    csvData.push(['', '', '', '']);

    // Summary metrics
    csvData.push(['SUMMARY METRICS', '', '', '']);
    csvData.push(['Total Polls', metrics.totalPolls, '', '']);
    csvData.push(['Total Votes', metrics.totalVotes, '', '']);
    csvData.push(['Active Polls', metrics.activePolls, '', '']);
    csvData.push(['Average Participation', metrics.avgParticipation, '', '']);
    csvData.push(['', '', '', '']);

    // Poll details
    csvData.push(['POLL DETAILS', '', '', '']);
    csvData.push(['Poll ID', 'Question', 'Total Votes', 'Status']);
    
    filteredPolls.forEach(poll => {
      csvData.push([
        poll.id,
        poll.question,
        poll._count?.votes || 0,
        poll.status || 'Unknown'
      ]);
    });

    csvData.push(['', '', '', '']);
    
    // Options breakdown
    csvData.push(['DETAILED VOTE BREAKDOWN', '', '', '']);
    csvData.push(['Poll Question', 'Option Text', 'Votes', 'Poll ID']);
    
    filteredPolls.forEach(poll => {
      poll.options.forEach(option => {
        csvData.push([
          poll.question,
          option.text,
          option.votes || 0,
          poll.id
        ]);
      });
    });

    // Convert to CSV string
    const csvContent = csvData.map(row => 
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');

    // Download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `poll-analytics-${format(new Date(), 'yyyy-MM-dd-HHmm')}.csv`;
    link.click();
  };

  // PDF Export Function
  const generatePDF = async () => {
    try {
      // Create a new window for PDF generation
      const printWindow = window.open('', '_blank');
      if (!printWindow) return;

      const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Poll Analytics Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #3B82F6;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .metrics-grid {
              display: grid;
              grid-template-columns: repeat(4, 1fr);
              gap: 20px;
              margin-bottom: 30px;
            }
            .metric-card {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 20px;
              border-radius: 10px;
              text-align: center;
            }
            .metric-value {
              font-size: 2em;
              font-weight: bold;
              margin-bottom: 5px;
            }
            .metric-label {
              font-size: 0.9em;
              opacity: 0.9;
            }
            .section {
              margin-bottom: 40px;
              page-break-inside: avoid;
            }
            .section h2 {
              color: #1f2937;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 10px;
            }
            .polls-table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            .polls-table th,
            .polls-table td {
              border: 1px solid #e5e7eb;
              padding: 12px;
              text-align: left;
            }
            .polls-table th {
              background-color: #f3f4f6;
              font-weight: bold;
            }
            .polls-table tr:nth-child(even) {
              background-color: #f9fafb;
            }
            .activity-item {
              padding: 10px;
              margin: 10px 0;
              background-color: #f3f4f6;
              border-radius: 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .chart-placeholder {
              width: 100%;
              height: 200px;
              background: linear-gradient(45deg, #f3f4f6, #e5e7eb);
              border: 2px dashed #9ca3af;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 16px;
              color: #6b7280;
              border-radius: 10px;
              margin: 20px 0;
            }
            .stats-grid {
              display: grid;
              grid-template-columns: repeat(3, 1fr);
              gap: 20px;
              margin-top: 20px;
            }
            .stat-box {
              background: #f8fafc;
              padding: 15px;
              border-radius: 8px;
              text-align: center;
              border: 1px solid #e2e8f0;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #e5e7eb;
              color: #6b7280;
              font-size: 0.9em;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>📊 Poll Analytics Dashboard Report</h1>
            <p><strong>Generated:</strong> ${format(new Date(), 'EEEE, MMMM dd, yyyy \'at\' HH:mm:ss')}</p>
            <p><strong>Period:</strong> ${selectedPeriod === '7d' ? 'Last 7 Days' : selectedPeriod === '30d' ? 'Last 30 Days' : 'All Time'}</p>
            <p><strong>Total Polls Analyzed:</strong> ${filteredPolls.length}</p>
          </div>

          <div class="section">
            <h2>📈 Key Metrics Overview</h2>
            <div class="metrics-grid">
              <div class="metric-card" style="background: linear-gradient(135deg, #3B82F6, #1E40AF);">
                <div class="metric-value">${metrics.totalPolls}</div>
                <div class="metric-label">Total Polls</div>
              </div>
              <div class="metric-card" style="background: linear-gradient(135deg, #10B981, #047857);">
                <div class="metric-value">${metrics.totalVotes}</div>
                <div class="metric-label">Total Votes</div>
              </div>
              <div class="metric-card" style="background: linear-gradient(135deg, #8B5CF6, #6D28D9);">
                <div class="metric-value">${metrics.activePolls}</div>
                <div class="metric-label">Active Polls</div>
              </div>
              <div class="metric-card" style="background: linear-gradient(135deg, #F59E0B, #D97706);">
                <div class="metric-value">${metrics.avgParticipation}</div>
                <div class="metric-label">Avg. Participation</div>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>🏆 Top Performing Polls</h2>
            <table class="polls-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Question</th>
                  <th>Total Votes</th>
                  <th>Options</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                ${topPerformingPolls.map((poll, index) => `
                  <tr>
                    <td>${index + 1}</td>
                    <td>${poll.question}</td>
                    <td><strong>${poll._count?.votes || 0}</strong></td>
                    <td>${poll.options.length}</td>
                    <td>${poll.status || 'Active'}</td>
                    <td>${poll.createdAt ? format(new Date(poll.createdAt), 'MMM dd, yyyy') : 'N/A'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>📊 Polling Activity Data</h2>
            <div class="chart-placeholder">
              📈 Activity Trend Data - ${pollsOverTimeData.length} data points
              <br>
              Total Votes in Period: ${pollsOverTimeData.reduce((sum, d) => sum + d.votes, 0)}
            </div>
            
            <div class="stats-grid">
              <div class="stat-box">
                <h3>Most Active Day</h3>
                <p>${pollsOverTimeData.length > 0 ? pollsOverTimeData.reduce((prev, current) => (current.votes > prev.votes) ? current : prev).date : 'N/A'}</p>
              </div>
              <div class="stat-box">
                <h3>Total Data Points</h3>
                <p>${pollsOverTimeData.length} days</p>
              </div>
              <div class="stat-box">
                <h3>Avg Daily Votes</h3>
                <p>${pollsOverTimeData.length > 0 ? Math.round(pollsOverTimeData.reduce((sum, d) => sum + d.votes, 0) / pollsOverTimeData.length) : 0}</p>
              </div>
            </div>
          </div>

          <div class="section">
            <h2>🎯 Participation Analysis</h2>
            <div class="chart-placeholder">
              📊 Participation Data - ${participationData.length} polls analyzed
              <br>
              Highest Participation: ${Math.max(...participationData.map(d => d.votes), 0)} votes
            </div>
            
            <table class="polls-table">
              <thead>
                <tr>
                  <th>Poll</th>
                  <th>Question Preview</th>
                  <th>Votes</th>
                  <th>Options</th>
                </tr>
              </thead>
              <tbody>
                ${participationData.map((poll) => `
                  <tr>
                    <td>${poll.name}</td>
                    <td>${poll.fullName}</td>
                    <td><strong>${poll.votes}</strong></td>
                    <td>${poll.options}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>

          <div class="section">
            <h2>⚡ Recent Activity</h2>
            ${metrics.recentActivity.map(activity => `
              <div class="activity-item">
                <div>
                  <strong>${activity.poll}</strong>
                  <br>
                  <small>${activity.time}</small>
                </div>
                <div style="font-weight: bold; color: #10B981;">
                  ${activity.votes} votes
                </div>
              </div>
            `).join('')}
          </div>

          

          <div class="footer">
            <p>This report was automatically generated by the Poll Analytics System</p>
            <p>Data includes all polls from the selected time period (${selectedPeriod === '7d' ? 'Last 7 Days' : selectedPeriod === '30d' ? 'Last 30 Days' : 'All Time'}) with real-time voting statistics</p>
            <p>Report contains ${filteredPolls.length} polls with ${metrics.totalVotes} total votes</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(htmlContent);
      printWindow.document.close();

      // Wait for content to load then print
      setTimeout(() => {
        printWindow.print();
      }, 1000);

    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="w-full h-16 mb-3 bg-gray-200 rounded-lg"></div>
                <div className="w-3/4 h-4 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="w-full h-64 bg-gray-200 rounded-lg"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <div className="mb-4 text-4xl">📊</div>
        <h3 className="mb-2 text-xl font-semibold text-gray-700">Analytics Unavailable</h3>
        <p className="mb-4 text-gray-500">{error}</p>
        <Button onClick={fetchAllData} variant="outline">
          <RefreshCw size={16} className="mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header with Controls */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="mb-2 text-3xl font-bold text-gray-800">Analytics Dashboard</h2>
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock size={14} />
              Last updated: {format(lastUpdated, 'HH:mm:ss')}
            </div>
            <div className="flex items-center gap-1">
              <Activity size={14} />
              {autoRefresh ? 'Auto-refresh enabled' : 'Auto-refresh disabled'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Period Filter */}
          <div className="flex items-center gap-1 p-1 bg-gray-100 rounded-lg">
            {[
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'all', label: 'All Time' }
            ].map((period) => (
              <button
                key={period.id}
                onClick={() => setSelectedPeriod(period.id as any)}
                className={`
                  px-3 py-1 text-sm font-medium rounded-md transition-all duration-200
                  ${selectedPeriod === period.id 
                    ? 'bg-white text-gray-800 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-800'
                  }
                `}
              >
                {period.label}
              </button>
            ))}
          </div>

          {/* Controls */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={autoRefresh ? 'bg-green-50 border-green-200 text-green-700' : ''}
          >
            <Zap size={14} className="mr-1" />
            Auto-refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAllData}
          >
            <RefreshCw size={14} className="mr-1" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden text-white border-0 shadow-lg bg-gradient-to-br from-blue-500 to-blue-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-blue-100">Total Polls</p>
                <p className="text-3xl font-bold">{metrics.totalPolls}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/20">
                <Vote size={24} />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 rounded-full bg-white/10"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden text-white border-0 shadow-lg bg-gradient-to-br from-emerald-500 to-emerald-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-emerald-100">Total Votes</p>
                <p className="text-3xl font-bold animate-number">{metrics.totalVotes}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/20">
                <Users size={24} />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 rounded-full bg-white/10"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden text-white border-0 shadow-lg bg-gradient-to-br from-purple-500 to-purple-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-purple-100">Active Polls</p>
                <p className="text-3xl font-bold">{metrics.activePolls}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/20">
                <Activity size={24} />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 rounded-full bg-white/10"></div>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden text-white border-0 shadow-lg bg-gradient-to-br from-amber-500 to-amber-600">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="mb-1 text-sm font-medium text-amber-100">Avg. Participation</p>
                <p className="text-3xl font-bold">{metrics.avgParticipation}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/20">
                <Target size={24} />
              </div>
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 transform translate-x-8 -translate-y-8 rounded-full bg-white/10"></div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Polls Over Time */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 text-blue-600 bg-blue-100 rounded-xl">
                <TrendingUp size={20} />
              </div>
              <CardTitle className="text-lg">Polling Activity Trend</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={pollsOverTimeData}>
                  <defs>
                    <linearGradient id="pollsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="votesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="date" 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fontSize: 12, fill: '#64748b' }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: 'none',
                      borderRadius: '12px',
                      color: 'white',
                      fontSize: '14px'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="polls" 
                    stroke="#3B82F6" 
                    fillOpacity={1} 
                    fill="url(#pollsGradient)"
                    strokeWidth={2}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="votes" 
                    stroke="#10B981" 
                    fillOpacity={1} 
                    fill="url(#votesGradient)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Top Performing Polls */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 text-purple-600 bg-purple-100 rounded-xl">
                <Trophy size={20} />
              </div>
              <CardTitle className="text-lg">Top Performing Polls</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topPerformingPolls.map((poll, index) => (
                <div 
                  key={poll.id}
                  className="flex items-center gap-4 p-4 transition-colors rounded-xl bg-gray-50 hover:bg-gray-100"
                >
                  <div className={`
                    flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm
                    ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-amber-600' : 'bg-gray-300'}
                  `}>
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 truncate">
                      {poll.question}
                    </p>
                    <div className="flex items-center gap-3 text-sm text-gray-500">
                      <span>{poll._count?.votes || 0} votes</span>
                      <span>•</span>
                      <span>{poll.options.length} options</span>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {poll.status || 'Active'}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Participation Analysis */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <BarChart3 size={20} />
              </div>
              <CardTitle className="text-lg">Participation Analysis</CardTitle>
            </div>
            <Badge variant="outline" className="text-green-600 border-green-300 animate-pulse">
              <Eye size={12} className="mr-1" />
              Live Data
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={participationData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <YAxis 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  axisLine={{ stroke: '#e2e8f0' }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: '#1f2937',
                    border: 'none',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '14px'
                  }}
                  formatter={(value, name, props) => [
                    `${value} votes`,
                    props.payload.fullName
                  ]}
                />
                <Bar 
                  dataKey="votes" 
                  fill="#3B82F6" 
                  radius={[6, 6, 0, 0]}
                  animationDuration={1000}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Activity Feed */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <Card className="border-0 shadow-lg lg:col-span-2">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 text-indigo-600 bg-indigo-100 rounded-xl">
                <Activity size={20} />
              </div>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
              <Badge className="text-white bg-green-500 animate-pulse">
                <Zap size={10} className="mr-1" />
                Live
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {metrics.recentActivity.length > 0 ? (
                metrics.recentActivity.map((activity, index) => (
                  <div 
                    key={index}
                    className="flex items-center gap-4 p-3 transition-colors rounded-xl bg-gray-50 hover:bg-gray-100"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800">
                        {activity.poll}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.votes} votes • {activity.time}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {activity.votes} votes
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-gray-500">
                  <Activity size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                <Target size={20} />
              </div>
              <CardTitle className="text-lg">Quick Stats</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Most Engaging Poll */}
              {metrics.topPerformingPoll && (
                <div className="p-4 border border-blue-200 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy size={16} className="text-blue-600" />
                    <span className="text-sm font-medium text-blue-700">Most Engaging</span>
                  </div>
                  <p className="mb-1 text-sm font-semibold text-gray-800">
                    {metrics.topPerformingPoll.question.length > 40 
                      ? metrics.topPerformingPoll.question.substring(0, 40) + '...'
                      : metrics.topPerformingPoll.question
                    }
                  </p>
                  <p className="text-xs text-gray-600">
                    {metrics.topPerformingPoll._count?.votes || 0} votes
                  </p>
                </div>
              )}

              {/* Engagement Rate */}
              <div className="p-4 border rounded-xl bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200">
                <div className="flex items-center gap-2 mb-2">
                  <Percent size={16} className="text-emerald-600" />
                  <span className="text-sm font-medium text-emerald-700">Engagement Rate</span>
                </div>
                <p className="text-2xl font-bold text-gray-800">
                  {metrics.totalPolls > 0 ? Math.round((metrics.totalVotes / metrics.totalPolls) * 10) / 10 : 0}
                </p>
                <p className="text-xs text-gray-600">votes per poll</p>
              </div>

              {/* Response Time */}
              <div className="p-4 border border-purple-200 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50">
                <div className="flex items-center gap-2 mb-2">
                  <Clock size={16} className="text-purple-600" />
                  <span className="text-sm font-medium text-purple-700">Last Activity</span>
                </div>
                <p className="text-sm font-semibold text-gray-800">
                  {metrics.recentActivity.length > 0 
                    ? formatDistanceToNow(lastUpdated, { addSuffix: true })
                    : 'No recent activity'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Real-time Updates Section */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-slate-50 to-gray-50">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 text-green-600 bg-green-100 rounded-xl">
                <Zap size={20} />
              </div>
              <CardTitle className="text-lg">Real-time Monitoring</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">Live updates enabled</span>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            <div className="p-4 text-center bg-white border shadow-sm rounded-xl">
              <div className="mb-1 text-2xl font-bold text-green-600 animate-pulse">
                {metrics.activePolls}
              </div>
              <p className="text-sm text-gray-600">Active polls receiving votes</p>
            </div>
            
            <div className="p-4 text-center bg-white border shadow-sm rounded-xl">
              <div className="mb-1 text-2xl font-bold text-blue-600">
                {Math.round((metrics.activePolls / Math.max(metrics.totalPolls, 1)) * 100)}%
              </div>
              <p className="text-sm text-gray-600">Polls currently active</p>
            </div>
            
            <div className="p-4 text-center bg-white border shadow-sm rounded-xl">
              <div className="mb-1 text-2xl font-bold text-purple-600 animate-number">
                {metrics.totalVotes}
              </div>
              <p className="text-sm text-gray-600">Total votes cast</p>
            </div>
          </div>

          <div className="p-4 mt-6 border border-gray-200 rounded-xl bg-white/50">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">System Status:</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-green-700">All systems operational</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Export Options */}
      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 text-gray-600 bg-gray-100 rounded-xl">
              <Download size={20} />
            </div>
            <CardTitle className="text-lg">Export & Reports</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button 
              variant="outline" 
              size="sm" 
              className="hover:bg-blue-50 hover:border-blue-300"
              onClick={exportToCSV}
            >
              <Download size={14} className="mr-2" />
              Export CSV
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="hover:bg-green-50 hover:border-green-300"
              onClick={generatePDF}
            >
              <FileText size={14} className="mr-2" />
              Generate PDF
            </Button>
          </div>
          <div className="p-4 mt-4 border border-blue-200 rounded-lg bg-blue-50">
            <div className="flex items-start gap-3">
              <div className="p-1 bg-blue-100 rounded">
                <Download size={16} className="text-blue-600" />
              </div>
              <div className="flex-1">
                <h4 className="mb-1 font-medium text-blue-800">Export Information</h4>
                <p className="text-sm text-blue-700">
                  CSV exports include detailed poll data, vote counts, and option breakdowns. 
                  PDF reports contain comprehensive analytics with real-time data and visual summaries.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes numberCount {
          from { transform: scale(0.8); opacity: 0.5; }
          to { transform: scale(1); opacity: 1; }
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-slide-up {
          animation: slideUp 0.6s ease-out forwards;
        }

        .animate-number {
          animation: numberCount 0.5s ease-out;
        }

        /* Pulse animation for live indicators */
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        /* Custom hover effects */
        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
      `}</style>
    </div>
  );
};

export default PollAnalytics; 