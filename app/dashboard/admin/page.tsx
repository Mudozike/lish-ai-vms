'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import {
  AlertCircle,
  Users,
  CheckCircle2,
  Clock,
  BarChart3,
  TrendingUp,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';
import { useToast } from '@/app/components/Toast';

interface StatCard {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}

interface ChartData {
  name: string;
  value: number;
}

interface RecentLog {
  id: string;
  visitor: {
    firstName: string;
    lastName: string;
    email: string;
  };
  host: {
    name: string;
    department: string;
  };
  purpose: string;
  expectedArrival: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  status: string;
}

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#a855f7'];

export default function AdminDashboard() {
  const toast = useToast();
  const [stats, setStats] = useState({
    totalVisitorsToday: 0,
    currentlyOnSite: 0,
    pendingApprovals: 0,
    checkedInToday: 0,
  });
  const [departmentData, setDepartmentData] = useState<ChartData[]>([]);
  const [statusData, setStatusData] = useState<ChartData[]>([]);
  const [recentLogs, setRecentLogs] = useState<RecentLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch stats & chart datasets
      const dashboardRes = await fetch('/api/admin/dashboard');
      const dashboardData = await dashboardRes.json();
      
      if (dashboardData.success) {
        setStats(dashboardData.stats);
        setDepartmentData(dashboardData.departmentData);
        setStatusData(dashboardData.statusData.filter((d: ChartData) => d.value > 0)); // filter empty statuses
      } else {
        setError(dashboardData.message || 'Failed to fetch analytics.');
      }

      // Fetch top 5 logs
      const logsRes = await fetch('/api/admin/logs?status=ALL');
      const logsData = await logsRes.json();
      if (logsData.success) {
        setRecentLogs(logsData.logs.slice(0, 5));
      }
    } catch (err) {
      setError('Error communicating with administration database.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      setExportLoading(true);
      const res = await fetch('/api/admin/export-logs');
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lish-visitor-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Visitor logs CSV spreadsheet downloaded successfully.');
    } catch (err) {
      toast.error('Failed to export activity logs.');
      console.error('Error exporting CSV:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const statCards: StatCard[] = [
    {
      icon: <Users className="w-6 h-6" />,
      label: 'Today\'s Visitors',
      value: stats.totalVisitorsToday,
      color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20',
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      label: 'Currently On-Site',
      value: stats.currentlyOnSite,
      color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: 'Pending Approvals',
      value: stats.pendingApprovals,
      color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      label: 'Checked In Today',
      value: stats.checkedInToday,
      color: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    },
  ];

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="text-slate-400 text-sm">Loading admin analytics panel...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">System Analytics</h1>
          <p className="text-slate-400 mt-1">Review operational metrics, logs, and facility traffic</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleExportCSV}
          disabled={exportLoading}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 border-none rounded-full"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          {exportLoading ? 'Exporting...' : 'Export Logs CSV'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-950/60 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-slate-900/40 border-white/10">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Visitors per Department */}
        <Card className="bg-slate-900/40 border-white/10">
          <CardHeader className="border-b border-white/5 bg-slate-900/20">
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" /> Traffic per Department
            </CardTitle>
            <CardDescription className="text-slate-400">Total accumulated visits mapped to host divisions</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#fff', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]}>
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.4} />
                      </linearGradient>
                    </defs>
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Visit Status Distribution */}
        <Card className="bg-slate-900/40 border-white/10">
          <CardHeader className="border-b border-white/5 bg-slate-900/20">
            <CardTitle className="text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-purple-400" /> Badge State Distribution
            </CardTitle>
            <CardDescription className="text-slate-400">Percentage distribution of visitor access statuses</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full flex items-center justify-center">
              {statusData.length === 0 ? (
                <p className="text-slate-500 text-sm">No activity recorded to represent.</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={95}
                      innerRadius={45}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logs Table */}
      <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl">
        <CardHeader className="border-b border-white/5 bg-slate-900/20">
          <CardTitle className="text-white">Recent Visitor Activity</CardTitle>
          <CardDescription className="text-slate-400">Latest entries at Lish AI campus</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                  <th className="px-4 py-3">Visitor</th>
                  <th className="px-4 py-3">Host Staff</th>
                  <th className="px-4 py-3">Purpose</th>
                  <th className="px-4 py-3">Check-In</th>
                  <th className="px-4 py-3">Check-Out</th>
                  <th className="px-4 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                      No logs available.
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-white/[0.01] transition-colors duration-150">
                      <td className="px-4 py-3.5">
                        <div>
                          <p className="font-semibold text-white">
                            {log.visitor.firstName} {log.visitor.lastName}
                          </p>
                          <p className="text-xs text-slate-400 mt-0.5">{log.visitor.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <p className="text-white font-medium">{log.host.name}</p>
                        <p className="text-xs text-slate-500">{log.host.department}</p>
                      </td>
                      <td className="px-4 py-3.5 text-slate-350">{log.purpose}</td>
                      <td className="px-4 py-3.5 text-slate-350">
                        {log.actualCheckIn
                          ? format(new Date(log.actualCheckIn), 'MMM dd, hh:mm a')
                          : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-slate-355">
                        {log.actualCheckOut
                          ? format(new Date(log.actualCheckOut), 'MMM dd, hh:mm a')
                          : '-'}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                            log.status === 'CHECKED_IN'
                              ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                              : log.status === 'CHECKED_OUT'
                              ? 'bg-slate-800 border-white/10 text-slate-400'
                              : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
