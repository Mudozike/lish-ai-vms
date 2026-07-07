'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import {
  BarChart3,
  CheckCircle2,
  QrCode,
  Users,
  Home,
} from 'lucide-react';


export default function Sidebar() {
  const { user } = useUser();

  const pathname = usePathname();
  const userRole = user?.publicMetadata?.role as string || 'user';

  const navItems =
    userRole === 'admin'
      ? [
          {
            href: '/dashboard/admin',
            icon: BarChart3,
            label: 'Dashboard',
          },
          {
            href: '/dashboard/admin/logs',
            icon: Users,
            label: 'Visitor Logs',
          },
        ]
      : userRole === 'security'
        ? [
            {
              href: '/dashboard/security',
              icon: QrCode,
              label: 'QR Scanner',
            },
            {
              href: '/dashboard/security/onsite',
              icon: CheckCircle2,
              label: 'On-Site Visitors',
            },
          ]
        : [
            {
              href: '/dashboard/host',
              icon: Home,
              label: 'My Dashboard',
            },
          ];

  return (
    <div className="w-64 bg-slate-900 border-r border-white/10 flex flex-col text-slate-100">
      {/* Header */}
      <div className="p-6 border-b border-white/10">
        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-350">
          Lish AI Labs
        </h1>
        <p className="text-xs font-semibold text-indigo-400 mt-1 tracking-wider uppercase">
          {userRole.toUpperCase()} PORTAL
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-500/15 text-indigo-300 font-semibold border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-5 h-5 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Profile */}
      <div className="p-4 border-t border-white/10 bg-slate-950/40">
        <div className="flex items-center gap-3">
          <UserButton afterSignOutUrl="/" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">
              {user?.firstName} {user?.lastName}
            </p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">
              {user?.primaryEmailAddress?.emailAddress}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
