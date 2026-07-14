'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { ArrowLeft, Building2, UserCheck, ShieldAlert, Sparkles } from 'lucide-react';
import { useToast } from '@/app/components/Toast';

interface Host {
  id: string;
  name: string;
  department: string;
}

const initialForm = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  company: '',
  visitorType: 'TRAINEE',
  hostId: '',
  purpose: '',
  expectedArrival: ''
};

export default function RegisterPage() {
  const toast = useToast();
  const [hosts, setHosts] = useState<Host[]>([]);
  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [hostsError, setHostsError] = useState('');

  useEffect(() => {
    fetch('/api/hosts')
      .then((res) => {
        if (!res.ok) throw new Error(`Status ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          setHosts(data);
        } else {
          setHosts([]);
          setHostsError('Could not load available hosts.');
        }
      })
      .catch(() => {
        setHosts([]);
        setHostsError('Failed to connect to the hosts directory.');
      });
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await response.json();

      if (response.ok && data.success) {
        const msg = 'Your request has been submitted successfully! Check your email for status notifications.';
        setSuccess(msg);
        toast.success(msg);
        setForm(initialForm);
      } else {
        const msg = data.message || 'Unable to submit registration.';
        setError(msg);
        toast.error(msg);
      }
    } catch {
      const msg = 'Network error. Please try again.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="relative min-h-[calc(100vh-4rem)] bg-slate-50 text-slate-800 px-4 py-10 sm:px-6 lg:px-8 flex items-center justify-center">
      {/* Background decorations */}
      <div className="absolute top-10 left-10 h-72 w-72 rounded-full bg-indigo-500/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 h-72 w-72 rounded-full bg-purple-500/5 blur-3xl pointer-events-none" />

      <div className="relative z-10 w-full max-w-5xl grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        
        {/* Info Column */}
        <section className="flex flex-col justify-between rounded-3xl border border-slate-200/80 bg-white p-8 shadow-md">
          <div className="space-y-6">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors uppercase tracking-wider"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </Link>
            
            <div className="space-y-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700 border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Visitor Gateway
              </span>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Register Your Visit
              </h1>
              <p className="text-slate-550 text-sm leading-relaxed font-medium">
                Submit your credentials and select your host to schedule facility access. Once approved, you will receive an email containing your digital entry badge.
              </p>
            </div>
            
            {/* Value Props */}
            <div className="space-y-4 pt-4">
              <div className="flex gap-4 items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/60">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Select a Dedicated Host</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Visits are mapped directly to Lish AI staff departments for maximum safety.</p>
                </div>
              </div>
              
              <div className="flex gap-4 items-start">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100/60">
                  <Building2 className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900">Select Your Allowed Zones</h4>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">Receive access levels based on your visitor type (Trainee, Annotator, Partner, etc.).</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Lish Hosts</p>
              <p className="mt-2 text-2xl font-extrabold text-slate-900">
                {hosts.length > 0 ? hosts.length : '—'} Available
              </p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">
                {hostsError ? hostsError : 'Direct staff members online.'}
              </p>
            </div>
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50 p-4">
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Verification</p>
              <p className="mt-2 text-2xl font-extrabold text-indigo-600">Digital QR</p>
              <p className="text-[10px] text-slate-400 mt-1 font-medium">Instant barcode scanning at the desk.</p>
            </div>
          </div>
        </section>

        {/* Form Column */}
        <section className="rounded-3xl border border-slate-200/80 bg-white p-8 shadow-md">
          <h2 className="text-xl font-extrabold text-slate-900 mb-6">Visitor Details Form</h2>

          {success && (
            <div className="mb-6 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-800 flex items-start gap-2.5">
              <span className="h-4.5 w-4.5 bg-emerald-500 text-white rounded-full flex items-center justify-center shrink-0">✓</span>
              <span>{success}</span>
            </div>
          )}

          {error && (
            <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-xs font-semibold text-red-800 flex items-start gap-2.5">
              <ShieldAlert className="w-4.5 h-4.5 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 block text-xs font-bold text-slate-600">
                <span>First Name *</span>
                <input
                  type="text"
                  required
                  value={form.firstName}
                  onChange={(event) => setForm({ ...form, firstName: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20"
                  placeholder="Jane"
                />
              </label>
              <label className="space-y-1.5 block text-xs font-bold text-slate-600">
                <span>Last Name *</span>
                <input
                  type="text"
                  required
                  value={form.lastName}
                  onChange={(event) => setForm({ ...form, lastName: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20"
                  placeholder="Doe"
                />
              </label>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 block text-xs font-bold text-slate-600">
                <span>Email Address *</span>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20"
                  placeholder="you@example.com"
                />
              </label>
              <label className="space-y-1.5 block text-xs font-bold text-slate-600">
                <span>Phone Number *</span>
                <input
                  type="tel"
                  required
                  value={form.phone}
                  onChange={(event) => setForm({ ...form, phone: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20"
                  placeholder="+254 700 000000"
                />
              </label>
            </div>

            <label className="space-y-1.5 block text-xs font-bold text-slate-600">
              <span>Company / Organization</span>
              <input
                type="text"
                value={form.company}
                onChange={(event) => setForm({ ...form, company: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20"
                placeholder="Simba AI, University, Private (Optional)"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-1.5 block text-xs font-bold text-slate-600">
                <span>Visitor Type *</span>
                <select
                  required
                  value={form.visitorType}
                  onChange={(event) => setForm({ ...form, visitorType: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20"
                >
                  <option value="TRAINEE">Trainee (Student)</option>
                  <option value="ANNOTATOR">Data Annotator</option>
                  <option value="APPLICANT">Job Applicant</option>
                  <option value="INVESTOR">Investor</option>
                  <option value="PARTNER">Partner</option>
                  <option value="VENDOR">Vendor / Delivery</option>
                  <option value="ATTACHEE">Attachee</option>
                </select>
              </label>
              <label className="space-y-1.5 block text-xs font-bold text-slate-600">
                <span>Host *</span>
                <select
                  required
                  value={form.hostId}
                  onChange={(event) => setForm({ ...form, hostId: event.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20"
                >
                  <option value="">Select Lish Staff Host</option>
                  {hosts.map((host) => (
                    <option key={host.id} value={host.id}>
                      {host.name} ({host.department})
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-1.5 block text-xs font-bold text-slate-600">
              <span>Purpose of Visit *</span>
              <input
                type="text"
                required
                value={form.purpose}
                onChange={(event) => setForm({ ...form, purpose: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20"
                placeholder="Annotation project kickoff, training enrollment..."
              />
            </label>

            <label className="space-y-1.5 block text-xs font-bold text-slate-600">
              <span>Expected Arrival *</span>
              <input
                type="datetime-local"
                required
                value={form.expectedArrival}
                onChange={(event) => setForm({ ...form, expectedArrival: event.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:bg-white focus:ring-1 focus:ring-indigo-500/20"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 px-6 py-3.5 text-sm font-bold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 active:translate-y-0 cursor-pointer"
            >
              {loading ? 'Submitting Registration...' : 'Submit Visit Request'}
            </button>
          </form>
        </section>
      </div>
    </main>
  );
}
