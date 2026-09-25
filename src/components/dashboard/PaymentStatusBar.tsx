'use client';

import React from 'react';
import Link from 'next/link';
import { useDataStore } from '@/services/useStore';

export function PaymentStatusBar() {
  const { metrics } = useDataStore();
  const totalSlots = metrics.totalBedsCount;

  const paidPct = totalSlots > 0 ? (metrics.paidCount / totalSlots) * 100 : 0;
  const dueSoonPct = totalSlots > 0 ? (metrics.dueSoonCount / totalSlots) * 100 : 0;
  const overduePct = totalSlots > 0 ? (metrics.overdueCount / totalSlots) * 100 : 0;
  const vacantPct = totalSlots > 0 ? (metrics.vacantBedsCount / totalSlots) * 100 : 0;

  return (
    <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Occupancy & Payment Status
        </h3>
        <span className="text-xs font-semibold text-slate-500">
          {totalSlots} Total Beds in PG
        </span>
      </div>

      {/* Visual Multi-Segment Status Bar */}
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex shadow-inner">
        <div
          style={{ width: `${paidPct}%` }}
          className="bg-emerald-500 transition-all duration-500"
          title={`Paid: ${metrics.paidCount} beds`}
        />
        <div
          style={{ width: `${dueSoonPct}%` }}
          className="bg-amber-400 transition-all duration-500"
          title={`Due Soon: ${metrics.dueSoonCount} beds`}
        />
        <div
          style={{ width: `${overduePct}%` }}
          className="bg-rose-500 transition-all duration-500"
          title={`Overdue: ${metrics.overdueCount} beds`}
        />
        <div
          style={{ width: `${vacantPct}%` }}
          className="bg-slate-300 transition-all duration-500"
          title={`Vacant: ${metrics.vacantBedsCount} beds`}
        />
      </div>

      {/* Badges / Legend Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
        <Link
          href="/tenants?filter=PAID"
          className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50/70 hover:bg-emerald-100/70 border border-emerald-100 transition-colors"
        >
          <div className="w-3 h-3 rounded-full bg-emerald-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-extrabold text-emerald-900 text-sm leading-tight">{metrics.paidCount}</p>
            <p className="text-[11px] text-emerald-700">Paid Tenants</p>
          </div>
        </Link>

        <Link
          href="/tenants?filter=DUE_SOON"
          className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-50/70 hover:bg-amber-100/70 border border-amber-100 transition-colors"
        >
          <div className="w-3 h-3 rounded-full bg-amber-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-extrabold text-amber-900 text-sm leading-tight">{metrics.dueSoonCount}</p>
            <p className="text-[11px] text-amber-700">Due Soon</p>
          </div>
        </Link>

        <Link
          href="/tenants?filter=OVERDUE"
          className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-50/70 hover:bg-rose-100/70 border border-rose-100 transition-colors"
        >
          <div className="w-3 h-3 rounded-full bg-rose-500 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-extrabold text-rose-900 text-sm leading-tight">{metrics.overdueCount}</p>
            <p className="text-[11px] text-rose-700">Overdue Rent</p>
          </div>
        </Link>

        <Link
          href="/rooms"
          className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100/70 hover:bg-slate-200/70 border border-slate-200 transition-colors"
        >
          <div className="w-3 h-3 rounded-full bg-slate-400 flex-shrink-0" />
          <div className="min-w-0">
            <p className="font-extrabold text-slate-800 text-sm leading-tight">{metrics.vacantBedsCount}</p>
            <p className="text-[11px] text-slate-500">Vacant Beds</p>
          </div>
        </Link>
      </div>
    </div>
  );
}
