'use client';

import React, { useState, useMemo } from 'react';
import {
  Trash2,
  Wrench,
  CheckCircle2,
  XCircle,
  Loader2,
  Search,
  Filter,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Edit2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import EditHardwareModal from './EditHardwareModal';

interface Hardware {
  id: number;
  name: string;
  brand: string;
  status: 'Available' | 'In Use' | 'Repair';
  added_at: string;
  serial_number?: string;
  category?: 'laptop' | 'mobile' | 'tablet' | 'monitor' | 'accessory';
  notes?: string;
}

interface AdminHardwareTableProps {
  data: Hardware[];
  isLoading: boolean;
}

export const AdminHardwareTable = ({ data, isLoading }: AdminHardwareTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Hardware, direction: 'asc' | 'desc' } | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedHardware, setSelectedHardware] = useState<Hardware | null>(null);

  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/admin/hardware/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hardware'] }),
  });

  const repairMutation = useMutation({
    mutationFn: (id: number) => api.post(`/admin/hardware/${id}/mark_in_repair`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hardware'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<Hardware> }) =>
      api.patch(`/admin/hardware/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware'] });
      setIsEditModalOpen(false);
    },
  });

  const handleSort = (key: keyof Hardware) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortConfig]);

  const filteredAndSortedData = useMemo(() => {
    let result = [...data];

    // Search filter
    if (searchTerm) {
      result = result.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      result = result.filter(item => item.status === statusFilter);
    }

    // Sorting
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

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search devices or brands..."
            className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-slate-400" />
          <select
            className="rounded-lg border border-slate-200 bg-white py-2 px-4 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none transition-all shadow-sm"
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

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all text-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse table-fixed">
            <thead className="bg-slate-50 border-b border-slate-200 uppercase tracking-wider">
              <tr>
                {['name', 'brand', 'serial_number', 'added_at', 'status'].map((header) => (
                  <th
                    key={header}
                    className="cursor-pointer px-6 py-4 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors group uppercase"
                    onClick={() => handleSort(header as keyof Hardware)}
                  >
                    <div className="flex items-center gap-2">
                      {header.replace('_', ' ')}
                      {sortConfig?.key === header ? (
                        sortConfig.direction === 'asc' ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100" />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-16 rounded bg-slate-100" /></td>
                  </tr>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-slate-600">{item.brand}</td>
                    <td className="px-6 py-4 text-slate-600">
                      {item.serial_number || 'Empty'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(item.added_at).toLocaleDateString()}
                      </div>
                    </td>
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
                        onClick={() => {
                          setSelectedHardware(item);
                          setIsEditModalOpen(true);
                        }}
                        title="Edit Hardware"
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => repairMutation.mutate(item.id)}
                        disabled={item.status === 'In Use' || repairMutation.isPending}
                        title={item.status === 'Repair' ? "Mark as Available" : "Mark for Repair"}
                        className={cn(
                          "p-2 rounded-lg transition-all disabled:opacity-30",
                          item.status === 'Repair'
                            ? "text-amber-600 bg-amber-50 hover:bg-amber-100"
                            : "text-slate-400 hover:text-amber-600 hover:bg-amber-50"
                        )}
                      >
                        {repairMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wrench className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => deleteMutation.mutate(item.id)}
                        disabled={item.status === 'In Use' || deleteMutation.isPending}
                        title={item.status === 'In Use' ? "Cannot delete rented hardware" : "Delete Hardware"}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all disabled:opacity-30"
                      >
                        {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-400 italic font-medium">
                    No hardware found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 bg-white px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-slate-700">
                  Showing <span className="font-medium">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
                  <span className="font-medium">{Math.min(currentPage * itemsPerPage, filteredAndSortedData.length)}</span> of{' '}
                  <span className="font-medium">{filteredAndSortedData.length}</span> results
                </p>
              </div>
              <div>
                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeft className="h-4 w-4" aria-hidden="true" />
                  </button>
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={cn(
                        "relative inline-flex items-center px-4 py-2 text-sm font-semibold focus:z-20 focus:outline-offset-0",
                        currentPage === i + 1
                          ? "z-10 bg-indigo-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                          : "text-slate-900 ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
                      )}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-slate-400 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRight className="h-4 w-4" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      <EditHardwareModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={async (id, data) => {
          await updateMutation.mutateAsync({ id, data });
        }}
        hardware={selectedHardware}
        isSaving={updateMutation.isPending}
      />
    </div>
  );
};
