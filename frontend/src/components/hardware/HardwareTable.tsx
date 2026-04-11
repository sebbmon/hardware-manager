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
  Loader2,
  Calendar,
  Sparkles,
  Bot,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import api from '@/lib/api';
import { useMutation, useQueryClient } from '@tanstack/react-query';

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

interface HardwareTableProps {
  data: Hardware[];
  isLoading: boolean;
}

export const HardwareTable = ({ data, isLoading }: HardwareTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Hardware, direction: 'asc' | 'desc' } | null>(null);

  const [aiQuery, setAiQuery] = useState('');
  const [aiResults, setAiResults] = useState<Hardware[] | null>(null);
  const [isAiSearching, setIsAiSearching] = useState(false);
  const [aiError, setAiError] = useState('');

  const queryClient = useQueryClient();

  const rentMutation = useMutation({
    mutationFn: (id: number) => api.post(`/hardware/${id}/rent`),
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

  const handleSemanticSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!aiQuery.trim()) {
      setAiResults(null);
      return;
    }

    setIsAiSearching(true);
    setAiError('');

    try {
      const response = await api.post('/hardware/semantic-search', { query: aiQuery });
      setAiResults(response.data);
      setSearchTerm('');
      setStatusFilter('All');
    } catch (err) {
      setAiError('Failed to perform intelligent search. Please try again.');
    } finally {
      setIsAiSearching(false);
    }
  };

  const itemsPerPage = 10;
  const [currentPage, setCurrentPage] = useState(1);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortConfig, aiResults]);

  const filteredAndSortedData = React.useMemo(() => {
    let result = aiResults !== null ? [...aiResults] : [...data];

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
  }, [data, searchTerm, statusFilter, sortConfig, aiResults]);

  const totalPages = Math.ceil(filteredAndSortedData.length / itemsPerPage);
  const paginatedData = filteredAndSortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const getStatusBadge = (status: Hardware['status']) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="h-3.5 w-3.5" /> Available
          </span>
        );
      case 'In Use':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 border border-amber-100">
            <XCircle className="h-3.5 w-3.5" /> Rented
          </span>
        );
      case 'Repair':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700 border border-red-100">
            <Wrench className="h-3.5 w-3.5" /> In Repair
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-slate-900">
      {/* Intelligent Search Block */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px]">
        <div className="relative rounded-[14px] bg-white p-5 sm:p-6 shadow-xl">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="flex-1 space-y-2">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-indigo-500" />
                Intelligent Search
              </h3>
              <p className="text-sm text-slate-500 font-medium">
                Describe the equipment you need in natural language, and AI will find the best match for your task!
              </p>
            </div>
            <form onSubmit={handleSemanticSearch} className="flex-[1.5] w-full relative">
              <input
                type="text"
                placeholder="e.g. I need a laptop for heavy video editing..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-4 pr-32 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium"
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                disabled={isAiSearching}
              />
              <button
                type="submit"
                disabled={isAiSearching || !aiQuery.trim()}
                className="absolute right-1.5 top-1.5 bottom-1.5 rounded-lg bg-indigo-600 px-4 text-xs font-bold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isAiSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bot className="h-4 w-4" />}
                Ask AI
              </button>
            </form>
          </div>
          {aiError && (
            <p className="mt-3 text-sm text-red-500 font-medium flex items-center gap-1.5">
              <XCircle className="h-4 w-4" /> {aiError}
            </p>
          )}
          {aiResults !== null && (
            <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
              <span className="text-sm font-bold text-indigo-600">
                Found {aiResults.length} result(s) based on your request.
              </span>
              <button
                type="button"
                onClick={() => { setAiResults(null); setAiQuery(''); }}
                className="text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors"
                disabled={isAiSearching}
              >
                Clear AI Results
              </button>
            </div>
          )}
        </div>
      </div>

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
                {['name', 'brand', 'added_at', 'status'].map((header) => (
                  <th
                    key={header}
                    className="cursor-pointer px-6 py-4 text-[11px] font-bold text-slate-500 hover:text-slate-900 transition-colors uppercase"
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
                <th className="px-6 py-4 text-[11px] font-bold text-slate-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 w-32 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-4 w-24 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-6 w-20 rounded bg-slate-100" /></td>
                    <td className="px-6 py-4"><div className="h-8 w-24 rounded bg-slate-100" /></td>
                  </tr>
                ))
              ) : paginatedData.length > 0 ? (
                paginatedData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-6 py-4 font-semibold text-slate-900">{item.name}</td>
                    <td className="px-6 py-4 text-slate-600">{item.brand}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-slate-500 font-medium">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(item.added_at).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => rentMutation.mutate(item.id)}
                        disabled={item.status !== 'Available' || rentMutation.isPending}
                        className={cn(
                          "inline-flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-bold transition-all focus:outline-none focus:ring-2 active:scale-[0.98]",
                          item.status === 'Available'
                            ? "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-100 ring-indigo-500/20"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
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
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic font-medium">
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
    </div>
  );
};
