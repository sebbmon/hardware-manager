'use client';

import { useState, useEffect } from 'react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { Menu, LayoutDashboard } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden relative">
      {/* Sidebar Component with mobile logic */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
      />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header (Top bar) */}
        <header className="relative z-[60] flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6 md:hidden">
          <div className="flex items-center">
            <LayoutDashboard className="mr-2 text-indigo-600" />
            <span className="text-xl font-bold font-black tracking-tight text-slate-900">Hardware Hub</span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={cn(
              "rounded-md p-1.5 transition-all outline-none",
              isSidebarOpen ? "bg-slate-100 text-indigo-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        {/* Scrollable Children */}
        <main className="flex-1 overflow-y-scroll p-4 md:p-8 relative">
          <div className="relative z-10 mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
