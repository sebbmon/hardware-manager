'use client';

import React from 'react';
import { HardwareTable } from '@/components/hardware/HardwareTable';
import { useHardware } from '@/hooks/useHardware';
import { Package } from 'lucide-react';

export default function HardwareListPage() {
  const { data, isLoading, error } = useHardware();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400">
            <Package className="h-7 w-7" />
          </div>
          Hardware List
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl">
          Browse and rent available hardware. Use the filters below to find specific device models or check availability.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
          <p className="text-lg font-semibold">Failed to load hardware</p>
          <p className="text-sm">Please check your backend connection and try again.</p>
        </div>
      ) : (
        <HardwareTable data={data || []} isLoading={isLoading} />
      )}
    </div>
  );
}
