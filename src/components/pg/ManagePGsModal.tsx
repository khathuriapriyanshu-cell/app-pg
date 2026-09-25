'use client';

import React from 'react';
import { X, Building2, Plus, Check, MapPin, Users, IndianRupee, ArrowRight } from 'lucide-react';
import { useDataStore } from '@/services/useStore';
import { Bed } from '@/types';

interface ManagePGsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAddPG: () => void;
}

export function ManagePGsModal({ isOpen, onClose, onOpenAddPG }: ManagePGsModalProps) {
  const { pgs, activePgId, setActivePG, getMetrics, getBeds, getTenants } = useDataStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Your PG Properties</h3>
              <p className="text-xs text-slate-400">Manage all your hostels and branches</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-3.5">
          {/* Combined / All PGs Option */}
          <div
            onClick={() => {
              setActivePG('all');
              onClose();
            }}
            className={`p-4 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
              activePgId === 'all'
                ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-xs">
                ALL
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-slate-900">All PGs (Combined View)</h4>
                <p className="text-xs text-slate-500">
                  Consolidated financial & occupancy dashboard across {pgs.length} properties
                </p>
              </div>
            </div>
            {activePgId === 'all' && (
              <span className="p-1.5 rounded-full bg-indigo-600 text-white">
                <Check className="w-4 h-4" />
              </span>
            )}
          </div>

          <div className="pt-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
            Individual PG Properties ({pgs.length})
          </div>

          {/* Individual PGs List */}
          {pgs.map((property) => {
            const pgMetrics = getMetrics(property.id);
            const pgBeds = getBeds(property.id);
            const occupiedCount = pgBeds.filter((b: Bed) => b.status !== 'VACANT').length;
            const isSelected = activePgId === property.id;

            return (
              <div
                key={property.id}
                onClick={() => {
                  setActivePG(property.id);
                  onClose();
                }}
                className={`p-4 rounded-2xl border-2 cursor-pointer transition-all space-y-3 ${
                  isSelected
                    ? 'border-emerald-500 bg-emerald-50/30 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm flex-shrink-0 ${
                        isSelected
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-extrabold text-sm text-slate-900">
                          {property.name}
                        </h4>
                        {isSelected && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate max-w-xs">{property.address}</span>
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <span className="p-1 rounded-full bg-emerald-600 text-white flex-shrink-0">
                      <Check className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>

                {/* PG Stats Bar */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 text-center">
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Capacity</p>
                    <p className="text-xs font-bold text-slate-800 mt-0.5">
                      {occupiedCount} / {pgBeds.length} Beds
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Collected</p>
                    <p className="text-xs font-bold text-emerald-700 mt-0.5">
                      ₹{pgMetrics.collectedRent.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Outstanding</p>
                    <p className="text-xs font-bold text-rose-700 mt-0.5">
                      ₹{(pgMetrics.pendingRent + pgMetrics.overdueRent).toLocaleString('en-IN')}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer with Add New PG button */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 font-medium">
            Total {pgs.length} Properties
          </span>
          <button
            onClick={() => {
              onClose();
              onOpenAddPG();
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Another PG</span>
          </button>
        </div>
      </div>
    </div>
  );
}
