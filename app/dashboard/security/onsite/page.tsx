'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardContent, CardTitle } from '@/app/components/Card';
import { AlertCircle, Users, Clock, ShieldCheck, Mail, MapPin } from 'lucide-react';

interface OnSiteVisitor {
  id: string;
  visitor: {
    firstName: string;
    lastName: string;
    email: string;
    visitorType: string;
  };
  host: {
    name: string;
    department: string;
  };
  purpose: string;
  actualCheckIn: string;
  allowedZone: string;
}

export default function OnSiteVisitors() {
  const [visitors, setVisitors] = useState<OnSiteVisitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOnSiteVisitors();
    const interval = setInterval(fetchOnSiteVisitors, 20000); // refresh every 20s
    return () => clearInterval(interval);
  }, []);

  const fetchOnSiteVisitors = async () => {
    try {
      const res = await fetch('/api/security/onsite');
      const data = await res.json();
      if (data.success) {
        setVisitors(data.visitors);
      } else {
        setError(data.message || 'Failed to fetch on-site visitors');
      }
    } catch (err) {
      console.error(err);
      setError('Error fetching on-site visitors');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Active On-Site Visitors</h1>
        <p className="text-slate-400 mt-1">Real-time listing of guest badges currently checked into Lish AI Labs</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-950/60 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Stats Summary */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-slate-900/50 border-white/10 hover:border-indigo-500/30 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Present On-Site</p>
                <p className="text-3xl font-bold text-white mt-1">{visitors.length} Visitors</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10 hover:border-emerald-500/30 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Last System Sync</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {format(new Date(), 'hh:mm:ss a')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Visitors Table */}
      <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl">
        <CardHeader className="border-b border-white/5 bg-slate-900/20">
          <CardTitle className="text-white">Active Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
              <p className="text-slate-400 text-sm">Loading active visits...</p>
            </div>
          ) : visitors.length === 0 ? (
            <div className="text-center py-16 text-slate-500 flex flex-col items-center justify-center gap-2">
              <ShieldCheck className="w-12 h-12 text-slate-600" />
              <p className="font-semibold text-slate-400">Campus is secure</p>
              <p className="text-xs text-slate-500">There are no external guests currently checked in.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    <th className="px-4 py-3">Visitor Name</th>
                    <th className="px-4 py-3">Category</th>
                    <th className="px-4 py-3">Host Escort</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Checked-In</th>
                    <th className="px-4 py-3">Zone Permission</th>
                    <th className="px-4 py-3 text-right">Time On-Site</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {visitors.map((v) => {
                    const checkInTime = new Date(v.actualCheckIn);
                    const durationMin = Math.max(0, Math.floor(
                      (new Date().getTime() - checkInTime.getTime()) / (1000 * 60)
                    ));
                    const durationHours = Math.floor(durationMin / 60);
                    const remMin = durationMin % 60;
                    
                    return (
                      <tr
                        key={v.id}
                        className="hover:bg-white/[0.02] transition-colors duration-150"
                      >
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-semibold text-white">
                              {v.visitor.firstName} {v.visitor.lastName}
                            </p>
                            <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                              <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                              <span>{v.visitor.email}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded">
                            {v.visitor.visitorType}
                          </span>
                        </td>
                        <td className="px-4 py-4">
                          <div>
                            <p className="font-medium text-white">{v.host.name}</p>
                            <p className="text-slate-500 text-xs mt-0.5">{v.host.department}</p>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-slate-300 max-w-xs truncate">
                          {v.purpose}
                        </td>
                        <td className="px-4 py-4 text-slate-300">
                          {format(checkInTime, 'hh:mm a')}
                        </td>
                        <td className="px-4 py-4">
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-xs font-semibold">
                            <MapPin className="w-3.5 h-3.5 shrink-0" />
                            {v.allowedZone}
                          </span>
                        </td>
                        <td className="px-4 py-4 text-right font-mono text-xs font-bold text-indigo-300">
                          {durationHours > 0 ? `${durationHours}h ` : ''}{remMin}m
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
