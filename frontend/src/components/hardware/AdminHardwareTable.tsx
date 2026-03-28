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
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all text-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Name</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Brand</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Status</th>
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-16 rounded bg-slate-100" /></td>
                  </tr>
                ))
              ) : data.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-semibold text-slate-900">{item.name}</td>
                  <td className="px-6 py-4 text-slate-600">{item.brand}</td>
                  <td className="px-6 py-4">
                    {item.status === 'Available' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Available
                      </span>
                    ) : item.status === 'In Use' ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-100">
                        <XCircle className="h-3.5 w-3.5" /> Rented
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-100">
                        <Wrench className="h-3.5 w-3.5" /> In Repair
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button
                      onClick={() => repairMutation.mutate(item.id)}
                      disabled={item.status === 'Repair' || repairMutation.isPending}
                      title="Mark for Repair"
                      className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all disabled:opacity-30"
                    >
                      {repairMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
                    </button>
                    <button
                      onClick={() => deleteMutation.mutate(item.id)}
                      disabled={deleteMutation.isPending}
                      title="Delete Hardware"
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
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
