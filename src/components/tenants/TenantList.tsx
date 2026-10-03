'use client';

import React, { useState } from 'react';
import {
  Users,
  Search,
  UserPlus,
  Send,
  CreditCard,
  ChevronRight,
  Edit3,
} from 'lucide-react';
import { Tenant, RentRecord } from '@/types';
import { useDataStore } from '@/services/useStore';
import { TenantProfileModal } from './TenantProfileModal';
import { AddTenantModal } from './AddTenantModal';
import { EditTenantModal } from './EditTenantModal';
import { SendReminderModal } from '../common/SendReminderModal';
import { TenantPaymentSimulationModal } from '../common/TenantPaymentSimulationModal';

export function TenantList() {
  const { tenants, pgs, activePgId, setActivePG, getTenantCurrentRent, getRoomById, getBedById, getPGById } = useDataStore();

  const [activeFilter, setActiveFilter] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      return params.get('filter') || 'ALL';
    }
    return 'ALL';
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTenant, setSelectedTenant] = useState<Tenant | null>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tId = params.get('id');
      if (tId) {
        return tenants.find((t) => t.id === tId) || null;
      }
    }
    return null;
  });
  const [editingTenant, setEditingTenant] = useState<Tenant | null>(null);
  const [isAddTenantOpen, setIsAddTenantOpen] = useState(false);

  const [reminderModalData, setReminderModalData] = useState<{
    tenant: Tenant;
    rentRecord: RentRecord;
  } | null>(null);

  const [paySimData, setPaySimData] = useState<{
    tenant: Tenant;
    rentRecord: RentRecord;
  } | null>(null);

  // Filter and search
  const filteredTenants = tenants.filter((tenant) => {
    const currentRent = getTenantCurrentRent(tenant.id);
    const rentStatus = currentRent?.status || 'PENDING';

    // Status filter
    if (activeFilter === 'OVERDUE' && rentStatus !== 'OVERDUE') return false;
    if (activeFilter === 'PAID' && rentStatus !== 'PAID') return false;
    if (activeFilter === 'DUE_SOON' && rentStatus !== 'PENDING') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const room = getRoomById(tenant.roomId);
      const pg = getPGById(tenant.pgId);
      const matchName = tenant.name.toLowerCase().includes(q);
      const matchPhone = tenant.phone.includes(q);
      const matchRoom = room?.roomNumber.includes(q);
      const matchRent = tenant.monthlyRent.toString().includes(q);
      const matchPg = pg?.name.toLowerCase().includes(q);
      return matchName || matchPhone || matchRoom || matchRent || matchPg;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Students & Tenants
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {tenants.length} students enrolled · Auto rent calculation & reminders
          </p>
        </div>

        <button
          onClick={() => setIsAddTenantOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Student & Rent</span>
        </button>
      </div>

      {/* PG Filter Pills */}
      {pgs.length > 1 && (
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
            PG:
          </span>
          <button
            onClick={() => setActivePG('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              activePgId === 'all'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            All PGs
          </button>
          {pgs.map((property) => (
            <button
              key={property.id}
              onClick={() => setActivePG(property.id)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                activePgId === property.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {property.name.split('(')[0].trim()}
            </button>
          ))}
        </div>
      )}

      {/* Controls: Search + Filter Pills */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-2.5">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by student name, rent, phone, room, or PG..."
              className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'OVERDUE', label: 'Overdue' },
              { id: 'DUE_SOON', label: 'Due Soon' },
              { id: 'PAID', label: 'Paid' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFilter(f.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  activeFilter === f.id
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tenants List */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm divide-y divide-slate-100 overflow-hidden">
        {filteredTenants.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm font-semibold">No students found</p>
            <p className="text-xs text-slate-400 mt-0.5">Try clearing your search or adding a new student.</p>
          </div>
        ) : (
          filteredTenants.map((tenant) => {
            const currentRent = getTenantCurrentRent(tenant.id);
            const room = getRoomById(tenant.roomId);
            const bed = getBedById(tenant.bedId);
            const property = getPGById(tenant.pgId);
            const rentStatus = currentRent?.status || 'PENDING';

            return (
              <div
                key={tenant.id}
                className="p-3.5 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 transition-colors"
              >
                {/* Info row */}
                <div
                  onClick={() => setSelectedTenant(tenant)}
                  className="flex items-start gap-3.5 cursor-pointer flex-1 min-w-0"
                >
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm flex-shrink-0">
                    {tenant.name.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-extrabold text-sm sm:text-base text-slate-900 hover:text-indigo-600 transition-colors truncate">
                        {tenant.name}
                      </h4>
                      <span
                        className={`text-[10px] sm:text-xs px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          rentStatus === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800'
                            : rentStatus === 'OVERDUE'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {rentStatus === 'OVERDUE'
                          ? `${currentRent?.daysOverdue}D Overdue`
                          : rentStatus}
                      </span>
                      {activePgId === 'all' && property && (
                        <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold truncate max-w-[150px]">
                          {property.name.split('(')[0].trim()}
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
                      <span>
                        Room {room?.roomNumber}-{bed?.bedNumber}
                      </span>
                      <span>•</span>
                      <span>{tenant.phone}</span>
                      <span>•</span>
                      <span className="font-black text-slate-900 text-sm">
                        ₹{tenant.monthlyRent.toLocaleString('en-IN')}/mo
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 sm:gap-2 self-end sm:self-center">
                  {/* Edit Rent button */}
                  <button
                    onClick={() => setEditingTenant(tenant)}
                    className="p-2 sm:px-2.5 sm:py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors flex items-center gap-1"
                    title="Edit student name & rent"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Edit Rent</span>
                  </button>

                  {currentRent && currentRent.status !== 'PAID' && (
                    <>
                      <button
                        onClick={() => setPaySimData({ tenant, rentRecord: currentRent })}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                        title="Simulate tenant payment"
                      >
                        <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="hidden sm:inline">Pay</span>
                      </button>

                      <button
                        onClick={() =>
                          setReminderModalData({ tenant, rentRecord: currentRent })
                        }
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold text-white flex items-center gap-1 transition-all ${
                          rentStatus === 'OVERDUE'
                            ? 'bg-rose-600 hover:bg-rose-700'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                        }`}
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Remind</span>
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setSelectedTenant(tenant)}
                    className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
                    title="View Profile"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <TenantProfileModal
        isOpen={Boolean(selectedTenant)}
        tenant={selectedTenant}
        onClose={() => setSelectedTenant(null)}
      />

      <EditTenantModal
        isOpen={Boolean(editingTenant)}
        tenant={editingTenant}
        onClose={() => setEditingTenant(null)}
      />

      <AddTenantModal
        isOpen={isAddTenantOpen}
        onClose={() => setIsAddTenantOpen(false)}
      />

      <SendReminderModal
        isOpen={Boolean(reminderModalData)}
        tenant={reminderModalData?.tenant || null}
        rentRecord={reminderModalData?.rentRecord || null}
        onClose={() => setReminderModalData(null)}
      />

      <TenantPaymentSimulationModal
        isOpen={Boolean(paySimData)}
        tenant={paySimData?.tenant || null}
        rentRecord={paySimData?.rentRecord || null}
        onClose={() => setPaySimData(null)}
      />
    </div>
  );
}
