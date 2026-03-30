'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Lock, AtSign as Email, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [domainError, setDomainError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setDomainError('');

    // domain validation
    if (!email.endsWith('@booksy.com')) {
      setDomainError('Invalid domain. Please use @booksy.com');
      return;
    }

    setIsLoading(true);

    try {
      await login({ email, password });
      window.location.href = '/dashboard/list';
    } catch (err: any) {
      // Wyciągamy dane z odpowiedzi
      const errorData = err.response?.data;

      // Szukamy błędu w "detail", w "non_field_errors", albo w "email"
      const errorMessage =
        errorData?.detail ||
        (errorData?.non_field_errors && errorData.non_field_errors[0]) ||
        (errorData?.email && errorData.email[0]) ||
        'Invalid username or password.';

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
        <div className="text-center mb-10">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-100">
            <Lock className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-slate-900">
            Welcome back
          </h2>
          <p className="mt-2 text-sm text-slate-500 font-bold uppercase tracking-widest">
            Hardware Management System
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                Email (company domain only)
              </label>
              <div className="relative">
                <Email className={cn(
                  "absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 transition-colors",
                  domainError ? "text-red-400" : "text-slate-400"
                )} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (domainError) setDomainError('');
                  }}
                  className={cn(
                    "block w-full rounded-xl border bg-white py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all",
                    domainError
                      ? "border-red-300 focus:border-red-500 focus:ring-red-50"
                      : "border-slate-200 focus:border-indigo-500 focus:ring-indigo-50"
                  )}
                  placeholder="john@booksy.com"
                />
              </div>
              {domainError && (
                <p className="mt-1.5 ml-1 text-xs font-semibold text-red-500">
                  {domainError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5 ml-1">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border border-slate-200 bg-white py-3 pl-12 pr-4 text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-50 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <p>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="group relative flex w-full justify-center rounded-xl bg-indigo-600 py-3 text-sm font-bold text-white shadow-md shadow-indigo-100 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'Login'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};