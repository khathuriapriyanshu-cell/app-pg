'use client';

import React, { useState } from 'react';
import { X, UserPlus, AlertCircle, CheckCircle2, Building2, Sparkles } from 'lucide-react';
import { useDataStore } from '@/services/useStore';
import { Room, Bed } from '@/types';

interface AddTenantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddTenantModal({ isOpen, onClose, onSuccess }: AddTenantModalProps) {
  const { pgs, activePgId, getRooms, getBeds, addTenant } = useDataStore();

  const [selectedPgId, setSelectedPgId] = useState(
    activePgId !== 'all' ? activePgId : pgs[0]?.id || 'pg-1'
  );
  const [name, setName] = useState('');
  const [monthlyRent, setMonthlyRent] = useState('8000');
  const [phone, setPhone] = useState('');
  const [assignmentMode, setAssignmentMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [selectedBedId, setSelectedBedId] = useState('');
  const [securityDeposit, setSecurityDeposit] = useState('8000');
  const [dueDateDay, setDueDateDay] = useState('5');
  const [joiningDate, setJoiningDate] = useState('2026-10-01');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const pgRooms = getRooms(selectedPgId);
  const pgBeds = getBeds(selectedPgId);
  const vacantBedsInPg = pgBeds.filter((b: Bed) => b.status === 'VACANT');

  const availableBedsForRoom = selectedRoomId
    ? pgBeds.filter((b: Bed) => b.roomId === selectedRoomId && b.status === 'VACANT')
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError('Please enter student/tenant name');
    const rentNum = Number(monthlyRent);
    if (!rentNum || rentNum <= 0) return setError('Please enter a valid monthly rent amount');

    if (assignmentMode === 'MANUAL') {
      if (!selectedRoomId) return setError('Please select a room');
      if (!selectedBedId) return setError('Please select a vacant bed');
    }

    setIsSubmitting(true);
    const res = addTenant({
      name: name.trim(),
      monthlyRent: rentNum,
      pgId: selectedPgId,
      roomId: assignmentMode === 'MANUAL' ? selectedRoomId : undefined,
      bedId: assignmentMode === 'MANUAL' ? selectedBedId : undefined,
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      securityDeposit: Number(securityDeposit) || rentNum,
      dueDateDay: Number(dueDateDay) || 5,
      joiningDate,
      notes: notes.trim() || undefined,
    });

    setIsSubmitting(false);
    if (!res.success) {
      setError(res.error || 'Failed to add student');
    } else {
      setName('');
      setPhone('');
      setEmail('');
      setNotes('');
      onClose();
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Add Student / Tenant</h3>
              <p className="text-xs text-slate-400">Set student name, monthly rent & bed</p>
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
        <form onSubmit={handleSubmit} className="overflow-y-auto p-5 sm:p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Target PG Selection (if multiple PGs) */}
          {pgs.length > 1 && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                <span>Select PG Property *</span>
              </label>
              <select
                value={selectedPgId}
                onChange={(e) => {
                  setSelectedPgId(e.target.value);
                  setSelectedRoomId('');
                  setSelectedBedId('');
                }}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
              >
                {pgs.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.address})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Student Name & Monthly Rent (High Visibility) */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                Student Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Aryan Kumar or Sneha Sharma"
                className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-slate-800 uppercase tracking-wider mb-1">
                Monthly Rent Amount (₹) *
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-bold text-base">
                  ₹
                </span>
                <input
                  type="number"
                  required
                  value={monthlyRent}
                  onChange={(e) => {
                    setMonthlyRent(e.target.value);
                    if (!securityDeposit || securityDeposit === monthlyRent) {
                      setSecurityDeposit(e.target.value);
                    }
                  }}
                  placeholder="8000"
                  className="w-full pl-8 pr-3.5 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white font-black text-slate-900"
                />
              </div>
            </div>
          </div>

          {/* Room & Bed Allocation Mode */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              Room & Bed Assignment
            </label>
            <div className="grid grid-cols-2 gap-2 mb-2">
              <button
                type="button"
                onClick={() => setAssignmentMode('AUTO')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                  assignmentMode === 'AUTO'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span>Auto-Assign Vacant Bed</span>
              </button>
              <button
                type="button"
                onClick={() => setAssignmentMode('MANUAL')}
                className={`flex items-center justify-center gap-1.5 p-2.5 rounded-xl text-xs font-bold border transition-all ${
                  assignmentMode === 'MANUAL'
                    ? 'border-indigo-600 bg-indigo-50 text-indigo-900 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span>Manual Pick Room/Bed</span>
              </button>
            </div>

            {assignmentMode === 'AUTO' ? (
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 flex items-center justify-between">
                <span>
                  Available Vacant Beds in PG: <strong className="text-slate-900">{vacantBedsInPg.length}</strong>
                </span>
                <span className="text-[11px] text-emerald-600 font-semibold">
                  {vacantBedsInPg.length > 0 ? 'Instant Placement Ready' : 'Will auto-expand capacity'}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2.5 pt-1">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Room *
                  </label>
                  <select
                    value={selectedRoomId}
                    onChange={(e) => {
                      setSelectedRoomId(e.target.value);
                      setSelectedBedId('');
                    }}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">-- Choose Room --</option>
                    {pgRooms.map((room: Room) => {
                      const vacantCount = pgBeds.filter(
                        (b: Bed) => b.roomId === room.id && b.status === 'VACANT'
                      ).length;
                      return (
                        <option key={room.id} value={room.id}>
                          Room {room.roomNumber} ({vacantCount} Vacant)
                        </option>
                      );
                    })}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Bed *
                  </label>
                  <select
                    disabled={!selectedRoomId}
                    value={selectedBedId}
                    onChange={(e) => setSelectedBedId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-100"
                  >
                    <option value="">-- Choose Bed --</option>
                    {availableBedsForRoom.map((bed: Bed) => (
                      <option key={bed.id} value={bed.id}>
                        Bed {bed.bedNumber} (Vacant)
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Phone and Due Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Phone Number (WhatsApp)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+91 98765 12345"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Rent Due Day
              </label>
              <select
                value={dueDateDay}
                onChange={(e) => setDueDateDay(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {[1, 5, 10, 15, 20, 25].map((d) => (
                  <option key={d} value={d}>
                    {d}th of every month
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Security Deposit & Joining Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Security Deposit (₹)
              </label>
              <input
                type="number"
                value={securityDeposit}
                onChange={(e) => setSecurityDeposit(e.target.value)}
                placeholder="e.g. 10000"
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Joining Date
              </label>
              <input
                type="date"
                value={joiningDate}
                onChange={(e) => setJoiningDate(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Notes (College / Course / Work)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. 2nd Year Engineering Student"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
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
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Save & Onboard Student</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
