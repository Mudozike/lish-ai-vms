'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import dynamic from 'next/dynamic';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { AlertCircle, Clock, MapPin, User, ShieldCheck, Camera, XCircle } from 'lucide-react';
import { useToast } from '@/app/components/Toast';

// Import QRScanner dynamically to avoid SSR issues
const QRScanner = dynamic(() => import('@/app/components/QRScanner').then((mod) => ({ default: mod.QRScanner })), {
  ssr: false,
  loading: () => <div className="text-center py-12 text-slate-400">Initializing scanner modules...</div>,
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

  const handleQRScan = async (data: string) => {
    if (loading || actionLoading) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Extract visit ID from QR code (or fallback if raw string)
      const visitId = data.split(':')[0].trim();
      
      const res = await fetch(`/api/security/visit/${visitId}`);
      const result = await res.json();
      
      if (result.success) {
        setScannedData(result.visit);
        setShowScanner(false);
        toast.info('Badge scanned! Verifying credentials...');
        
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
  };

  return (
    <div className="p-6 md:p-8 min-h-screen bg-slate-950 text-slate-100">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-white">Security Desk Portal</h1>
        <p className="text-slate-400 mt-1">Scan digital QR codes to manage check-in and check-out permissions</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-950/60 border border-red-500/30 rounded-2xl flex items-center gap-3 text-red-200 animate-pulse">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
          <span className="text-sm font-medium">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scanner Panel */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-900/40 border-white/10 overflow-hidden backdrop-blur-xl">
            <CardHeader className="border-b border-white/5 bg-slate-900/20">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-white">QR Code Scanner</CardTitle>
                  <CardDescription className="text-slate-400">
                    {showScanner ? 'Position the visitor digital badge inside the camera frame' : 'Verifying details'}
                  </CardDescription>
                </div>
                {showScanner && (
                  <span className="flex items-center gap-1.5 text-xs text-indigo-400 font-semibold uppercase tracking-wider bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                    <Camera className="w-3.5 h-3.5" /> Camera Active
                  </span>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-6">
              {showScanner ? (
                <div className="border border-white/10 rounded-2xl overflow-hidden bg-slate-950">
                  <QRScanner onScan={handleQRScan} />
                </div>
              ) : scannedData ? (
                <div className="space-y-6">
                  {/* Warning for blacklisted visitor */}
                  {scannedData.visitor.isBlacklisted && (
                    <div className="p-4 bg-red-500/15 border border-red-500/30 text-red-300 rounded-2xl flex items-center gap-3 text-sm font-bold">
                      <XCircle className="w-5 h-5 shrink-0" />
                      ALERT: Visitor is currently BLACKLISTED. Deny access immediately.
                    </div>
                  )}

                  {/* Visitor Info Card */}
                  <div className="p-6 bg-slate-900/80 border border-white/5 rounded-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-white/5 rounded-bl-xl border-l border-b border-white/5">
                      Visitor Info
                    </div>
                    <div className="flex gap-4 items-center">
                      <div className="h-16 w-16 rounded-full bg-indigo-500/10 border border-indigo-500/25 flex items-center justify-center text-indigo-400">
                        <User className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {scannedData.visitor.firstName} {scannedData.visitor.lastName}
                        </h3>
                        <p className="text-sm text-slate-400 mt-0.5">{scannedData.visitor.email}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded">
                            {scannedData.visitor.visitorType}
                          </span>
                          {scannedData.visitor.company && (
                            <span className="text-xs text-slate-500">
                              representing <strong className="text-slate-300">{scannedData.visitor.company}</strong>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visit Details Card */}
                  <div className="p-6 bg-indigo-950/20 border border-indigo-500/20 rounded-2xl relative">
                    <div className="absolute top-0 right-0 p-3 text-[10px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 rounded-bl-xl border-l border-b border-indigo-500/10">
                      Visit details
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Host Escort</p>
                        <p className="font-semibold text-white mt-1">{scannedData.host.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{scannedData.host.department} Department</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Purpose of visit</p>
                        <p className="font-semibold text-white mt-1">{scannedData.purpose}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Expected Time</p>
                        <p className="font-semibold text-white mt-1">
                          {format(new Date(scannedData.expectedArrival), 'MMM dd, yyyy - hh:mm a')}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-indigo-300 tracking-wider">Authorized Zone</p>
                        <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{scannedData.allowedZone}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Status Grid */}
                  <div className="grid sm:grid-cols-[1fr_2fr] gap-4 items-center">
                    <div className="p-4 bg-slate-900 border border-white/5 rounded-2xl text-center">
                      <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Visit Status</p>
                      <p className="text-xl font-extrabold text-white mt-1">{scannedData.status}</p>
                    </div>

                    <div className="flex gap-2">
                      {scannedData.status === 'APPROVED' && !scannedData.visitor.isBlacklisted && (
                        <Button
                          variant="primary"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-3 text-sm font-bold"
                          onClick={handleCheckIn}
                          disabled={actionLoading}
                        >
                          ✓ Grant Check-In
                        </Button>
                      )}
                      {scannedData.status === 'CHECKED_IN' && (
                        <Button
                          variant="primary"
                          className="flex-1 bg-indigo-650 hover:bg-indigo-700 py-3 text-sm font-bold"
                          onClick={handleCheckOut}
                          disabled={actionLoading}
                        >
                          ✓ Process Check-Out
                        </Button>
                      )}
                      <Button
                        variant="secondary"
                        className="bg-slate-800 text-slate-200 hover:bg-slate-700 border-white/5 py-3 text-sm"
                        onClick={handleReset}
                      >
                        Reset Scanner
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Activity */}
        <div>
          <Card className="bg-slate-900/40 border-white/10 backdrop-blur-xl h-full">
            <CardHeader className="border-b border-white/5 bg-slate-900/20">
              <CardTitle className="text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" /> Recent Scans
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              {recentScans.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                  <ShieldCheck className="w-10 h-10 text-slate-750 mx-auto mb-2" />
                  <p className="text-xs">No scan logs in this session.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentScans.map((scan, i) => (
                    <div
                      key={scan.id + '-' + i}
                      className="p-3 bg-slate-900/80 border border-white/5 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div>
                        <p className="text-xs font-semibold text-white">
                          {scan.visitor.firstName} {scan.visitor.lastName}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Host: {scan.host.name}</p>
                      </div>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${
                        scan.status === 'CHECKED_IN'
                          ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
                          : scan.status === 'CHECKED_OUT'
                          ? 'bg-slate-800 border-white/10 text-slate-400'
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
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
