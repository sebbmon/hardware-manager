'use client';

import React from 'react';
import { MyRentalsTable } from '@/components/hardware/MyRentalsTable';
import { useMyRentals } from '@/hooks/useHardware';
import { ShoppingCart } from 'lucide-react';

export default function MyRentalsPage() {
  const { data, isLoading, error } = useMyRentals();

  return (
    <div className="space-y-8 pb-12">
      <div className="border-b border-slate-200 pb-8">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
          My Rentals
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-500 font-medium">
          List of equipment currently assigned to you. You can return any item to make it available for other users.
        </p>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-red-600">
            <p className="text-lg font-semibold">Failed to load rentals</p>
            <p className="text-sm">Please ensure you are logged in and the server is running.</p>
          </div>
        ) : (
          <MyRentalsTable data={data || []} isLoading={isLoading} />
        )}
      </div>
    </div>
  );
}
