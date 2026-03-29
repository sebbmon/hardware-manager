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
  /*
  if (!loading && !user?.is_staff) {
    redirect('/dashboard/list');
  }
    */

  return (
    <div className="space-y-12 pb-24">
      {/* Header */}
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Admin Panel
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-500 font-medium">
          Complete control over the hardware inventory and user accounts. Add new assets, manage repairs, and onboard new team members.
        </p>
      </div>

      {/* Admin Forms Section */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <section className="space-y-4">
          <div className="flex items-center gap-2 px-1 border-b border-slate-100 pb-4">
            <Settings className="h-5 w-5 text-indigo-600" />
            <h2 className="text-xl font-bold text-slate-800">Inventory Management</h2>
          </div>
          <AdminForms />
        </section>
      </div>

      {/* Hardware Table Section */}
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <section className="space-y-4">
          <div className="flex items-center justify-between px-1 border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-indigo-600" />
              <h2 className="text-xl font-bold text-slate-800">All Devices</h2>
            </div>
          </div>
          {hwError ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-600">
              Failed to load hardware inventory for admin.
            </div>
          ) : (
            <AdminHardwareTable data={hardware || []} isLoading={hwLoading} />
          )}
        </section>
      </div>
    </div>
  );
}
