'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Save, Box, Tag, Hash, Layout } from 'lucide-react';
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

interface EditHardwareModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: number, updatedData: Partial<Hardware>) => Promise<void>;
  hardware: Hardware | null;
  isSaving: boolean;
}

const CATEGORY_OPTIONS = [
  { value: 'laptop', label: 'Laptop' },
  { value: 'mobile', label: 'Mobile' },
  { value: 'tablet', label: 'Tablet' },
  { value: 'monitor', label: 'Monitor' },
  { value: 'accessory', label: 'Accessory' },
];

const EditHardwareModal = ({ isOpen, onClose, onSave, hardware, isSaving }: EditHardwareModalProps) => {
  const [formData, setFormData] = useState<Partial<Hardware>>({
    name: '',
    brand: '',
    serial_number: '',
    category: 'laptop',
  });

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (hardware) {
      setFormData({
        name: hardware.name,
        brand: hardware.brand,
        serial_number: hardware.serial_number || '',
        category: hardware.category || 'laptop',
      });
    }
  }, [hardware]);

  if (!isOpen || !hardware || !mounted) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSave(hardware.id, formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl transition-all animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layout className="h-5 w-5 text-indigo-500" />
            Edit Hardware
          </h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Name Field */}
          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Box className="h-3.5 w-3.5" /> Hardware Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. MacBook Pro 14"
            />
          </div>

          {/* Brand Field */}
          <div className="space-y-1.5">
            <label htmlFor="brand" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-3.5 w-3.5" /> Brand
            </label>
            <input
              id="brand"
              name="brand"
              type="text"
              required
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium"
              value={formData.brand}
              onChange={handleChange}
              placeholder="e.g. Apple"
            />
          </div>

          {/* Serial Number Field */}
          <div className="space-y-1.5">
            <label htmlFor="serial_number" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Hash className="h-3.5 w-3.5" /> Serial Number
            </label>
            <input
              id="serial_number"
              name="serial_number"
              type="text"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
              value={formData.serial_number}
              onChange={handleChange}
              placeholder="e.g. SN123456789"
            />
          </div>

          {/* Category Field */}
          <div className="space-y-1.5">
            <label htmlFor="category" className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
              <Tag className="h-3.5 w-3.5" /> Category
            </label>
            <select
              id="category"
              name="category"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500 transition-all font-medium appearance-none"
              value={formData.category}
              onChange={handleChange}
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-50 transition-all active:scale-[0.98]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

export default EditHardwareModal;
