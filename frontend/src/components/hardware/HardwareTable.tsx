'use client';

import React, { useState } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  ShoppingCart, 
  CheckCircle2, 
  XCircle, 
  Wrench, 
  Loader2
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

interface HardwareTableProps {
  data: Hardware[];
  isLoading: boolean;
}

export const HardwareTable = ({ data, isLoading }: HardwareTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Hardware, direction: 'asc' | 'desc' } | null>(null);
  
  const queryClient = useQueryClient();

  const rentMutation = useMutation({
    mutationFn: (id: number) => api.post(`/hardware/${id}/rent/`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware'] });
      queryClient.invalidateQueries({ queryKey: ['my-rentals'] });
    },
  });

  const handleSort = (key: keyof Hardware) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const filteredAndSortedData = React.useMemo(() => {
    let result = [...data];

    // Filter
    if (searchTerm) {
      result = result.filter(item => 
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      result = result.filter(item => item.status === statusFilter);
    }

    // Sort
    if (sortConfig) {
      result.sort((a, b) => {
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';
        
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [data, searchTerm, statusFilter, sortConfig]);

  const getStatusBadge = (status: Hardware['status']) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="h-3 w-3" /> Available
          </span>
        );
      case 'In Use':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-medium text-amber-400 border border-amber-500/20">
            <XCircle className="h-3 w-3" /> Rented
          </span>
        );
      case 'Repair':
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-400 border border-red-500/20">
            <Wrench className="h-3 w-3" /> In Repair
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search devices or brands..."
            className="w-full rounded-xl border border-slate-800 bg-slate-900 py-2 pl-10 pr-4 text-sm text-slate-100 placeholder:text-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-500" />
          <select 
            className="rounded-xl border border-slate-800 bg-slate-900 py-2 px-4 text-sm text-slate-100 focus:border-indigo-500 focus:outline-none transition-all"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="Available">Available</option>
            <option value="In Use">Rented</option>
            <option value="Repair">In Repair</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/5 bg-slate-900/50 backdrop-blur-sm shadow-2xl transition-all">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead className="bg-slate-800/50 border-b border-white/5">
              <tr>
                {['name', 'brand', 'status'].map((header) => (
                  <th 
                    key={header}
                    className="cursor-pointer px-6 py-4 font-semibold text-slate-300 hover:text-white transition-colors capitalize"
                    onClick={() => handleSort(header as keyof Hardware)}
                  >
                    <div className="flex items-center gap-2">
                      {header}
                      {sortConfig?.key === header ? (
                        sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-50" />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 font-semibold text-slate-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-800" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-800" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 rounded bg-slate-800" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-24 rounded bg-slate-800" /></td>
                  </tr>
                ))
              ) : filteredAndSortedData.length > 0 ? (
                filteredAndSortedData.map((item) => (
                  <tr key={item.id} className="hover:bg-indigo-500/5 transition-colors group">
                    <td className="px-6 py-4 font-medium text-slate-100 group-hover:text-white">{item.name}</td>
                    <td className="px-6 py-4 text-slate-400 group-hover:text-slate-300">{item.brand}</td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => rentMutation.mutate(item.id)}
                        disabled={item.status !== 'Available' || rentMutation.isPending}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold shadow-sm transition-all focus:outline-none focus:ring-2 active:scale-95",
                          item.status === 'Available' 
                            ? "bg-indigo-600 text-white hover:bg-indigo-500 shadow-indigo-500/20 ring-indigo-500/50" 
                            : "bg-slate-800 text-slate-600 cursor-not-allowed opacity-50"
                        )}
                      >
                        {rentMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShoppingCart className="h-3 w-3" />}
                        Rent
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic">
                    No hardware found matching your search criteria.
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
