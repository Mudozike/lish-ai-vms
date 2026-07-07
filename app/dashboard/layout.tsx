'use client';

import { useAuth } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import Sidebar from '@/app/components/Sidebar';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = useAuth();

  if (!userId) {
    redirect('/sign-in');
  }

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <main className="flex-1 overflow-auto bg-slate-955 text-slate-100">
        {children}
      </main>
    </div>
  );
}
