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
    <nav className="sticky top-0 z-40 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Brand Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-200">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold text-white tracking-wide">
                  Lish AI Labs
                </span>
                <span className="block text-[10px] text-indigo-300 font-medium">
                  Nakuru Facility VMS
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 py-1.5 px-3 rounded-lg ${
                    isActive
                      ? 'text-white bg-indigo-500/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="h-4 w-4 text-indigo-400" />
                  {link.label}
                </Link>
              );
            })}

            {isLoaded && user && dashboardLink && (
              <Link
                href={dashboardLink}
                className={`flex items-center gap-2 text-sm font-medium transition-colors duration-200 py-1.5 px-3 rounded-lg ${
                  isDashboardActive
                    ? 'text-white bg-purple-500/15 border border-purple-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <LayoutDashboard className="h-4 w-4 text-purple-400" />
                {role && role.charAt(0).toUpperCase() + role.slice(1)} Portal
              </Link>
            )}
          </div>

          {/* User Button / Authentication */}
          <div className="hidden md:flex items-center gap-4">
            {isLoaded ? (
              user ? (
                <div className="flex items-center gap-3 pl-4 border-l border-white/10">
                  <span className="text-xs font-medium text-slate-300">
                    Hello, {user.firstName || 'User'}
                  </span>
                  <UserButton afterSignOutUrl="/" />
                </div>
              ) : (
                <SignInButton mode="modal">
                  <button className="rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 px-4 py-2 text-xs font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all duration-200 hover:-translate-y-0.5">
                    Sign In
                  </button>
                </SignInButton>
              )
            ) : (
              <div className="h-8 w-8 rounded-full bg-slate-800 animate-pulse" />
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950/95 border-b border-white/10 px-4 py-4 space-y-3 backdrop-blur-lg">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 text-sm font-medium py-2.5 px-4 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-white bg-indigo-500/10'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="h-4 w-4 text-indigo-400" />
                {link.label}
              </Link>
            );
          })}

          {isLoaded && user && dashboardLink && (
            <Link
              href={dashboardLink}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 text-sm font-medium py-2.5 px-4 rounded-xl transition-all duration-200 ${
                isDashboardActive
                  ? 'text-white bg-purple-500/15'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              <LayoutDashboard className="h-4 w-4 text-purple-400" />
              {role && role.charAt(0).toUpperCase() + role.slice(1)} Portal
            </Link>
          )}

          <div className="pt-4 border-t border-white/10 flex items-center justify-between px-4">
            {user ? (
              <>
                <span className="text-sm font-medium text-slate-300">
                  {user.firstName || 'User'}
                </span>
                <UserButton afterSignOutUrl="/" />
              </>
            ) : (
              <SignInButton mode="modal">
                <button className="w-full text-center rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 px-4 py-3 text-sm font-semibold text-white shadow-lg transition-all duration-200">
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
