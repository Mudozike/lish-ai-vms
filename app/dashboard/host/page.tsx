'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { AlertCircle, CheckCircle2, XCircle, Clock, Users, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { useToast } from '@/app/components/Toast';

interface Visit {
  id: string;
  visitorId: string;
  visitor: {
    firstName: string;
    lastName: string;
    email: string;
    company?: string;
    visitorType: string;
  };
  purpose: string;
  expectedArrival: string;
  status: string;
  notes?: string;
}

export default function HostDashboard() {
  const toast = useToast();
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'ALL'>('PENDING');

  useEffect(() => {
    fetchVisits();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/host/visits?status=${filter}`);
      const data = await res.json();
      if (data.success) {
        setVisits(data.visits);
      } else {
        setError(data.message || 'Failed to fetch visits');
      }
    } catch (err) {
      setError('Error fetching visits');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (visitId: string) => {
    try {
      setActionLoading(visitId);
      const res = await fetch(`/api/host/visits/${visitId}/approve`, {
        method: 'POST',
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Visit request approved! Visitor has been notified by email.');
        await fetchVisits();
      } else {
        toast.error(data.message || 'Failed to approve visit');
      }
    } catch (err) {
      toast.error('Error approving visit');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (visitId: string) => {
    const reason = prompt('Please enter the rejection reason:');
    if (reason === null) return; // Cancelled
    if (reason.trim() === '') {
      toast.error('Rejection reason is required.');
      return;
    }

    try {
      setActionLoading(visitId);
      const res = await fetch(`/api/host/visits/${visitId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Visit request rejected and visitor has been notified.');
        await fetchVisits();
      } else {
        toast.error(data.message || 'Failed to reject visit');
      }
    } catch (err) {
      toast.error('Error rejecting visit');
      console.error(err);
    } finally {
      setActionLoading(null);
    }
  };

  const pendingCount = visits.filter((v) => v.status === 'PENDING').length;
  const approvedCount = visits.filter((v) => v.status === 'APPROVED').length;
  const checkedInCount = visits.filter((v) => v.status === 'CHECKED_IN').length;

  return (
    <div className="p-6 md:p-8 min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Host Dashboard</h1>
          <p className="text-slate-400 mt-1">Review visitor access requests and coordinate lab schedules</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-slate-900/50 border-white/10 hover:border-yellow-500/30 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-500/10 text-yellow-400 border border-yellow-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
                <p className="text-3xl font-bold text-white mt-1">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10 hover:border-emerald-500/30 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Approved Visits</p>
                <p className="text-3xl font-bold text-white mt-1">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-slate-900/50 border-white/10 hover:border-indigo-500/30 transition-all duration-300">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">On-Site Visitors</p>
                <p className="text-3xl font-bold text-white mt-1">{checkedInCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-950/60 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-200">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 p-1 bg-slate-900/80 border border-white/10 rounded-xl w-fit">
        {(['PENDING', 'APPROVED', 'ALL'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-semibold tracking-wider uppercase rounded-lg transition-all duration-200 ${
              filter === f
                ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            {f === 'PENDING' && 'Pending'}
            {f === 'APPROVED' && 'Approved'}
            {f === 'ALL' && 'All Requests'}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl">
        <CardHeader>
          <CardTitle className="text-white">
            {filter === 'PENDING' && 'Pending Access Requests'}
            {filter === 'APPROVED' && 'Approved Visits Schedule'}
            {filter === 'ALL' && 'Visitor History'}
          </CardTitle>
          <CardDescription className="text-slate-400">
            {filter === 'PENDING' ? 'Action required on these arrivals.' : 'Review guest detail records.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
              <p className="text-slate-400 text-sm">Loading visits database...</p>
            </div>
          ) : visits.length === 0 ? (
            <div className="text-center py-16 text-slate-500 flex flex-col items-center justify-center gap-2">
              <ShieldCheck className="w-12 h-12 text-slate-600" />
              <p className="font-semibold text-slate-400">No requests found</p>
              <p className="text-xs text-slate-500">There are no visits listed under this category.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-white/10 text-xs font-bold text-indigo-300 uppercase tracking-wider">
                    <th className="px-4 py-3">Visitor Info</th>
                    <th className="px-4 py-3">Organization</th>
                    <th className="px-4 py-3">Purpose</th>
                    <th className="px-4 py-3">Arrival Schedule</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {visits.map((visit) => (
                    <tr
                      key={visit.id}
                      className="hover:bg-white/[0.02] transition-colors duration-150"
                    >
                      <td className="px-4 py-4">
                        <div>
                          <p className="font-semibold text-white">
                            {visit.visitor.firstName} {visit.visitor.lastName}
                          </p>
                          <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                            <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                            <span>{visit.visitor.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-slate-300 font-medium">
                        {visit.visitor.company || 'Private Individual'}
                      </td>
                      <td className="px-4 py-4 text-slate-300 max-w-xs truncate">
                        {visit.purpose}
                      </td>
                      <td className="px-4 py-4">
                        <div>
                          <p className="text-slate-200 font-medium">
                            {format(new Date(visit.expectedArrival), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-slate-400 text-xs mt-0.5">
                            {format(new Date(visit.expectedArrival), 'hh:mm a')}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${
                            visit.status === 'PENDING'
                              ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400'
                              : visit.status === 'APPROVED'
                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                              : visit.status === 'CHECKED_IN'
                              ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                              : 'bg-slate-800 border-white/10 text-slate-400'
                          }`}
                        >
                          {visit.status}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        {visit.status === 'PENDING' && (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="primary"
                              className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                              onClick={() => handleApprove(visit.id)}
                              disabled={actionLoading === visit.id}
                            >
                              Approve
                            </Button>
                            <Button
                              size="sm"
                              variant="danger"
                              className="bg-red-650 hover:bg-red-700 text-xs"
                              onClick={() => handleReject(visit.id)}
                              disabled={actionLoading === visit.id}
                            >
                              Reject
                            </Button>
                          </div>
                        )}
                        {visit.status === 'APPROVED' && (
                          <span className="text-xs font-medium text-emerald-400 flex items-center justify-end gap-1.5">
                            <CheckCircle2 className="w-4 h-4" /> Ready for check-in
                          </span>
                        )}
                        {visit.status === 'CHECKED_IN' && (
                          <span className="text-xs font-medium text-indigo-400 flex items-center justify-end gap-1.5">
                            <MapPin className="w-4 h-4" /> Active on-site
                          </span>
                        )}
                        {visit.status === 'CHECKED_OUT' && (
                          <span className="text-xs font-medium text-slate-500">
                            Visit concluded
                          </span>
                        )}
                        {visit.status === 'REJECTED' && (
                          <span className="text-xs font-medium text-red-400 flex items-center justify-end gap-1.5">
                            <XCircle className="w-4 h-4" /> Rejected
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
