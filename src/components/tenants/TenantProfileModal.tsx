'use client';

import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  DoorOpen,
  Calendar,
  IndianRupee,
  Shield,
  Send,
  CreditCard,
  FileText,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Edit3,
} from 'lucide-react';
import { Tenant } from '@/types';
import { useDataStore } from '@/services/useStore';
import { SendReminderModal } from '../common/SendReminderModal';
import { TenantPaymentSimulationModal } from '../common/TenantPaymentSimulationModal';
import { ReceiptModal } from '../common/ReceiptModal';
import { EditTenantModal } from './EditTenantModal';

interface TenantProfileModalProps {
  isOpen: boolean;
  tenant: Tenant | null;
  onClose: () => void;
}

export function TenantProfileModal({ isOpen, tenant, onClose }: TenantProfileModalProps) {
  const { getRoomById, getBedById, getTenantCurrentRent, payments, receipts, rentRecords } =
    useDataStore();

  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [isPaySimOpen, setIsPaySimOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [selectedReceiptId, setSelectedReceiptId] = useState<string | null>(null);

  if (!isOpen || !tenant) return null;

  const room = getRoomById(tenant.roomId);
  const bed = getBedById(tenant.bedId);
  const currentRent = getTenantCurrentRent(tenant.id);
  const tenantPayments = payments.filter((p) => p.tenantId === tenant.id);
  const tenantReceipts = receipts.filter((r) => r.tenantId === tenant.id);

  // Calculate total paid across all recorded months
  const totalPaid = tenantPayments.reduce((acc, p) => acc + p.amount, 0) + (tenant.id === 'tenant-priyanshu' ? 24000 : 0);

  // Past payment mock history months
  const pastMonths = [
    { month: 'July 2026', amount: tenant.monthlyRent, status: 'PAID', date: '05 Jul 2026' },
    { month: 'August 2026', amount: tenant.monthlyRent, status: 'PAID', date: '05 Aug 2026' },
    { month: 'September 2026', amount: tenant.monthlyRent, status: 'PAID', date: '04 Sep 2026' },
  ];

  const currentStatus = currentRent?.status || 'PENDING';
  const selectedReceipt = receipts.find((r) => r.id === selectedReceiptId) || tenantReceipts[0] || null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Profile Top Banner */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-lg flex-shrink-0">
              {tenant.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-black">{tenant.name}</h3>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold ${
                    currentStatus === 'PAID'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : currentStatus === 'OVERDUE'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {currentStatus === 'OVERDUE'
                    ? `${currentRent?.daysOverdue}D Overdue`
                    : currentStatus}
                </span>

                <button
                  type="button"
                  onClick={() => setIsEditOpen(true)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white text-xs font-semibold transition-colors border border-slate-700 ml-auto sm:ml-2"
                  title="Edit student name & rent"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Rent</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300 mt-2">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  {tenant.phone}
                </span>
                {tenant.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    {tenant.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Metrics Bar inside Header */}
          <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-800 text-center">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Assigned Bed</p>
              <p className="text-sm font-extrabold text-white mt-0.5">
                Room {room?.roomNumber}-{bed?.bedNumber}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Monthly Rent</p>
              <p className="text-sm font-extrabold text-emerald-400 mt-0.5">
                ₹{tenant.monthlyRent.toLocaleString('en-IN')}
              </p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400">Rent Due Date</p>
              <p className="text-sm font-extrabold text-white mt-0.5">
                {tenant.dueDateDay}th of month
              </p>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Security Deposit & Operational Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>Security Deposit</span>
              </div>
              <p className="text-base font-extrabold text-slate-900">
                ₹{tenant.securityDeposit.toLocaleString('en-IN')}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                Status: {tenant.depositStatus}
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/70">
              <div className="flex items-center gap-1.5 text-slate-500 text-xs font-semibold mb-1">
                <Calendar className="w-3.5 h-3.5 text-indigo-600" />
                <span>Joining Date</span>
              </div>
              <p className="text-sm font-extrabold text-slate-900">{tenant.joiningDate}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">
                Emergency: {tenant.emergencyContact || 'None provided'}
              </p>
            </div>
          </div>

          {/* Action Trigger Row */}
          <div className="flex items-center gap-2">
            {currentRent && currentRent.status !== 'PAID' ? (
              <>
                <button
                  onClick={() => setIsReminderOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Reminder</span>
                </button>
                <button
                  onClick={() => setIsPaySimOpen(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Simulate Payment</span>
                </button>
              </>
            ) : (
              <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>October 2026 rent is fully settled</span>
                </div>
                {tenantReceipts.length > 0 && (
                  <button
                    onClick={() => setSelectedReceiptId(tenantReceipts[0].id)}
                    className="underline text-emerald-700 hover:text-emerald-900 font-bold"
                  >
                    View Receipt
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Payment History Ledger */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Payment History
              </h4>
              <span className="text-xs font-extrabold text-slate-800">
                Total Paid: ₹{totalPaid.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden">
              {/* Current Month */}
              {currentRent && (
                <div className="p-3 flex items-center justify-between bg-slate-50/60 text-xs">
                  <div>
                    <span className="font-bold text-slate-900">{currentRent.month}</span>
                    <span className="text-slate-400 ml-2">Due: {currentRent.dueDate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-slate-900">
                      ₹{currentRent.amount.toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        currentRent.status === 'PAID'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentRent.status === 'OVERDUE'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {currentRent.status}
                    </span>
                  </div>
                </div>
              )}

              {/* Past Months */}
              {pastMonths.map((pm, idx) => (
                <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-slate-50">
                  <div>
                    <span className="font-semibold text-slate-700">{pm.month}</span>
                    <span className="text-slate-400 ml-2">Paid on {pm.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      ₹{pm.amount.toLocaleString('en-IN')}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800">
                      PAID
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-modals */}
      <SendReminderModal
        isOpen={isReminderOpen}
        tenant={tenant}
        rentRecord={currentRent || null}
        onClose={() => setIsReminderOpen(false)}
      />

      <TenantPaymentSimulationModal
        isOpen={isPaySimOpen}
        tenant={tenant}
        rentRecord={currentRent || null}
        onClose={() => setIsPaySimOpen(false)}
      />

      <ReceiptModal
        isOpen={Boolean(selectedReceiptId)}
        receipt={selectedReceipt}
        onClose={() => setSelectedReceiptId(null)}
      />

      <EditTenantModal
        isOpen={isEditOpen}
        tenant={tenant}
        onClose={() => setIsEditOpen(false)}
      />
    </div>
  );
}
