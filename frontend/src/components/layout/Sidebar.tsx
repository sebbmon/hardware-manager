'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ShoppingCart,
  ShieldCheck,
  LogOut,
  Package,
  X
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { cn } from '@/lib/utils';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
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
    <>
      {/* Mobile Overlay (no blur) */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-slate-900/20 transition-opacity duration-300 md:hidden",
          isOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className={cn(
        "fixed left-0 right-0 z-50 flex flex-col bg-white border-b border-slate-200 text-slate-900 transition-all duration-300 ease-in-out md:static md:h-screen md:w-64 md:border-r md:translate-y-0",
        // Desktop
        "md:flex md:border-b-0",
        // Mobile (Top Dropdown)
        "top-16 md:top-0",
        isOpen ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0 md:opacity-100"
      )}>
        {/* Desktop Header/Logo (hidden on mobile drawer) */}
        <div className="hidden h-16 items-center border-b border-slate-100 px-6 md:flex">
          <LayoutDashboard className="mr-2 text-indigo-600" />
          <span className="text-xl font-bold tracking-tight text-slate-900">Hardware Hub</span>
        </div>

        {/* Navigation */}
        <nav className="mt-3 flex-1 space-y-1 px-3 mb-3 md:mb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center rounded-lg px-4 py-2.5 text-sm font-medium transition-all outline-none",
                  isActive
                    ? "bg-indigo-50 text-indigo-600"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                )}
              >
                <Icon className={cn("mr-3 h-5 w-5", isActive ? "text-indigo-600" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile & Logout */}
        <div className="border-t border-slate-100 p-4 bg-slate-50/50 md:bg-transparent">
          <div className="mb-4 flex items-center px-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="ml-3 overflow-hidden">
              <p className="truncate text-sm font-bold text-slate-900">{user?.email || 'Guest'}</p>
              <p className="truncate text-[10px] text-slate-500 uppercase tracking-widest font-bold">{user?.is_staff ? 'Administrator' : 'User'}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center rounded-lg px-4 py-2 text-sm font-medium text-slate-500 transition-all outline-none hover:bg-red-50 hover:text-red-600 focus:bg-red-50 focus:text-red-600"
          >
            <LogOut className="mr-3 h-5 w-5" />
            Logout
          </button>
        </div>
      </div>
    </>
  );
};
