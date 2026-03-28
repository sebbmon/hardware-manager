'use client';

import React from 'react';
import { AdminHardwareTable } from '@/components/hardware/AdminHardwareTable';
import { AdminForms } from '@/components/hardware/AdminForms';
import { useHardware } from '@/hooks/useHardware';
import { ShieldCheck, Settings, Users, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { redirect } from 'next/navigation';

export default function AdminPage() {
  const { user, loading } = useAuth();
  const { data: hardware, isLoading: hwLoading, error: hwError } = useHardware();

  // Guard: Admin only
  if (!loading && !user?.is_staff) {
    redirect('/dashboard/list');
  }

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400">
            <ShieldCheck className="h-7 w-7" />
          </div>
          Admin Panel
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl">
          Complete control over the hardware inventory and user accounts. Add new assets, manage repairs, and onboard new team members.
        </p>
      </div>

      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <Settings className="h-5 w-5 text-indigo-400" />
          <h2 className="text-2xl font-bold text-white">Inventory Management</h2>
        </div>
        <AdminForms />
      </section>

      <section className="space-y-6">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4">
          <Package className="h-5 w-5 text-indigo-400" />
          <h2 className="text-2xl font-bold text-white">All Devices</h2>
        </div>
        {hwError ? (
          <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-red-400">
            Failed to load hardware inventory for admin.
          </div>
        ) : (
          <AdminHardwareTable data={hardware || []} isLoading={hwLoading} />
        )}
      </section>
    </div>
  );
}
