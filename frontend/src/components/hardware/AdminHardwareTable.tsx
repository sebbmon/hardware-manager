'use client';

import React, { useState } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Wrench, 
  CheckCircle2, 
  XCircle,
  Loader2,
  Trash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

interface Hardware {
  id: number;
  name: string;
  brand: string;
  status: 'Available' | 'In Use' | 'Repair';
  notes?: string;
}

interface AdminHardwareTableProps {
  data: Hardware[];
  isLoading: boolean;
}

export const AdminHardwareTable = ({ data, isLoading }: AdminHardwareTableProps) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/hardware/${id}/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hardware'] }),
  });

  const repairMutation = useMutation({
    mutationFn: (id: number) => api.post(`/admin/hardware/${id}/mark_in_repair/`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hardware'] }),
  });

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-800/50 border-b border-white/5">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-300">Name</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Brand</th>
                <th className="px-6 py-4 font-semibold text-slate-300">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-300 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-800" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-800" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 rounded bg-slate-800" /></td>
                    <td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-16 rounded bg-slate-800" /></td>
                  </tr>
                ))
              ) : data.map((item) => (
                <tr key={item.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-100">{item.name}</td>
                  <td className="px-6 py-4 text-slate-400">{item.brand}</td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium border",
                      item.status === 'Available' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                      item.status === 'In Use' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                      "bg-red-500/10 text-red-400 border-red-500/20"
                    )}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => repairMutation.mutate(item.id)}
                      disabled={item.status === 'Repair' || repairMutation.isPending}
                      title="Mark as In Repair"
                      className="p-2 text-slate-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all disabled:opacity-30"
                    >
                      {repairMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      disabled={deleteMutation.isPending}
                      title="Delete Hardware"
                      className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                    >
                       {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
