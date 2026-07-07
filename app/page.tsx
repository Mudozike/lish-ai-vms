import Link from 'next/link';
import { Cpu, Brain, Zap, ArrowRight, Shield } from 'lucide-react';


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

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 md:pt-32 md:pb-36 flex flex-col items-center">
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -z-10 w-full max-w-7xl h-[500px] pointer-events-none">
          <div className="absolute top-[-100px] left-1/4 w-[350px] h-[350px] rounded-full bg-blue-600/20 blur-[100px]" />
          <div className="absolute top-[-50px] right-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/20 blur-[120px]" />
          <div className="absolute top-[100px] left-1/3 w-[300px] h-[300px] rounded-full bg-indigo-500/15 blur-[90px]" />
        </div>

        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-4 py-1.5 text-xs font-semibold text-indigo-300 tracking-wider uppercase mb-8 shadow-lg shadow-indigo-500/5 backdrop-blur-md animate-fade-in">
            <Shield className="h-3.5 w-3.5" />
            Next-Gen Security Protocols Active
          </div>

          {/* Heading */}
          <p className="text-sm font-bold uppercase tracking-[0.25em] text-indigo-400 mb-4">
            Lish AI Labs Nakuru
          </p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-indigo-200 leading-tight">
            Secure Visitor Management for Nakuru&apos;s AI Factory
          </h1>

          {/* Subtitle */}
          <h2 className="mt-6 text-lg sm:text-xl md:text-2xl text-indigo-200 font-medium tracking-wide">
            AI Training Hub &nbsp;|&nbsp; Data Annotation &nbsp;|&nbsp; Innovation
          </h2>

          <p className="mt-6 max-w-2xl text-sm sm:text-base md:text-lg leading-relaxed text-slate-400">
            Streamlining campus security and guest workflows. Schedule visits, verify credentials via digital badges, and track real-time access logs across Lish AI Labs.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="group inline-flex items-center justify-center rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 px-8 py-4 text-base font-semibold text-white shadow-xl shadow-indigo-500/25 transition-all duration-300 hover:shadow-indigo-500/45 hover:scale-[1.02] active:scale-[0.98]"
            >
              Request Visit
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="#features"
              className="inline-flex items-center justify-center rounded-full border border-white/10 bg-slate-900/40 hover:bg-slate-900/80 px-8 py-4 text-base font-semibold text-slate-200 hover:text-white transition-all duration-200"
            >
              Explore Hub features
            </Link>
          </div>
        </div>
      </section>

      {/* Trust & Stats Section */}
      <section className="border-t border-b border-white/5 bg-slate-900/20 backdrop-blur-sm py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-extrabold text-white">100%</p>
              <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mt-1">Digital Check-In</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">&lt; 2 min</p>
              <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mt-1">Host Approval</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">Zero</p>
              <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mt-1">Paper Badges</p>
            </div>
            <div>
              <p className="text-3xl font-extrabold text-white">24/7</p>
              <p className="text-xs text-indigo-300 uppercase tracking-wider font-semibold mt-1">Real-time Logs</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 md:py-28 relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-300">
              Designed for High-Velocity AI Operations
            </h2>
            <p className="mt-4 text-slate-400">
              Nakuru&apos;s hub operations require precise, secure access control. Our system supports various categories of visitors tailored to lab requirements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="relative group rounded-3xl border border-white/5 bg-slate-900/30 p-8 hover:border-indigo-500/30 hover:bg-slate-900/60 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/5 hover:-translate-y-1"
                >
                  <div className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br ${feature.color} shadow-lg shadow-indigo-500/10 mb-6 text-white`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-indigo-300 transition-colors duration-200">
                    {feature.title}
                  </h3>
                  <p className="mt-3 text-sm text-slate-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Portal Access CTA */}
      <section className="py-16 bg-gradient-to-b from-transparent to-indigo-950/20 border-t border-white/5">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="rounded-3xl border border-white/10 bg-slate-900/60 p-8 md:p-12 shadow-2xl backdrop-blur-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-purple-500/10 rounded-full blur-3xl -z-10" />
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              Lish AI Staff & Security Portal
            </h2>
            <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto mb-8">
              Are you a Host, Security Officer, or Administrator? Authenticate to access your management dashboard and oversee campus operations.
            </p>
            <Link
              href="/dashboard/host"
              className="inline-flex items-center justify-center rounded-full bg-indigo-600 hover:bg-indigo-500 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5"
            >
              Access Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-slate-950/80 text-center text-xs text-slate-500">
        <div className="mx-auto max-w-7xl px-4">
          <p>© {new Date().getFullYear()} Lish AI Labs. All rights reserved.</p>
          <p className="mt-2 text-slate-600">Nakuru, Kenya — AI Factory, Training Hub & Innovation Facility</p>
        </div>
      </footer>
    </main>
  );
}
