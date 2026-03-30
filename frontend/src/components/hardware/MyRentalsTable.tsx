'use client';

import React from 'react';
import {
  RotateCcw,
  Search,
  ShoppingCart,
  Calendar,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Rental {
  id: number;
  hardware: {
    id: number;
    name: string;
    brand: string;
    serial_number: string | null;
  };
  rented_at: string;
  is_active: boolean;
}

interface MyRentalsTableProps {
  data: Rental[];
  isLoading: boolean;
}

export const MyRentalsTable = ({ data, isLoading }: MyRentalsTableProps) => {
  const queryClient = useQueryClient();

  const returnMutation = useMutation({
    mutationFn: (hardwareId: number) => api.post(`/hardware/${hardwareId}/return_hardware/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware'] });
      queryClient.invalidateQueries({ queryKey: ['my-rentals'] });
    },
  });

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all text-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse table-fixed">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Device</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Brand</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Serial Number</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Rented At</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-28 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-40 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-24 rounded bg-slate-100" /></td>
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((rental) => (
                  <tr key={rental.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-900">{rental.hardware.name}</td>
                    <td className="px-6 py-4 text-slate-600">{rental.hardware.brand}</td>
                    <td className="px-6 py-4 text-slate-600">{rental.hardware.serial_number || 'Empty'}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(rental.rented_at).toLocaleDateString()} {new Date(rental.rented_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => returnMutation.mutate(rental.hardware.id)}
                        disabled={returnMutation.isPending}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-emerald-100 hover:bg-emerald-700 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 active:scale-[0.98] disabled:opacity-50"
                      >
                        {returnMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                        Return
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ShoppingCart className="h-10 w-10 text-slate-200" />
                      <p className="text-slate-400 italic text-sm font-medium">You don't have any active rentals.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
