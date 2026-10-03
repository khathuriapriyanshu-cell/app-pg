'use client';

import React, { useState } from 'react';
import { FinancialOverview } from '@/components/dashboard/FinancialOverview';
import { PaymentStatusBar } from '@/components/dashboard/PaymentStatusBar';
import { ActionRequiredQueue } from '@/components/dashboard/ActionRequiredQueue';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { AddTenantModal } from '@/components/tenants/AddTenantModal';
import { AddRoomModal } from '@/components/rooms/AddRoomModal';
import { AddPGModal } from '@/components/pg/AddPGModal';
import { ManagePGsModal } from '@/components/pg/ManagePGsModal';
import { useDataStore } from '@/services/useStore';
import { PG } from '@/types';
import { Building2, Plus } from 'lucide-react';

export default function DashboardPage() {
  const { pgs, activePgId, setActivePG } = useDataStore();

  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);
  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddPGOpen, setIsAddPGOpen] = useState(false);
  const [isManagePGsOpen, setIsManagePGsOpen] = useState(false);

  return (
    <div className="space-y-5">
      {/* Property Switcher Pills Bar */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 scrollbar-none">
        <div className="flex items-center gap-1.5 min-w-max">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Building2 className="w-3.5 h-3.5 text-indigo-600" />
            <span>Active PG:</span>
          </span>

          {/* Combined pill */}
          <button
            onClick={() => setActivePG('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              activePgId === 'all'
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-200'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All PGs ({pgs.length})
          </button>

          {/* Individual PG pills */}
          {pgs.map((property: PG) => (
            <button
              key={property.id}
              onClick={() => setActivePG(property.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activePgId === property.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {property.name.split('(')[0].trim()}
            </button>
          ))}

          {/* + Add PG Pill */}
          <button
            onClick={() => setIsAddPGOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add PG</span>
          </button>
        </div>
      </div>

      {/* 30-Second Financial Snapshot */}
      <FinancialOverview />

      {/* Quick Action Shortcuts */}
      <QuickActions
        onAddTenant={() => setIsAddTenantOpen(true)}
        onAddPG={() => setIsAddPGOpen(true)}
        onManagePGs={() => setIsManagePGsOpen(true)}
        onAddRoom={() => setIsAddRoomOpen(true)}
      />

      {/* Occupancy and Payment Status Bar */}
      <PaymentStatusBar />

      {/* Priority Action Required Queue */}
      <ActionRequiredQueue />

      {/* Modals */}
      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
      />

      <AddRoomModal
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
      />

      <AddPGModal
        isOpen={isAddPGOpen}
        onClose={() => setIsAddPGOpen(false)}
      />

      <ManagePGsModal
        isOpen={isManagePGsOpen}
        onClose={() => setIsManagePGsOpen(false)}
        onOpenAddPG={() => setIsAddPGOpen(true)}
      />
    </div>
  );
}
