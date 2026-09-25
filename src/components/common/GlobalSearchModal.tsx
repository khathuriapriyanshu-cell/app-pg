'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Search, X, User, DoorOpen, IndianRupee, ArrowRight } from 'lucide-react';
import { useDataStore } from '@/services/useStore';
import { useRouter } from 'next/navigation';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTenant?: (tenantId: string) => void;
}

export function GlobalSearchModal({ isOpen, onClose, onSelectTenant }: GlobalSearchModalProps) {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const { tenants, rooms, rentRecords, getRoomById, getBedById } = useDataStore();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const cleanQuery = query.toLowerCase().trim();

  // Search Results
  const matchingTenants = cleanQuery
    ? tenants.filter(
        (t) =>
          t.name.toLowerCase().includes(cleanQuery) ||
          t.phone.includes(cleanQuery) ||
          (t.email && t.email.toLowerCase().includes(cleanQuery))
      )
    : [];

  const matchingRooms = cleanQuery
    ? rooms.filter((r) => r.roomNumber.toLowerCase().includes(cleanQuery))
    : [];

  const matchingAmounts = cleanQuery
    ? rentRecords.filter(
        (r) =>
          r.amount.toString().includes(cleanQuery) ||
          cleanQuery.replace(/[₹,]/g, '').trim() === r.amount.toString()
      )
    : [];

  const hasResults =
    matchingTenants.length > 0 || matchingRooms.length > 0 || matchingAmounts.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-100">
      <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100">
          <Search className="w-5 h-5 text-indigo-600 flex-shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by tenant name, room 203, or amount ₹8,000..."
            className="w-full text-sm sm:text-base text-slate-800 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-slate-400 hover:text-slate-600"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-xs text-slate-400 bg-slate-100 border border-slate-200 rounded font-mono">
              ESC
            </kbd>
          )}
        </div>

        {/* Results Body */}
        <div className="overflow-y-auto p-3 space-y-4 max-h-[60vh]">
          {!cleanQuery ? (
            <div className="py-8 text-center text-slate-400 text-xs sm:text-sm">
              <p>Type to search across tenants, rooms, and payments.</p>
              <div className="flex flex-wrap justify-center gap-2 mt-3">
                <button
                  onClick={() => setQuery('Priyanshu')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs"
                >
                  "Priyanshu"
                </button>
                <button
                  onClick={() => setQuery('203')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs"
                >
                  "203"
                </button>
                <button
                  onClick={() => setQuery('8000')}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs"
                >
                  "8000"
                </button>
              </div>
            </div>
          ) : !hasResults ? (
            <div className="py-8 text-center text-slate-400 text-xs sm:text-sm">
              No results found for <span className="font-semibold text-slate-600">"{query}"</span>
            </div>
          ) : (
            <>
              {/* Tenants */}
              {matchingTenants.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Tenants ({matchingTenants.length})
                  </h4>
                  <div className="space-y-1">
                    {matchingTenants.map((tenant) => {
                      const room = getRoomById(tenant.roomId);
                      const bed = getBedById(tenant.bedId);
                      return (
                        <div
                          key={tenant.id}
                          onClick={() => {
                            onClose();
                            if (onSelectTenant) onSelectTenant(tenant.id);
                            else router.push(`/tenants?id=${tenant.id}`);
                          }}
                          className="flex items-center justify-between p-2.5 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors group"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                              {tenant.name.charAt(0)}
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600">
                                {tenant.name}
                              </p>
                              <p className="text-xs text-slate-500">
                                Room {room?.roomNumber}-{bed?.bedNumber} · ₹{tenant.monthlyRent.toLocaleString('en-IN')}/mo
                              </p>
                            </div>
                          </div>
                          <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 transition-transform group-hover:translate-x-0.5" />
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Rooms */}
              {matchingRooms.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <DoorOpen className="w-3.5 h-3.5" /> Rooms ({matchingRooms.length})
                  </h4>
                  <div className="space-y-1">
                    {matchingRooms.map((room) => (
                      <div
                        key={room.id}
                        onClick={() => {
                          onClose();
                          router.push('/rooms');
                        }}
                        className="flex items-center justify-between p-2.5 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                            {room.roomNumber}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-slate-900 group-hover:text-indigo-600">
                              Room {room.roomNumber} ({room.type})
                            </p>
                            <p className="text-xs text-slate-500">{room.capacity} Bed Capacity</p>
                          </div>
                        </div>
                        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600" />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rent Records / Amounts */}
              {matchingAmounts.length > 0 && (
                <div>
                  <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-1.5 flex items-center gap-1.5">
                    <IndianRupee className="w-3.5 h-3.5" /> Payments with Amount ₹{query} ({matchingAmounts.length})
                  </h4>
                  <div className="space-y-1">
                    {matchingAmounts.map((rent) => {
                      const tenant = tenants.find((t) => t.id === rent.tenantId);
                      return (
                        <div
                          key={rent.id}
                          onClick={() => {
                            onClose();
                            router.push('/payments');
                          }}
                          className="flex items-center justify-between p-2.5 hover:bg-indigo-50 rounded-xl cursor-pointer transition-colors group"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              ₹{rent.amount.toLocaleString('en-IN')} — {tenant?.name || 'Tenant'}
                            </p>
                            <p className="text-xs text-slate-500">{rent.month} · Status: {rent.status}</p>
                          </div>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                              rent.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-700'
                                : rent.status === 'OVERDUE'
                                ? 'bg-rose-100 text-rose-700'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {rent.status}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
