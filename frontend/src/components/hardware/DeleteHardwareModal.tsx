'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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

interface DeleteHardwareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  hardware: Hardware | null;
  isDeleting: boolean;
}

const DeleteHardwareModal = ({ isOpen, onClose, onConfirm, hardware, isDeleting }: DeleteHardwareModalProps) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!isOpen || !hardware || !mounted) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={isDeleting ? undefined : onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-red-100 px-6 py-4 bg-red-50/50">
          <h2 className="text-lg font-bold text-red-600 flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Delete Equipment
          </h2>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-slate-600 font-medium mb-1">
            Are you sure you want to delete <strong className="text-slate-900">{hardware.name}</strong>?
          </p>
          <p className="text-xs text-slate-500 mb-6 font-medium">
            This action cannot be undone. All data associated with this equipment will be permanently removed.
          </p>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-red-200 hover:bg-red-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isDeleting ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Confirm
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default DeleteHardwareModal;
