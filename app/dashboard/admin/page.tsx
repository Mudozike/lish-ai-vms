export const dynamic = 'force-dynamic';
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

const PIE_COLORS = ['#3b82f6', '#6366f1', '#8b5cf6', '#d946ef', '#0ea5e9'];

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
      
      const dashboardRes = await fetch('/api/admin/dashboard');
      if (!dashboardRes.ok) {
        throw new Error(`Server returned status ${dashboardRes.status}`);
      }
      const dashboardData = await dashboardRes.json();
      
      if (dashboardData.success) {
        setStats(dashboardData.stats || {
          totalVisitorsToday: 0,
          currentlyOnSite: 0,
          pendingApprovals: 0,
          checkedInToday: 0,
        });
        setDepartmentData(dashboardData.departmentData || []);
        setStatusData((dashboardData.statusData || []).filter((d: ChartData) => d.value > 0));
      } else {
        setError(dashboardData.message || 'Failed to fetch analytics.');
      }

      const logsRes = await fetch('/api/admin/logs?status=ALL');
      if (!logsRes.ok) {
        throw new Error(`Server returned status ${logsRes.status}`);
      }
      const logsData = await logsRes.json();
      if (logsData.success) {
        setRecentLogs((logsData.logs || []).slice(0, 5));
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
      color: 'text-blue-600 bg-blue-50 border-blue-100',
    },
    {
      icon: <CheckCircle2 className="w-6 h-6" />,
      label: 'Currently On-Site',
      value: stats.currentlyOnSite,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    },
    {
      icon: <Clock className="w-6 h-6" />,
      label: 'Pending Approvals',
      value: stats.pendingApprovals,
      color: 'text-yellow-600 bg-yellow-50 border-yellow-100',
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      label: 'Checked In Today',
      value: stats.checkedInToday,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
    },
  ];

  if (loading) {
    return (
      <div className="p-8 min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
        <p className="text-slate-500 text-sm font-medium">Loading admin analytics panel...</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">System Analytics</h1>
          <p className="text-slate-555 mt-1 font-semibold">Review operational metrics, logs, and facility traffic</p>
        </div>
        <Button 
          variant="primary" 
          onClick={handleExportCSV}
          disabled={exportLoading}
          className="bg-indigo-600 hover:bg-indigo-700 border-none rounded-xl"
        >
          <FileSpreadsheet className="w-4 h-4 mr-2" />
          {exportLoading ? 'Exporting...' : 'Export Logs CSV'}
        </Button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.label} className="bg-white border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl border ${stat.color}`}>
                  {stat.icon}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{stat.label}</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{stat.value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Visitors per Department */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-slate-900 font-extrabold flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" /> Traffic per Department
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">Total accumulated visits mapped to host divisions</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full">
              {departmentData.length === 0 ? (
                <div className="h-full flex items-center justify-center text-slate-400 font-medium">
                  No department data recorded yet.
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={11} fontWeight={600} />
                    <YAxis stroke="#64748b" fontSize={11} fontWeight={600} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                      labelStyle={{ color: '#0f172a', fontWeight: 'bold' }}
                    />
                    <Bar dataKey="value" fill="url(#barGradient)" radius={[6, 6, 0, 0]}>
                      <defs>
                        <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#4f46e5" />
                          <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.4} />
                        </linearGradient>
                      </defs>
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Visit Status Distribution */}
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50">
            <CardTitle className="text-slate-900 font-extrabold flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-650" /> Badge State Distribution
            </CardTitle>
            <CardDescription className="text-slate-500 font-medium">Percentage distribution of visitor access statuses</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px] w-full flex items-center justify-center">
              {statusData.length === 0 ? (
                <p className="text-slate-450 text-sm font-semibold">No activity recorded to represent.</p>
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
                      contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Logs Table */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-slate-900 font-extrabold">Recent Visitor Activity</CardTitle>
          <CardDescription className="text-slate-500 font-medium">Latest entries at Lish AI campus</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-indigo-755 uppercase tracking-wider bg-slate-50/80">
                  <th className="px-6 py-4">Visitor</th>
                  <th className="px-6 py-4">Host Staff</th>
                  <th className="px-6 py-4">Purpose</th>
                  <th className="px-6 py-4">Check-In</th>
                  <th className="px-6 py-4">Check-Out</th>
                  <th className="px-6 py-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-150">
                {recentLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-slate-450 font-bold">
                      No logs available.
                    </td>
                  </tr>
                ) : (
                  recentLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors duration-150">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900">
                            {log.visitor.firstName} {log.visitor.lastName}
                          </p>
                          <p className="text-xs text-slate-450 mt-1 font-medium">{log.visitor.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-slate-800 font-bold">{log.host.name}</p>
                        <p className="text-xs text-slate-450 font-semibold">{log.host.department}</p>
                      </td>
                      <td className="px-6 py-4 text-slate-650 font-medium">{log.purpose}</td>
                      <td className="px-6 py-4 text-slate-650 font-medium">
                        {log.actualCheckIn
                          ? format(new Date(log.actualCheckIn), 'MMM dd, hh:mm a')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-slate-650 font-medium">
                        {log.actualCheckOut
                          ? format(new Date(log.actualCheckOut), 'MMM dd, hh:mm a')
                          : '-'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-xl text-[10px] font-bold uppercase border ${
                            log.status === 'CHECKED_IN'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                              : log.status === 'CHECKED_OUT'
                              ? 'bg-slate-100 border-slate-200 text-slate-600'
                              : 'bg-yellow-50 border-yellow-250 text-yellow-800'
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

