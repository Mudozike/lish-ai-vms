'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUser, SignInButton, UserButton } from '@clerk/nextjs';
import { Shield, Home, CalendarRange, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, isLoaded } = useUser();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Helper to determine role with email fallbacks for robust local testing
  const getUserRole = () => {
    if (!user) return null;
    const metadataRole = user.publicMetadata?.role as string;
    if (metadataRole) return metadataRole.toLowerCase();

    const email = user.primaryEmailAddress?.emailAddress;
    if (email === 'admin@lishailabs.com') return 'admin';
    if (email === 'security@lishailabs.com') return 'security';
    return 'host';
  };

  const role = getUserRole();
  const isDashboardActive = pathname.startsWith('/dashboard');

  const getDashboardLink = () => {
    if (!role) return null;
    if (role === 'admin') return '/dashboard/admin';
    if (role === 'security') return '/dashboard/security';
    return '/dashboard/host';
  };

  const dashboardLink = getDashboardLink();

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/register', label: 'Request Visit', icon: CalendarRange },
  ];

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 via-indigo-650 to-indigo-700 shadow-md shadow-indigo-500/15 group-hover:scale-105 transition-transform duration-200">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold text-slate-900 tracking-wide">
                  Lish AI Labs
                </span>
                <span className="block text-[10px] text-indigo-600 font-semibold">
                  Nakuru Facility VMS
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-4">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-semibold transition-all duration-200 py-1.5 px-3.5 rounded-xl border ${
                    isActive
                      ? 'text-indigo-600 bg-indigo-50 border-indigo-100 shadow-sm'
                      : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-655'}`} />
                  {link.label}
                </Link>
              );
            })}

            {isLoaded && user && dashboardLink && (
              <Link
                href={dashboardLink}
                className={`flex items-center gap-2 text-sm font-semibold transition-all duration-200 py-1.5 px-3.5 rounded-xl border ${
                  isDashboardActive
                    ? 'text-indigo-600 bg-indigo-50 border-indigo-100 shadow-sm'
                    : 'text-slate-600 border-transparent hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <LayoutDashboard className={`h-4 w-4 ${isDashboardActive ? 'text-indigo-650' : 'text-slate-400'}`} />
                {role && role.charAt(0).toUpperCase() + role.slice(1)} Portal
              </Link>
            )}
          </div>

          {/* User Button / Authentication */}
          <div className="hidden md:flex items-center gap-4">
            {isLoaded ? (
              user ? (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                  <span className="text-xs font-semibold text-slate-650">
                    Hello, {user.firstName || 'User'}
                  </span>
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button className="rounded-xl bg-indigo-600 hover:bg-indigo-700 px-5 py-2 text-xs font-bold text-white shadow-md shadow-indigo-500/10 transition-all duration-200 hover:-translate-y-0.5">
                    Sign In
                  </button>
                </SignInButton>
              )
            ) : (
              <div className="h-8 w-8 rounded-xl bg-slate-100 animate-pulse" />
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-50 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white/95 border-b border-slate-200 px-4 py-4 space-y-2.5 backdrop-blur-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 text-sm font-semibold py-2.5 px-4 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? 'text-indigo-600 bg-indigo-50 border-indigo-100 shadow-sm'
                    : 'text-slate-650 border-transparent hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <Icon className={`h-4.5 w-4.5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                {link.label}
              </Link>
            );
          })}

          {isLoaded && user && dashboardLink && (
            <Link
              href={dashboardLink}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 text-sm font-semibold py-2.5 px-4 rounded-xl border transition-all duration-200 ${
                isDashboardActive
                  ? 'text-indigo-650 bg-indigo-50 border-indigo-100 shadow-sm'
                  : 'text-slate-650 border-transparent hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className={`h-4.5 w-4.5 ${isDashboardActive ? 'text-indigo-600' : 'text-slate-400'}`} />
              {role && role.charAt(0).toUpperCase() + role.slice(1)} Portal
            </Link>
          )}

          <div className="pt-4 border-t border-slate-200 flex items-center justify-between px-4">
            {user ? (
              <>
                <span className="text-sm font-semibold text-slate-655">
                  {user.firstName || 'User'}
                </span>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="w-full text-center rounded-xl bg-indigo-600 hover:bg-indigo-700 px-4 py-3 text-sm font-bold text-white shadow-md transition-all duration-200">
                  Sign In
                </button>
              </SignInButton>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
