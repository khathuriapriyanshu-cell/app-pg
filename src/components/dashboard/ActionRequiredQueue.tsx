'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Send,
  CreditCard,
  CheckCircle2,
} from 'lucide-react';
import { Tenant, RentRecord } from '@/types';
import { useDataStore } from '@/services/useStore';
import { SendReminderModal } from '../common/SendReminderModal';
import { TenantPaymentSimulationModal } from '../common/TenantPaymentSimulationModal';

export function ActionRequiredQueue() {
  const { tenants, rentRecords, getRoomById, getBedById } = useDataStore();

  const [reminderModalData, setReminderModalData] = useState<{
    tenant: Tenant;
    rentRecord: RentRecord;
  } | null>(null);

  const [paymentSimData, setPaymentSimData] = useState<{
    tenant: Tenant;
    rentRecord: RentRecord;
  } | null>(null);

  // Filter pending or overdue rent records for October
  const actionableRecords = rentRecords
    .filter((r) => r.yearMonth === '2026-10' && r.status !== 'PAID')
    .sort((a, b) => {
      // Overdue first (highest days overdue), then pending
      if (a.status === 'OVERDUE' && b.status !== 'OVERDUE') return -1;
      if (b.status === 'OVERDUE' && a.status !== 'OVERDUE') return 1;
      return (b.daysOverdue || 0) - (a.daysOverdue || 0);
    });

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
              Action Required Today
            </h3>
            <p className="text-xs text-slate-500">
              {actionableRecords.length} tenant{actionableRecords.length === 1 ? '' : 's'} require follow-up
            </p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
          Autopilot Priority Queue
        </span>
      </div>

      {/* Queue items */}
      <div className="divide-y divide-slate-100">
        {actionableRecords.length === 0 ? (
          <div className="py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-base">You&apos;re All Caught Up!</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
              Zero pending or overdue rent records for this cycle. All tenant rents are collected in full.
            </p>
          </div>
        ) : (
          actionableRecords.map((rent) => {
            const tenant = tenants.find((t) => t.id === rent.tenantId);
            if (!tenant) return null;

            const room = getRoomById(tenant.roomId);
            const bed = getBedById(tenant.bedId);
            const isOverdue = rent.status === 'OVERDUE';

            return (
              <div
                key={rent.id}
                className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
              >
                {/* Left: Tenant and Status */}
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center font-extrabold text-sm flex-shrink-0 shadow-sm ${
                      isOverdue
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {tenant.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base">
                        {tenant.name}
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">
                        Room {room?.roomNumber}-{bed?.bedNumber}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 mt-1">
                      <span className="font-extrabold text-slate-900 text-sm">
                        ₹{rent.amount.toLocaleString('en-IN')}
                      </span>
                      <span className="text-slate-300">•</span>
                      {isOverdue ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md">
                          <AlertTriangle className="w-3 h-3" />
                          {rent.daysOverdue} days overdue
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3" />
                          Due on {rent.dueDate}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => setPaymentSimData({ tenant, rentRecord: rent })}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors"
                    title="Open tenant payment link simulation"
                  >
                    <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Pay Link</span>
                  </button>

                  <button
                    onClick={() => setReminderModalData({ tenant, rentRecord: rent })}
                    className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl shadow-sm transition-all ${
                      isOverdue
                        ? 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-200'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send Reminder</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modals */}
      <SendReminderModal
        isOpen={Boolean(reminderModalData)}
        tenant={reminderModalData?.tenant || null}
        rentRecord={reminderModalData?.rentRecord || null}
        onClose={() => setReminderModalData(null)}
      />

      <TenantPaymentSimulationModal
        isOpen={Boolean(paymentSimData)}
        tenant={paymentSimData?.tenant || null}
        rentRecord={paymentSimData?.rentRecord || null}
        onClose={() => setPaymentSimData(null)}
      />
    </div>
  );
}
