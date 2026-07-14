export const dynamic = 'force-dynamic';
'use client';

import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/app/components/Card';
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
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const data = await res.json();
      if (data.success) {
        setVisits(data.visits || []);
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
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
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
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
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
    <div className="p-6 md:p-8 min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Host Dashboard</h1>
          <p className="text-slate-555 mt-1 font-semibold">Review visitor access requests and coordinate lab schedules</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-white border-slate-200 hover:border-yellow-200 transition-all duration-300 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-50 text-yellow-600 border border-yellow-100">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{pendingCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 hover:border-emerald-200 transition-all duration-300 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved Visits</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{approvedCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 hover:border-indigo-200 transition-all duration-300 shadow-sm">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-indigo-50 text-indigo-650 border border-indigo-100">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">On-Site Visitors</p>
                <p className="text-3xl font-extrabold text-slate-900 mt-1">{checkedInCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      {/* Filter tabs */}
      <div className="mb-6 flex gap-2 p-1 bg-slate-200/60 border border-slate-205 rounded-xl w-fit">
        {(['PENDING', 'APPROVED', 'ALL'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-bold tracking-wider uppercase rounded-lg transition-all duration-200 ${
              filter === f
                ? 'bg-white text-slate-900 shadow-sm border border-slate-200/30'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            {f === 'PENDING' && 'Pending'}
            {f === 'APPROVED' && 'Approved'}
            {f === 'ALL' && 'All Requests'}
          </button>
        ))}
      </div>

      {/* Table Section */}
      <Card className="bg-white border-slate-200 shadow-sm">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50">
          <CardTitle className="text-slate-900 font-extrabold">
            {filter === 'PENDING' && 'Pending Access Requests'}
            {filter === 'APPROVED' && 'Approved Visits Schedule'}
            {filter === 'ALL' && 'Visitor History'}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            {filter === 'PENDING' ? 'Action required on these arrivals.' : 'Review guest detail records.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center py-16 flex flex-col items-center justify-center gap-3">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              <p className="text-slate-500 text-sm font-medium">Loading visits database...</p>
            </div>
          ) : visits.length === 0 ? (
            <div className="text-center py-20 text-slate-400 flex flex-col items-center justify-center gap-2.5">
              <ShieldCheck className="w-12 h-12 text-slate-300" />
              <p className="font-bold text-slate-655">No requests found</p>
              <p className="text-xs text-slate-400 font-medium">There are no visits listed under this category.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-xs font-bold text-indigo-755 uppercase tracking-wider bg-slate-50/80">
                    <th className="px-6 py-4">Visitor Info</th>
                    <th className="px-6 py-4">Organization</th>
                    <th className="px-6 py-4">Purpose</th>
                    <th className="px-6 py-4">Arrival Schedule</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visits.map((visit) => (
                    <tr
                      key={visit.id}
                      className="hover:bg-slate-50/55 transition-colors duration-150"
                    >
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-bold text-slate-900">
                            {visit.visitor.firstName} {visit.visitor.lastName}
                          </p>
                          <div className="flex items-center gap-1.5 text-slate-500 text-xs mt-1 font-medium">
                            <Mail className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                            <span>{visit.visitor.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-700 font-semibold">
                        {visit.visitor.company || 'Private Individual'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-medium max-w-xs truncate">
                        {visit.purpose}
                      </td>
                      <td className="px-6 py-4">
                        <div>
                          <p className="text-slate-800 font-bold">
                            {format(new Date(visit.expectedArrival), 'MMM dd, yyyy')}
                          </p>
                          <p className="text-slate-400 text-xs mt-1 font-medium">
                            {format(new Date(visit.expectedArrival), 'hh:mm a')}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold tracking-wide border ${
                            visit.status === 'PENDING'
                              ? 'bg-yellow-50 border-yellow-250 text-yellow-800'
                              : visit.status === 'APPROVED'
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                              : visit.status === 'CHECKED_IN'
                              ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                              : 'bg-slate-100 border-slate-200 text-slate-600'
                          }`}
                        >
                          {visit.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {visit.status === 'PENDING' && (
                          <div className="flex justify-end gap-2.5">
                            <button
                              onClick={() => handleApprove(visit.id)}
                              disabled={actionLoading === visit.id}
                              className="rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-bold text-white px-4 py-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReject(visit.id)}
                              disabled={actionLoading === visit.id}
                              className="rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white px-4 py-2 shadow-sm transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                        {visit.status === 'APPROVED' && (
                          <span className="text-xs font-bold text-emerald-600 flex items-center justify-end gap-1.5">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Ready for check-in
                          </span>
                        )}
                        {visit.status === 'CHECKED_IN' && (
                          <span className="text-xs font-bold text-indigo-650 flex items-center justify-end gap-1.5">
                            <MapPin className="w-4 h-4 text-indigo-550" /> Active on-site
                          </span>
                        )}
                        {visit.status === 'CHECKED_OUT' && (
                          <span className="text-xs font-bold text-slate-450">
                            Visit concluded
                          </span>
                        )}
                        {visit.status === 'REJECTED' && (
                          <span className="text-xs font-bold text-red-600 flex items-center justify-end gap-1.5">
                            <XCircle className="w-4 h-4 text-red-500" /> Rejected
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

