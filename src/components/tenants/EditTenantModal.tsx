'use client';

import React, { useState, useEffect } from 'react';
import { X, UserCheck, IndianRupee, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Tenant } from '@/types';
import { useDataStore } from '@/services/useStore';

interface EditTenantModalProps {
  isOpen: boolean;
  tenant: Tenant | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function EditTenantModal({ isOpen, tenant, onClose, onSuccess }: EditTenantModalProps) {
  const { updateTenant, getRoomById, getBedById } = useDataStore();

  const [name, setName] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('');
  const [phone, setPhone] = useState('');
  const [dueDateDay, setDueDateDay] = useState('5');
  const [securityDeposit, setSecurityDeposit] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (tenant) {
      setName(tenant.name);
      setMonthlyRent(tenant.monthlyRent.toString());
      setPhone(tenant.phone);
      setDueDateDay(tenant.dueDateDay.toString());
      setSecurityDeposit(tenant.securityDeposit.toString());
      setError(null);
      setIsSaved(false);
    }
  }, [tenant]);

  if (!isOpen || !tenant) return null;

  const room = getRoomById(tenant.roomId);
  const bed = getBedById(tenant.bedId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError('Please enter student name');
    const parsedRent = Number(monthlyRent);
    if (!parsedRent || parsedRent <= 0) return setError('Please enter a valid monthly rent');

    const res = updateTenant(tenant.id, {
      name: name.trim(),
      monthlyRent: parsedRent,
      phone: phone.trim() || tenant.phone,
      dueDateDay: Number(dueDateDay) || 5,
      securityDeposit: Number(securityDeposit) || 0,
    });

    if (!res.success) {
      setError(res.error || 'Failed to update student');
    } else {
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Edit Student & Rent</h3>
              <p className="text-xs text-slate-400">
                Room {room?.roomNumber}-{bed?.bedNumber}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {isSaved && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>Student details & rent updated successfully!</span>
            </div>
          )}

          {/* Student Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Student / Tenant Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
            />
          </div>

          {/* Monthly Rent */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Monthly Rent Amount (₹) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">
                ₹
              </span>
              <input
                type="number"
                required
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(e.target.value)}
                className="w-full pl-8 pr-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-extrabold text-slate-900"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Changes will immediately update the active billing cycle.
            </p>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Phone / WhatsApp
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Due date */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rent Due Day
              </label>
              <select
                value={dueDateDay}
                onChange={(e) => setDueDateDay(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[1, 5, 10, 15, 20, 25].map((d) => (
                  <option key={d} value={d}>
                    {d}th of month
                  </option>
                ))}
              </select>
            </div>

            {/* Deposit */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Deposit (₹)
              </label>
              <input
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                className="w-full text-xs sm:text-sm px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Footer */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
