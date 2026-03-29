'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Plus, UserPlus, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const AdminForms = () => {
  const [hwName, setHwName] = useState('');
  const [hwBrand, setHwBrand] = useState('');
  const [hwSerialNumber, setHwSerialNumber] = useState('');
  const [hwCategory, setHwCategory] = useState('laptop');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isStaff, setIsStaff] = useState(false);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  // email domain validation
  const [emailError, setEmailError] = useState('');

  const queryClient = useQueryClient();

  const addHardwareMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/hardware/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hardware'] });
      setHwName('');
      setHwBrand('');
      setHwSerialNumber('');
      setHwCategory('laptop');
      setSuccess('Hardware added successfully!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => setError(err.response?.data?.detail || 'Failed to add hardware'),
  });

  const addUserMutation = useMutation({
    mutationFn: (data: any) => api.post('/admin/users/', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setEmail('');
      setPassword('');
      setIsStaff(false);
      setEmailError('');
      setSuccess('User created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    },
    onError: (err: any) => setError(err.response?.data?.detail || 'Failed to create user'),
  });

  // hardware add validation
  const handleAddHardware = () => {
    if (!hwSerialNumber || hwSerialNumber.trim() === '') {
      setError('Serial number is required!');
      setTimeout(() => setError(''), 3000);
      return;
    }

    addHardwareMutation.mutate({
      name: hwName,
      brand: hwBrand,
      serial_number: hwSerialNumber,
      category: hwCategory
    });
  };

  // @booksy required
  const handleAddUser = () => {
    setEmailError('');

    if (!email.endsWith('@booksy.com')) {
      setEmailError('Invalid domain. Please use @booksy.com');
      return;
    }

    addUserMutation.mutate({ email, password, is_staff: isStaff });
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      {/* Add Hardware Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
            <Plus className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Add New Equipment</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Hardware Name</label>
            <input
              type="text"
              placeholder="e.g. MacBook Pro M3"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              value={hwName}
              onChange={(e) => setHwName(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Brand</label>
            <input
              type="text"
              placeholder="e.g. Apple"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              value={hwBrand}
              onChange={(e) => setHwBrand(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Serial Number</label>
            <input
              type="text"
              placeholder="e.g. SN123456789"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
              value={hwSerialNumber}
              onChange={(e) => setHwSerialNumber(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Category</label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium appearance-none"
              value={hwCategory}
              onChange={(e) => setHwCategory(e.target.value)}
            >
              <option value="laptop">Laptop</option>
              <option value="mobile">Mobile</option>
              <option value="tablet">Tablet</option>
              <option value="monitor">Monitor</option>
              <option value="accessory">Accessory</option>
            </select>
          </div>
          <button
            onClick={handleAddHardware}
            disabled={!hwName || !hwBrand || addHardwareMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-bold text-white shadow-sm shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {addHardwareMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Device
          </button>
        </div>
      </div>

      {/* Add User Form */}
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
            <UserPlus className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Create User Account</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Email</label>
            <input
              type="email"
              placeholder="e.g. john@booksy.com"
              className={cn(
                "w-full rounded-lg border bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-1 transition-all font-medium",
                emailError
                  ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                  : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
              )}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (emailError) setEmailError('');
              }}
            />
            {emailError && (
              <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500">
                {emailError}
              </p>
            )}
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-slate-100 bg-slate-50 p-3 transition-colors hover:bg-slate-100">
            <input
              type="checkbox"
              id="isStaff"
              className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
              checked={isStaff}
              onChange={(e) => setIsStaff(e.target.checked)}
            />
            <span className="text-sm font-semibold text-slate-700">Grant Administrator access</span>
          </label>
          <button
            onClick={handleAddUser}
            disabled={!email || !password || addUserMutation.isPending}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 py-2.5 text-sm font-bold text-white shadow-sm shadow-emerald-100 hover:bg-emerald-700 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {addUserMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Create User
          </button>
        </div>
      </div>

      {/* Simplified Feedback Toast */}
      {(success || error) && (
        <div className={cn(
          "fixed bottom-8 right-8 flex items-center gap-3 rounded-xl p-4 shadow-xl border animate-in slide-in-from-right-8 fade-in duration-300 z-50",
          success ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"
        )}>
          {success ? <CheckCircle2 className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          <span className="font-semibold text-sm">{success || error}</span>
        </div>
      )}
    </div>
  );
};