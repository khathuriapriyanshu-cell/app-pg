'use client';

import React from 'react';
import { Bed } from '@/types';
import { useDataStore } from '@/services/useStore';

interface BedCardProps {
  bed: Bed;
  onSelectBed: (bed: Bed) => void;
}

export function BedCard({ bed, onSelectBed }: BedCardProps) {
  const { getTenantById } = useDataStore();
  const tenant = bed.tenantId ? getTenantById(bed.tenantId) : null;

  // Status styling per Section 12:
  // GREEN: Occupied + rent paid
  // YELLOW: Rent due soon
  // RED: Rent overdue
  // GREY: Vacant
  let statusBadge = {
    bg: 'bg-slate-100 hover:bg-slate-200/80 border-slate-200 text-slate-700',
    indicator: 'bg-slate-400',
    label: 'Vacant',
    subtext: 'Tap to assign',
  };

  if (bed.status === 'OCCUPIED_PAID') {
    statusBadge = {
      bg: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-950',
      indicator: 'bg-emerald-500',
      label: 'Paid',
      subtext: tenant?.name || 'Occupied',
    };
  } else if (bed.status === 'OCCUPIED_DUE_SOON') {
    statusBadge = {
      bg: 'bg-amber-50 hover:bg-amber-100/80 border-amber-200 text-amber-950',
      indicator: 'bg-amber-400',
      label: 'Due Soon',
      subtext: tenant?.name || 'Occupied',
    };
  } else if (bed.status === 'OCCUPIED_OVERDUE') {
    statusBadge = {
      bg: 'bg-rose-50 hover:bg-rose-100/80 border-rose-200 text-rose-950',
      indicator: 'bg-rose-500',
      label: 'Overdue',
      subtext: tenant?.name || 'Occupied',
    };
  }

  return (
    <button
      type="button"
      onClick={() => onSelectBed(bed)}
      className={`p-3 rounded-2xl border text-left transition-all relative group flex flex-col justify-between ${statusBadge.bg}`}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <div className="flex items-center gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${statusBadge.indicator}`} />
          <span className="font-extrabold text-sm">Bed {bed.bedNumber}</span>
        </div>
        <span
          className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
            bed.status === 'VACANT'
              ? 'bg-slate-200 text-slate-600'
              : bed.status === 'OCCUPIED_PAID'
              ? 'bg-emerald-200 text-emerald-800'
              : bed.status === 'OCCUPIED_OVERDUE'
              ? 'bg-rose-200 text-rose-800'
              : 'bg-amber-200 text-amber-800'
          }`}
        >
          {statusBadge.label}
        </span>
      </div>

      <div className="min-w-0">
        <p className="text-xs font-semibold truncate text-slate-800">
          {statusBadge.subtext}
        </p>
        {tenant && (
          <p className="text-[10px] text-slate-500">
            ₹{tenant.monthlyRent.toLocaleString('en-IN')}/mo
          </p>
        )}
      </div>
    </button>
  );
}
