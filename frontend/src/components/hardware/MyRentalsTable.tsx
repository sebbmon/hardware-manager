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
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm shadow-2xl transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-800/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-300">Device</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Brand</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Rented At</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-800" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-800" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-40 rounded bg-slate-800" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-24 rounded bg-slate-800" /></td>
                  </tr>
                ))
              ) : data.length > 0 ? (
                data.map((rental) => (
                  <tr key={rental.id} className="hover:bg-indigo-500/5 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-100 group-hover:text-white">{rental.hardware.name}</td>
                    <td className="px-6 py-4 text-slate-400 group-hover:text-slate-300">{rental.hardware.brand}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-slate-400 group-hover:text-slate-300">
                        <Calendar className="h-3 w-3" />
                        {new Date(rental.rented_at).toLocaleDateString()} {new Date(rental.rented_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => returnMutation.mutate(rental.hardware.id)}
                        disabled={returnMutation.isPending}
                        className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-emerald-500/20 hover:bg-emerald-500 transition-all focus:outline-none focus:ring-2 focus:ring-emerald-500/50 active:scale-95 disabled:opacity-50"
                      >
                        {returnMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <RotateCcw className="h-3 w-3" />}
                        Return
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <ShoppingCart className="h-10 w-10 text-slate-700" />
                      <p className="text-slate-500 italic">You don't have any active rentals.</p>
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
