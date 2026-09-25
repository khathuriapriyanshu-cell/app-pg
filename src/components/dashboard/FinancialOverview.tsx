'use client';

import React from 'react';
import { IndianRupee, TrendingUp, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useDataStore } from '@/services/useStore';

export function FinancialOverview() {
  const { metrics } = useDataStore();

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            October 2026 Overview
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time automated financial & rent status
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200/60 rounded-xl text-emerald-800 text-xs font-bold">
          <TrendingUp className="w-4 h-4 text-emerald-600" />
          <span>{metrics.collectionRate}% Collected</span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Expected Rent */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Expected Rent</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900">
            ₹{metrics.expectedRent.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Total active tenant billings
          </p>
        </div>

        {/* Collected Rent (Green) */}
        <div className="bg-gradient-to-br from-emerald-500/10 via-white to-white p-4 sm:p-5 rounded-2xl border border-emerald-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-emerald-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Collected</span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-700">
            ₹{metrics.collectedRent.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">
            {metrics.paidCount} tenants paid in full
          </p>
        </div>

        {/* Pending Rent (Yellow) */}
        <div className="bg-gradient-to-br from-amber-500/10 via-white to-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-amber-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Due Soon</span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-700">
            ₹{metrics.pendingRent.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">
            {metrics.dueSoonCount} tenants upcoming
          </p>
        </div>

        {/* Overdue Rent (Red) */}
        <div className="bg-gradient-to-br from-rose-500/10 via-white to-white p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between text-rose-700 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Overdue</span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-rose-700">
            ₹{metrics.overdueRent.toLocaleString('en-IN')}
          </div>
          <p className="text-[11px] text-rose-600 font-medium mt-1">
            {metrics.overdueCount} tenants need follow-up
          </p>
        </div>
      </div>
    </div>
  );
}
