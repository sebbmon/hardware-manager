'use client';

import React from 'react';
import { MyRentalsTable } from '@/components/hardware/MyRentalsTable';
import { useMyRentals } from '@/hooks/useHardware';
import { ShoppingCart } from 'lucide-react';

export default function MyRentalsPage() {
  const { data, isLoading, error } = useMyRentals();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col gap-2">
        <h1 className="flex items-center gap-3 text-4xl font-extrabold tracking-tight text-white">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-600/20 text-indigo-400">
            <ShoppingCart className="h-7 w-7" />
          </div>
          My Rentals
        </h1>
        <p className="text-lg text-slate-400 max-w-2xl">
          List of equipment currently assigned to you. You can return any item to make it available for other users.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-6 text-center text-red-400">
          <p className="text-lg font-semibold">Failed to load rentals</p>
          <p className="text-sm">Please ensure you are logged in and the server is running.</p>
        </div>
      ) : (
        <MyRentalsTable data={data || []} isLoading={isLoading} />
      )}
    </div>
  );
}
