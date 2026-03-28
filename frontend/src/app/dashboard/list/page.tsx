'use client';

import React from 'react';
import { HardwareTable } from '@/components/hardware/HardwareTable';
import { useHardware } from '@/hooks/useHardware';
import { Package } from 'lucide-react';

export default function HardwareListPage() {
  const { data, isLoading, error } = useHardware();

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          Hardware List
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-500 font-medium">
          Browse and rent available hardware. Use the filters below to find specific device models or check availability.
        </p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
            <p className="text-lg font-semibold">Failed to load hardware</p>
            <p className="text-sm">Please check your backend connection and try again.</p>
          </div>
        ) : (
          <HardwareTable data={data || []} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
