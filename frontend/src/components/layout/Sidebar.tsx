'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ShoppingCart, ShieldCheck, LogOut, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Hardware List', href: '/dashboard/list', icon: Package },
    { name: 'My Rentals', href: '/dashboard/rentals', icon: ShoppingCart },
  ];

  if (user?.is_staff) {
    navItems.push({ name: 'Admin Panel', href: '/dashboard/admin', icon: ShieldCheck });
  }

  return (
    <div className="flex h-screen w-64 flex-col bg-slate-900 text-slate-100 shadow-xl transition-all duration-300">
      <div className="flex h-16 items-center justify-center border-b border-slate-800 px-4">
        <LayoutDashboard className="mr-2 text-indigo-400" />
        <span className="text-xl font-bold tracking-tight">Hardware Manager</span>
      </div>

      <nav className="mt-6 flex-1 space-y-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center rounded-lg px-4 py-3 text-sm font-medium transition-all hover:bg-slate-800 hover:text-white",
                isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "text-slate-400"
              )}
            >
              <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-white" : "text-slate-500")} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-800 p-4">
        <div className="mb-4 flex items-center px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-500 text-xs font-bold text-white shadow-inner">
            {user?.username?.charAt(0).toUpperCase() || 'U'}
          </div>
          <div className="ml-3 overflow-hidden">
            <p className="truncate text-sm font-medium text-white">{user?.username || 'Guest'}</p>
            <p className="truncate text-xs text-slate-500">{user?.is_staff ? 'Administrator' : 'User'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex w-full items-center rounded-lg px-4 py-2 text-sm font-medium text-slate-400 transition-all hover:bg-slate-800 hover:text-red-400"
        >
          <LogOut className="mr-3 h-5 w-5" />
          Logout
        </button>
      </div>
    </div>
  );
};
