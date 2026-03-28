'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminForms = () => {
  const [hwName, setHwName] = useState('');
  const [hwBrand, setHwBrand] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isStaff, setIsStaff] = useState(false);
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  
  const queryClient = useQueryClient();

  const addHardwareMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/hardware/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware'] });
      setHwName('');
      setHwBrand('');
      setSuccess('Hardware added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => setError(err.response?.data?.detail || 'Failed to add hardware'),
  });

  const addUserMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/users/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setUsername('');
      setPassword('');
      setIsStaff(false);
      setSuccess('User created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => setError(err.response?.data?.detail || 'Failed to create user'),
  });

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Add Hardware Form */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 shadow-xl backdrop-blur-sm">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
          <Plus className="h-5 w-5 text-indigo-400" />
          Add New Equipment
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Hardware Name</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. MacBook Pro M3"
              value={hwName}
              onChange={(e) => setHwName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Brand</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. Apple"
              value={hwBrand}
              onChange={(e) => setHwBrand(e.target.value)}
            />
          </div>
          <button 
            onClick={() => addHardwareMutation.mutate({ name: hwName, brand: hwBrand })}
            disabled={!hwName || !hwBrand || addHardwareMutation.isPending}
            className="w-full rounded-xl bg-indigo-600 py-2.5 text-sm font-semibold text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {addHardwareMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Device
          </button>
        </div>
      </div>

      {/* Add User Form */}
      <div className="rounded-2xl border border-white/5 bg-slate-900/50 p-6 shadow-xl backdrop-blur-sm">
        <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-white">
          <UserPlus className="h-5 w-5 text-emerald-400" />
          Create User Account
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Username</label>
            <input 
              type="text" 
              className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="e.g. john.doe"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">Password</label>
            <input 
              type="password" 
              className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2 px-4 text-sm text-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 py-2">
            <input 
              type="checkbox" 
              id="isStaff" 
              className="h-4 w-4 rounded border-slate-800 bg-slate-950"
              checked={isStaff}
              onChange={(e) => setIsStaff(e.target.checked)}
            />
            <label htmlFor="isStaff" className="text-sm text-slate-400">Grant Administrator access</label>
          </div>
          <button 
            onClick={() => addUserMutation.mutate({ username, password, is_staff: isStaff })}
            disabled={!username || !password || addUserMutation.isPending}
            className="w-full rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {addUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create User
          </button>
        </div>
      </div>

      {/* Unified Feedback Toast (simplified for now) */}
      {(success || error) && (
        <div className={cn(
          "fixed bottom-8 right-8 flex items-center gap-3 rounded-2xl p-4 shadow-2xl animate-in slide-in-from-right-8 fade-in duration-300 z-50",
          success ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
        )}>
          {success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-medium">{success || error}</span>
        </div>
      )}
    </div>
  );
};
