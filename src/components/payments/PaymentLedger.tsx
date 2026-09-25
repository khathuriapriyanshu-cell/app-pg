'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  Search,
  Filter,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  ExternalLink,
} from 'lucide-react';
import { useDataStore } from '@/services/useStore';
import { Receipt, RentRecord, Tenant } from '@/types';
import { ReceiptModal } from '../common/ReceiptModal';
import { TenantPaymentSimulationModal } from '../common/TenantPaymentSimulationModal';

export function PaymentLedger() {
  const { rentRecords, tenants, payments, receipts, pgs, activePgId, setActivePG, getRoomById, getBedById } = useDataStore();

  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING' | 'OVERDUE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [paySimData, setPaySimData] = useState<{ tenant: Tenant; rentRecord: RentRecord } | null>(
    null
  );

  // Filter records
  const filteredRentRecords = rentRecords.filter((record) => {
    if (statusFilter !== 'ALL' && record.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const tenant = tenants.find((t) => t.id === record.tenantId);
      const room = tenant ? getRoomById(tenant.roomId) : null;
      const matchName = tenant?.name.toLowerCase().includes(q);
      const matchRoom = room?.roomNumber.includes(q);
      const matchAmount = record.amount.toString().includes(q);
      return matchName || matchRoom || matchAmount;
    }

    return true;
  });

  const handleOpenReceipt = (record: RentRecord) => {
    const receipt = receipts.find((r) => r.rentRecordId === record.id);
    if (receipt) {
      setSelectedReceipt(receipt);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Payments Ledger & History
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Authoritative rent collection records & verified digital receipts
          </p>
        </div>
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by tenant name, room number, or amount..."
            className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['ALL', 'PAID', 'PENDING', 'OVERDUE'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === s
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {s === 'ALL' ? 'All Records' : s}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table (Desktop & Mobile-friendly) */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Tenant / Room</th>
                <th className="py-3.5 px-4">Month</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Due Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Transaction / Method</th>
                <th className="py-3.5 px-4 text-right">Receipt / Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredRentRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    No payment records match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredRentRecords.map((record) => {
                  const tenant = tenants.find((t) => t.id === record.tenantId);
                  const room = tenant ? getRoomById(tenant.roomId) : null;
                  const bed = tenant ? getBedById(tenant.bedId) : null;
                  const payment = payments.find((p) => p.id === record.paymentId);
                  const hasReceipt = receipts.some((r) => r.rentRecordId === record.id);

                  return (
                    <tr key={record.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Tenant & Room */}
                      <td className="py-3.5 px-4">
                        <span className="font-bold text-slate-900 block">{tenant?.name || 'Tenant'}</span>
                        <span className="text-[11px] text-slate-400">
                          Room {room?.roomNumber}-{bed?.bedNumber}
                        </span>
                      </td>

                      {/* Month */}
                      <td className="py-3.5 px-4 font-semibold text-slate-800">{record.month}</td>

                      {/* Amount */}
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">
                        ₹{record.amount.toLocaleString('en-IN')}
                      </td>

                      {/* Due Date */}
                      <td className="py-3.5 px-4 text-slate-600">{record.dueDate}</td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-bold ${
                            record.status === 'PAID'
                              ? 'bg-emerald-100 text-emerald-800'
                              : record.status === 'OVERDUE'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {record.status === 'PAID' && <CheckCircle2 className="w-3 h-3" />}
                          {record.status === 'OVERDUE' && <AlertCircle className="w-3 h-3" />}
                          {record.status === 'PENDING' && <Clock className="w-3 h-3" />}
                          {record.status === 'OVERDUE'
                            ? `${record.daysOverdue}D Overdue`
                            : record.status}
                        </span>
                      </td>

                      {/* Method / Transaction */}
                      <td className="py-3.5 px-4">
                        {payment ? (
                          <div>
                            <span className="font-semibold text-slate-800 block text-xs">
                              {payment.paymentMethod}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400">
                              {payment.transactionId}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Awaiting Payment</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        {record.status === 'PAID' && hasReceipt ? (
                          <button
                            onClick={() => handleOpenReceipt(record)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-bold transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Receipt</span>
                          </button>
                        ) : (
                          <button
                            onClick={() =>
                              tenant && setPaySimData({ tenant, rentRecord: record })
                            }
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition-colors"
                            title="Simulate tenant payment link"
                          >
                            <CreditCard className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Pay Link</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ReceiptModal
        isOpen={Boolean(selectedReceipt)}
        receipt={selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
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
