'use client';

import React from 'react';
import { X, Printer, CheckCircle2, Building2 } from 'lucide-react';
import { Receipt } from '@/types';
import { useDataStore } from '@/services/useStore';

interface ReceiptModalProps {
  isOpen: boolean;
  receipt: Receipt | null;
  onClose: () => void;
}

export function ReceiptModal({ isOpen, receipt, onClose }: ReceiptModalProps) {
  const { pg, getPGById, getTenantById, getRoomById, getBedById, payments } = useDataStore();

  if (!isOpen || !receipt) return null;

  const tenant = getTenantById(receipt.tenantId);
  const property = (tenant?.pgId ? getPGById(tenant.pgId) : null) || pg;
  const room = tenant ? getRoomById(tenant.roomId) : undefined;
  const bed = tenant ? getBedById(tenant.bedId) : undefined;
  const payment = payments.find((p) => p.id === receipt.paymentId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Actions header (hidden when printing) */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 bg-slate-50 print:hidden">
          <span className="text-xs font-semibold text-slate-500">Digital Rent Receipt</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-lg text-xs font-bold transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 sm:p-8 space-y-6 bg-white text-slate-900" id="printable-receipt">
          {/* Top Brand */}
          <div className="text-center pb-5 border-b border-dashed border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white mx-auto flex items-center justify-center font-bold mb-2 shadow-md shadow-indigo-100">
              <Building2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-black tracking-tight text-slate-900 uppercase">
              {property.name}
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed mt-0.5">
              {property.address}
            </p>
            <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200/60 rounded-full text-xs font-bold">
              <CheckCircle2 className="w-3.5 h-3.5" />
              VERIFIED PAYMENT RECEIPT
            </div>
          </div>

          {/* Key Receipt Details */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400 uppercase font-semibold text-[10px]">Receipt No.</p>
              <p className="font-mono font-bold text-slate-800">{receipt.receiptNumber}</p>
            </div>
            <div className="text-right">
              <p className="text-slate-400 uppercase font-semibold text-[10px]">Payment Date</p>
              <p className="font-semibold text-slate-800">
                {new Date(receipt.generatedAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </p>
            </div>
          </div>

          {/* Tenant Information Table */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2.5 border border-slate-100 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Tenant Name</span>
              <span className="font-bold text-slate-900">{tenant?.name || 'Tenant'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Room & Bed</span>
              <span className="font-semibold text-slate-800">
                Room {room?.roomNumber} · Bed {bed?.bedNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Month / Period</span>
              <span className="font-semibold text-slate-800">{receipt.month}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Payment Method</span>
              <span className="font-semibold text-slate-800">{payment?.paymentMethod || 'UPI'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Transaction ID</span>
              <span className="font-mono text-slate-700 text-[11px]">
                {payment?.transactionId || 'TXN-VERIFIED'}
              </span>
            </div>
          </div>

          {/* Amount Paid Big Display */}
          <div className="border-t-2 border-slate-900 pt-4 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase font-bold text-slate-500">Amount Received</p>
              <p className="text-[11px] text-emerald-600 font-medium">Status: PAID in full</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-slate-900">
                ₹{receipt.amount.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Receipt Footer */}
          <div className="pt-4 border-t border-dashed border-slate-200 text-center text-[10px] text-slate-400">
            <p>This is a computer-generated digital receipt and requires no physical signature.</p>
            <p className="mt-0.5">Powered by PG Rent Autopilot</p>
          </div>
        </div>
      </div>
    </div>
  );
}
