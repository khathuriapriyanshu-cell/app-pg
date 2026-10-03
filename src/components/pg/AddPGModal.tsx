'use client';

import React, { useState } from 'react';
import { X, Building2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { useDataStore } from '@/services/useStore';

interface AddPGModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AddPGModal({ isOpen, onClose, onSuccess }: AddPGModalProps) {
  const { addPG } = useDataStore();

  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [numberOfFloors, setNumberOfFloors] = useState('2');
  const [roomsPerFloor, setRoomsPerFloor] = useState('3');
  const [bedsPerRoom, setBedsPerRoom] = useState('2');
  const [upiId, setUpiId] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const totalCalculatedRooms = (Number(numberOfFloors) || 2) * (Number(roomsPerFloor) || 3);
  const totalCalculatedBeds = totalCalculatedRooms * (Number(bedsPerRoom) || 2);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError('Please enter a PG property name');
    if (!address.trim()) return setError('Please enter the address or location');

    setIsSubmitting(true);
    const res = addPG({
      name: name.trim(),
      address: address.trim(),
      numberOfFloors: Number(numberOfFloors) || 2,
      roomsPerFloor: Number(roomsPerFloor) || 3,
      bedsPerRoom: Number(bedsPerRoom) || 2,
      upiId: upiId.trim() || undefined,
      contactPhone: contactPhone.trim() || undefined,
    });

    setIsSubmitting(false);
    if (!res.success) {
      setError(res.error || 'Failed to create PG');
    } else {
      setName('');
      setAddress('');
      setUpiId('');
      setContactPhone('');
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
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Add New PG Property</h3>
              <p className="text-xs text-slate-400">Expand your property portfolio</p>
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

          {/* Name & Location */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              PG Property Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sharma Boys PG (Electronic City) or Sunrise Girls PG"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Address / Location *
            </label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 12th Cross, Phase 1, Electronic City, Bengaluru"
              className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Floors, Rooms, Beds */}
          <div className="p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-100 space-y-3">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-xs">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Automatic Room & Bed Generator</span>
            </div>
            
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Floors
                </label>
                <select
                  value={numberOfFloors}
                  onChange={(e) => setNumberOfFloors(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} {num === 1 ? 'Floor' : 'Floors'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Rooms / Floor
                </label>
                <select
                  value={roomsPerFloor}
                  onChange={(e) => setRoomsPerFloor(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <option key={num} value={num}>
                      {num} Rooms
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Beds / Room
                </label>
                <select
                  value={bedsPerRoom}
                  onChange={(e) => setBedsPerRoom(e.target.value)}
                  className="w-full text-xs px-2.5 py-2 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {[1, 2, 3, 4].map((num) => (
                    <option key={num} value={num}>
                      {num} Beds
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[11px] text-indigo-700 font-medium">
              Will automatically create <span className="font-bold">{totalCalculatedRooms} rooms</span> and <span className="font-bold">{totalCalculatedBeds} beds</span> ready for students.
            </p>
          </div>

          {/* Contact & UPI */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Contact Phone
              </label>
              <input
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                UPI ID for Rent
              </label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="e.g. sharmapg@upi"
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
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
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-200 transition-all flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Create PG & Initialize Beds</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
