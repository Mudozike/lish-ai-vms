'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { AlertCircle, AlertTriangle, Mail, User, Clock, FileSpreadsheet } from 'lucide-react';
import { useToast } from '@/app/components/Toast';

interface VisitLog {
  id: string;
  visitor: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isBlacklisted: boolean;
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
  notes?: string;
}

export default function AdminLogs() {
  const toast = useToast();
  const [logs, setLogs] = useState<VisitLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [error, setError] = useState('');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'CHECKED_IN' | 'CHECKED_OUT' | 'PENDING'>('ALL');

  useEffect(() => {
    fetchLogs();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterStatus]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/admin/logs?status=${filterStatus}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.logs);
      } else {
        setError(data.message || 'Failed to fetch logs.');
      }
    } catch (err) {
      setError('Error communicating with logs database.');
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
      toast.success('Spreadsheet file downloaded successfully.');
    } catch (err) {
      toast.error('Failed to export logs.');
      console.error('Error exporting CSV:', err);
    } finally {
      setExportLoading(false);
    }
  };

  const handleAddToBlacklist = async (visitorId: string, visitorName: string) => {
    const reason = prompt(`Add "${visitorName}" to blacklist. Please enter the reason:`);
    if (reason === null) return; // Cancelled
    if (reason.trim() === '') {
      toast.error('A reason is required to blacklist a visitor.');
      return;
    }

    try {
      const res = await fetch(`/api/admin/blacklist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ visitorId, reason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Visitor "${visitorName}" has been blacklisted.`);
        await fetchLogs();
      } else {
        toast.error(data.message || 'Failed to blacklist visitor.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error blacklisting visitor.');
    }
  };

  const handleRemoveFromBlacklist = async (visitorId: string, visitorName: string) => {
    if (!confirm(`Are you sure you want to remove "${visitorName}" from the blacklist?`)) return;

    try {
      const res = await fetch(`/api/admin/blacklist/${visitorId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Visitor "${visitorName}" removed from blacklist.`);
        await fetchLogs();
      } else {
        toast.error(data.message || 'Failed to remove from blacklist.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Error removing from blacklist.');
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Visitor Logs</h1>
          <p className="text-slate-400 mt-1">Audit visitor records, trace arrivals, and manage access restrictions</p>
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

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2 p-1 bg-slate-900/80 border border-white/10 rounded-xl w-fit">
        {(['ALL', 'CHECKED_IN', 'CHECKED_OUT', 'PENDING'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-lg transition-all duration-200 ${
              filterStatus === status
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {status === 'CHECKED_IN' && 'On-Site'}
            {status === 'CHECKED_OUT' && 'Checked Out'}
            {status === 'PENDING' && 'Pending'}
            {status === 'ALL' && 'All Logs'}
          </button>
        ))}
      </div>

      {/* Logs Table */}
      <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">Access Logs</CardTitle>
          <CardDescription className="text-slate-400">Complete historical index of visitor entries</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
              <p className="text-slate-400 text-sm">Querying visit history...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              <Clock className="w-12 h-12 text-slate-650 mx-auto mb-2" />
              <p className="font-semibold text-slate-400">No logs found</p>
              <p className="text-xs text-slate-500">Try modifying your category filter.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    <th className="px-4 py-3">Visitor Name</th>
                    <th className="px-4 py-3">Host Staff</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Check-In</th>
                    <th className="px-4 py-3">Check-Out</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Block Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {logs.map((log) => {
                    const fullName = `${log.visitor.firstName} ${log.visitor.lastName}`;
                    return (
                      <tr
                        key={log.id}
                        className={`hover:bg-white/[0.01] transition-colors duration-150 ${
                          log.visitor.isBlacklisted ? 'bg-red-950/20' : ''
                        }`}
                      >
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            {log.visitor.isBlacklisted ? (
                              <div className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400">
                                <AlertTriangle className="w-4 h-4 shrink-0" />
                              </div>
                            ) : (
                              <div className="p-2 rounded-xl bg-indigo-500/5 border border-white/5 text-indigo-400">
                                <User className="w-4 h-4 shrink-0" />
                              </div>
                            )}
                            <div>
                              <p className="font-semibold text-white">{fullName}</p>
                              <div className="flex items-center gap-1 text-slate-450 text-xs mt-0.5">
                                <Mail className="w-3 h-3 text-indigo-400" />
                                <span>{log.visitor.email}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <p className="font-medium text-white">{log.host.name}</p>
                          <p className="text-slate-500 text-xs mt-0.5">{log.host.department}</p>
                        </td>
                        <td className="px-4 py-4 text-slate-300 max-w-xs truncate">{log.purpose}</td>
                        <td className="px-4 py-4 text-slate-350">
                          {log.actualCheckIn
                            ? format(new Date(log.actualCheckIn), 'MMM dd, hh:mm a')
                            : '-'}
                        </td>
                        <td className="px-4 py-4 text-slate-350">
                          {log.actualCheckOut
                            ? format(new Date(log.actualCheckOut), 'MMM dd, hh:mm a')
                            : '-'}
                        </td>
                        <td className="px-4 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                              log.status === 'CHECKED_IN'
                                ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                                : log.status === 'CHECKED_OUT'
                                ? 'bg-slate-800 border-white/10 text-slate-400'
                                : log.status === 'APPROVED'
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right">
                          {!log.visitor.isBlacklisted ? (
                            <button
                              onClick={() => handleAddToBlacklist(log.visitor.id, fullName)}
                              className="text-red-400 hover:text-red-300 hover:underline font-semibold text-xs transition-colors"
                            >
                              Blacklist
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRemoveFromBlacklist(log.visitor.id, fullName)}
                              className="text-emerald-400 hover:text-emerald-300 hover:underline font-semibold text-xs transition-colors"
                            >
                              Restore Access
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
