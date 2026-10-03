'use client';

import React from 'react';
import Link from 'next/link';
import { UserPlus, Building2, Sparkles, Layers } from 'lucide-react';
import { useDataStore } from '@/services/useStore';

interface QuickActionsProps {
  onAddTenant: () => void;
  onAddPG: () => void;
  onManagePGs: () => void;
  onAddRoom?: () => void;
}

export function QuickActions({ onAddTenant, onAddPG, onManagePGs }: QuickActionsProps) {
  const { pgs } = useDataStore();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {/* 1. Add Student Name & Rent */}
      <button
        onClick={onAddTenant}
        className="flex items-center gap-2.5 p-3 rounded-2xl bg-white hover:bg-indigo-50/50 border border-slate-200/80 shadow-sm text-left transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 group-hover:bg-indigo-600 group-hover:text-white transition-colors shadow-sm">
          <UserPlus className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors">
            Add Student & Rent
          </p>
          <p className="text-[10px] text-slate-400">Fast name & rent entry</p>
        </div>
      </button>

      {/* 2. Add New PG */}
      <button
        onClick={onAddPG}
        className="flex items-center gap-2.5 p-3 rounded-2xl bg-white hover:bg-emerald-50/50 border border-slate-200/80 shadow-sm text-left transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-600 group-hover:text-white transition-colors shadow-sm">
          <Building2 className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">
            Add New PG
          </p>
          <p className="text-[10px] text-slate-400">New property & beds</p>
        </div>
      </button>

      {/* 3. Manage PGs */}
      <button
        onClick={onManagePGs}
        className="flex items-center gap-2.5 p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-sm text-left transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 group-hover:bg-amber-600 group-hover:text-white transition-colors shadow-sm">
          <Layers className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-slate-900 group-hover:text-amber-700 transition-colors">
            Switch / My PGs
          </p>
          <p className="text-[10px] text-slate-400">{pgs.length} Active properties</p>
        </div>
      </button>

      {/* 4. Autopilot Rules */}
      <Link
        href="/settings"
        className="flex items-center gap-2.5 p-3 rounded-2xl bg-white hover:bg-purple-50/50 border border-slate-200/80 shadow-sm text-left transition-all group"
      >
        <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0 group-hover:bg-purple-600 group-hover:text-white transition-colors shadow-sm">
          <Sparkles className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">
            Autopilot Rules
          </p>
          <p className="text-[10px] text-slate-400">5-stage reminder engine</p>
        </div>
      </Link>
    </div>
  );
}
