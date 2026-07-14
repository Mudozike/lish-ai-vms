'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/app/components/Card';

import { AlertCircle, Clock, MapPin, User, ShieldCheck, Camera, XCircle, Search, Keyboard } from 'lucide-react';
import { useToast } from '@/app/components/Toast';

// Import QRScanner dynamically to avoid SSR issues
const QRScanner = dynamic(() => import('@/app/components/QRScanner').then((mod) => ({ default: mod.QRScanner })), {
  ssr: false,
  loading: () => <div className="text-center py-12 text-slate-500 font-medium">Initializing scanner modules...</div>,
});

interface VisitDetails {
  id: string;
  visitor: {
    firstName: string;
    lastName: string;
    email: string;
    photoUrl?: string;
    visitorType: string;
    company?: string;
    isBlacklisted: boolean;
  };
  host: {
    name: string;
    department: string;
  };
  purpose: string;
  expectedArrival: string;
  status: string;
  allowedZone: string;
}

export default function SecurityDashboard() {
  const toast = useToast();
  const [scannedData, setScannedData] = useState<VisitDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [showScanner, setShowScanner] = useState(true);
  const [recentScans, setRecentScans] = useState<VisitDetails[]>([]);
  const [manualId, setManualId] = useState('');

  const handleQRScan = async (data: string) => {
    if (!data || data.trim() === '') {
      toast.error('Please enter a valid Visit ID');
      return;
    }
    if (loading || actionLoading) return;
    
    try {
      setLoading(true);
      setError('');
      
      const visitId = data.split(':')[0].trim();
      
      const res = await fetch(`/api/security/visit/${visitId}`);
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const result = await res.json();
      
      if (result.success) {
        setScannedData(result.visit);
        setShowScanner(false);
        setManualId('');
        toast.info('Badge record fetched! Verifying credentials...');
        
        // Add to recent scans list (prevent duplicates)
        setRecentScans((prev) => {
          const filtered = prev.filter((v) => v.id !== result.visit.id);
          return [result.visit, ...filtered].slice(0, 5);
        });
      } else {
        setError(result.message || 'Invalid or unregistered visitor QR badge.');
        toast.error(result.message || 'Verification failed');
      }
    } catch (err) {
      setError('Error communicating with verification APIs.');
      toast.error('Scan error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async () => {
    if (!scannedData) return;
    
    try {
      setActionLoading(true);
      const res = await fetch(`/api/security/visit/${scannedData.id}/check-in`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const result = await res.json();
      
      if (result.success) {
        toast.success(`${scannedData.visitor.firstName} checked in successfully!`);
        setScannedData(null);
        setShowScanner(true);
      } else {
        setError(result.message || 'Failed to complete check-in.');
        toast.error(result.message || 'Check-in failed');
      }
    } catch (err) {
      setError('Error completing visitor check-in.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!scannedData) return;
    
    try {
      setActionLoading(true);
      const res = await fetch(`/api/security/visit/${scannedData.id}/check-out`, {
        method: 'POST',
      });
      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }
      const result = await res.json();
      
      if (result.success) {
        toast.success(`${scannedData.visitor.firstName} checked out successfully.`);
        setScannedData(null);
        setShowScanner(true);
      } else {
        setError(result.message || 'Failed to complete check-out.');
        toast.error(result.message || 'Check-out failed');
      }
    } catch (err) {
      setError('Error completing visitor check-out.');
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleReset = () => {
    setScannedData(null);
    setShowScanner(true);
    setError('');
    setManualId('');
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-slate-50 text-slate-800">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Security Desk Portal</h1>
        <p className="text-slate-555 mt-1 font-semibold">Scan digital QR codes or enter Visit IDs to manage campus access</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 text-red-800">
          <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
          <span className="text-sm font-semibold">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scanner Panel */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border-slate-200 overflow-hidden shadow-sm">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900 font-extrabold">QR Code Scanner</CardTitle>
                  <CardDescription className="text-slate-500 font-medium">
                    {showScanner ? 'Position the visitor digital badge inside the camera frame' : 'Verifying details'}
                  </CardDescription>
                </div>
                {showScanner && (
                  <span className="flex items-center gap-1.5 text-xs text-indigo-700 font-bold uppercase tracking-wider bg-indigo-50 px-2.5 py-1 rounded-full border border-indigo-100">
                    <Camera className="w-3.5 h-3.5 text-indigo-650" /> Camera Active
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {showScanner ? (
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-slate-100">
                  <QRScanner onScan={handleQRScan} />
                </div>
              ) : scannedData ? (
                <div className="space-y-6">
                  {/* Warning for blacklisted visitor */}
                  {scannedData.visitor.isBlacklisted && (
                    <div className="p-4 bg-red-50 border border-red-200 text-red-800 rounded-2xl flex items-center gap-3 text-sm font-bold shadow-sm animate-pulse">
                      <XCircle className="w-5 h-5 text-red-650 shrink-0" />
                      ALERT: Visitor is currently BLACKLISTED. Deny access immediately.
                    </div>
                  )}

                  {/* Visitor Info Card */}
                  <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-100 rounded-bl-xl border-l border-b border-slate-200">
                      Visitor Info
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="h-16 w-16 rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shadow-inner">
                        <User className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold text-slate-900">
                          {scannedData.visitor.firstName} {scannedData.visitor.lastName}
                        </h3>
                        <p className="text-sm text-slate-500 font-medium mt-0.5">{scannedData.visitor.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-100 text-indigo-700 px-2 py-0.5 rounded">
                            {scannedData.visitor.visitorType}
                          </span>
                          {scannedData.visitor.company && (
                            <span className="text-xs text-slate-500 font-semibold">
                              representing <strong className="text-slate-700">{scannedData.visitor.company}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visit Details Card */}
                  <div className="p-6 bg-indigo-50/30 border border-indigo-100 rounded-2xl relative">
                    <div className="absolute top-0 right-0 p-3 text-[10px] font-bold uppercase tracking-widest text-indigo-750 bg-indigo-50 rounded-bl-xl border-l border-b border-indigo-100">
                      Visit Details
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Host Escort</p>
                        <p className="font-bold text-slate-900 mt-1">{scannedData.host.name}</p>
                        <p className="text-xs text-slate-550 font-medium mt-0.5">{scannedData.host.department} Department</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Purpose of visit</p>
                        <p className="font-semibold text-slate-800 mt-1">{scannedData.purpose}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Expected Time</p>
                        <p className="font-bold text-slate-800 mt-1">
                          {format(new Date(scannedData.expectedArrival), 'MMM dd, yyyy - hh:mm a')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-600 tracking-wider">Authorized Zone</p>
                        <div className="flex items-center gap-1.5 text-emerald-650 font-bold mt-1">
                          <MapPin className="w-4 h-4 text-emerald-500" />
                          <span>{scannedData.allowedZone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Grid */}
                  <div className="grid sm:grid-cols-[1fr_2fr] gap-4 items-center border-t border-slate-100 pt-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-center shadow-inner">
                      <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Visit Status</p>
                      <p className="text-xl font-extrabold text-slate-900 mt-1">{scannedData.status}</p>
                    </div>

                    <div className="flex gap-2.5">
                      {scannedData.status === 'APPROVED' && !scannedData.visitor.isBlacklisted && (
                        <button
                          className="flex-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                          onClick={handleCheckIn}
                          disabled={actionLoading}
                        >
                          ✓ Grant Check-In
                        </button>
                      )}
                      {scannedData.status === 'CHECKED_IN' && (
                        <button
                          className="flex-1 rounded-xl bg-indigo-600 hover:bg-indigo-700 py-3 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                          onClick={handleCheckOut}
                          disabled={actionLoading}
                        >
                          ✓ Process Check-Out
                        </button>
                      )}
                      <button
                        className="rounded-xl border border-slate-200 bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-650 px-5 py-3 text-sm font-bold shadow-sm transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                        onClick={handleReset}
                      >
                        Reset Portal
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          {/* Fallback Manual Verification Card */}
          {showScanner && (
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="border-b border-slate-100 bg-slate-50/50 py-4">
                <CardTitle className="text-slate-900 font-extrabold text-base flex items-center gap-2">
                  <Keyboard className="w-4 h-4 text-indigo-650" /> Fallback Manual Entry
                </CardTitle>
                <CardDescription className="text-slate-500 font-medium text-xs">
                  If the camera is unavailable or the QR badge is unreadable, verify details manually using the Visit CUID.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleQRScan(manualId);
                  }}
                  className="flex flex-col sm:flex-row gap-3"
                >
                  <div className="relative flex-1">
                    <input
                      type="text"
                      placeholder="Enter Visit ID (e.g. cm5x...)"
                      value={manualId}
                      onChange={(e) => setManualId(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-250 bg-slate-50 text-sm text-slate-805 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20"
                    />
                    <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !manualId.trim()}
                    className="rounded-xl bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:translate-y-0 px-6 py-2.5 text-sm font-bold text-white shadow-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {loading ? 'Searching...' : 'Verify Visit'}
                  </button>
                </form>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar Activity */}
        <div>
          <Card className="bg-white border-slate-200 shadow-sm h-full">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50">
              <CardTitle className="text-slate-900 font-extrabold flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-600" /> Recent Scans
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {recentScans.length === 0 ? (
                <div className="text-center py-20 text-slate-400 font-medium">
                  <ShieldCheck className="w-10 h-10 text-slate-250 mx-auto mb-3" />
                  <p className="text-xs">No scan logs in this session.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentScans.map((scan, i) => (
                    <div
                      key={scan.id + '-' + i}
                      className="p-4 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between gap-3 shadow-inner"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-800">
                          {scan.visitor.firstName} {scan.visitor.lastName}
                        </p>
                        <p className="text-[10px] text-slate-450 font-semibold mt-0.5">Host: {scan.host.name}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        scan.status === 'CHECKED_IN'
                          ? 'bg-indigo-50 border-indigo-200 text-indigo-700'
                          : scan.status === 'CHECKED_OUT'
                          ? 'bg-slate-205 border-slate-300 text-slate-705'
                          : 'bg-emerald-50 border-emerald-200 text-emerald-700'
                      }`}>
                        {scan.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
