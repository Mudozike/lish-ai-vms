import Link from 'next/link';
import { Cpu, Brain, Zap, ArrowRight, Shield, UserPlus, CheckSquare, QrCode } from 'lucide-react';

export default function LandingPage() {
  const features = [
    {
      title: 'AI Training Hub',
      description: 'Host coordinate access for students, researchers, and trainees attending our leading-edge workshops and courses.',
      icon: Brain,
      color: 'from-blue-500 to-indigo-500',
    },
    {
      title: 'Data Annotation',
      description: 'Secure, trackable facility access for our massive network of annotators and quality assurance agents working on vital dataset pipelines.',
      icon: Cpu,
      color: 'from-indigo-500 to-purple-500',
    },
    {
      title: 'Innovation Lab',
      description: 'Streamlined check-in and escort management for innovation partners, venture capital teams, and technology sponsors.',
      icon: Zap,
      color: 'from-purple-500 to-pink-500',
    },
  ];

  const steps = [
    {
      step: '01',
      title: 'Register Visit',
      description: 'Visitors register online, choosing their host, scheduled date, and allowed zones.',
      icon: UserPlus,
    },
    {
      step: '02',
      title: 'Host Approves',
      description: 'Hosts receive requests instantly, approve them, and send a digital QR badge to the visitor.',
      icon: CheckSquare,
    },
    {
      step: '03',
      title: 'Security Check-In',
      description: 'Visitor presents the QR code at the desk, security scans (or types fallback), and grants entry.',
      icon: QrCode,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 flex flex-col items-center">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-7xl h-[600px] pointer-events-none">
          <div className="absolute top-[-100px] left-1/4 w-[450px] h-[450px] rounded-full bg-blue-200/20 blur-[130px]" />
          <div className="absolute top-[-50px] right-1/4 w-[500px] h-[500px] rounded-full bg-indigo-200/20 blur-[140px]" />
          <div className="absolute top-[150px] left-1/3 w-[350px] h-[350px] rounded-full bg-purple-200/10 blur-[110px]" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Active Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4.5 py-1.5 text-xs font-semibold text-indigo-700 tracking-wider uppercase mb-8 shadow-sm backdrop-blur-md">
            <Shield className="h-3.5 w-3.5 text-indigo-655" />
            Next-Gen Security Protocols Active
          </div>

          {/* Heading */}
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-indigo-600 mb-4">
            Lish AI Labs Nakuru
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 leading-tight">
            Secure Visitor Management for Nakuru&apos;s AI Factory
          </h1>

          {/* Subtitle */}
          <h2 className="mt-6 text-base sm:text-lg md:text-xl text-slate-600 font-semibold tracking-wide flex flex-wrap justify-center gap-2 sm:gap-4">
            <span>AI Training Hub</span>
            <span className="text-indigo-200 hidden sm:inline">|</span>
            <span>Data Annotation</span>
            <span className="text-indigo-200 hidden sm:inline">|</span>
            <span>Innovation Facility</span>
          </h2>

          <p className="mt-6 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-slate-500">
            Streamlining campus safety and staff escort workflows. Schedule visits, verify visitor credentials via secure digital badges, and track real-time access logs.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-650 px-8 py-4 text-base font-bold text-white shadow-lg shadow-indigo-650/15 transition-all duration-300 hover:shadow-indigo-650/30 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] active:translate-y-0"
            >
              Request Visit
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#how-it-works"
              className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white hover:bg-slate-50 px-8 py-4 text-base font-semibold text-slate-700 hover:text-slate-900 shadow-sm transition-all duration-200 hover:-translate-y-0.5"
            >
              How it works
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="border-t border-b border-slate-200 bg-white/60 backdrop-blur-sm py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-extrabold text-slate-900">100%</p>
              <p className="text-xs text-indigo-650 uppercase tracking-wider font-bold mt-1">Digital Check-In</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">&lt; 2 min</p>
              <p className="text-xs text-indigo-650 uppercase tracking-wider font-bold mt-1">Host Approval</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">Zero</p>
              <p className="text-xs text-indigo-650 uppercase tracking-wider font-bold mt-1">Paper Badges</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-slate-900">24/7</p>
              <p className="text-xs text-indigo-650 uppercase tracking-wider font-bold mt-1">Real-time Logs</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 md:py-28 bg-white/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-950">
              Campus Access Workflow
            </h2>
            <p className="mt-4 text-slate-500 font-medium">
              A secure, three-step authorization pipeline tailored for Nakuru facility regulations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            {steps.map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={i}
                  className="relative group rounded-3xl border border-slate-200 bg-white p-8 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="absolute top-6 right-8 text-4xl font-extrabold text-slate-100 group-hover:text-indigo-50 transition-colors">
                    {item.step}
                  </div>
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 mb-6 border border-indigo-100">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-650 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-500 leading-relaxed font-medium">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-955 sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-950">
              Designed for High-Velocity AI Operations
            </h2>
            <p className="mt-4 text-slate-500 font-medium">
              Our VMS scales dynamically to support annotators, quality control teams, and technology sponsors visiting our labs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="relative group rounded-3xl border border-slate-200 bg-white p-8 hover:border-indigo-300 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-sm shadow-indigo-500/10 mb-6 text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-500 leading-relaxed font-medium">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portal Access CTA */}
      <section className="py-16 bg-gradient-to-b from-transparent to-slate-100 border-t border-slate-200/60">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="rounded-3xl border border-slate-200 bg-white p-8 md:p-12 shadow-md backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-indigo-500/5 rounded-full blur-3xl -z-10" />
            <h2 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-4">
              Lish AI Staff & Security Portal
            </h2>
            <p className="text-slate-500 text-sm md:text-base max-w-xl mx-auto mb-8 font-medium">
              Are you a Host, Security Officer, or Administrator? Authenticate to access your management dashboard and oversee campus operations.
            </p>
            <Link
              href="/dashboard/host"
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-700 px-6.5 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/10 transition-all duration-200 hover:-translate-y-0.5"
            >
              Access Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-200/80 bg-white text-center text-xs text-slate-500 font-semibold">
        <div className="mx-auto max-w-7xl px-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="h-4.5 w-4.5 text-indigo-600" />
            <span className="font-bold text-slate-900">Lish AI Labs Visitor Management System</span>
          </div>
          <p>© {new Date().getFullYear()} Lish AI Labs. All rights reserved.</p>
          <p className="mt-2 text-slate-400 font-medium">Nakuru Campus, Kenya — AI Factory, Training Hub & Innovation Facility</p>
        </div>
      </footer>
    </main>
  );
}
