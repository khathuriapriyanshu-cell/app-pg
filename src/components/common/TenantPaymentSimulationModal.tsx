'use client';

import React, { useState } from 'react';
import { X, ShieldCheck, CheckCircle2, QrCode, ArrowRight, Loader2, Sparkles, Building2 } from 'lucide-react';
import { RentRecord, Tenant } from '@/types';
import { useDataStore } from '@/services/useStore';

interface TenantPaymentSimulationModalProps {
  isOpen: boolean;
  rentRecord: RentRecord | null;
  tenant: Tenant | null;
  onClose: () => void;
  onPaymentSuccess?: () => void;
}

export function TenantPaymentSimulationModal({
  isOpen,
  rentRecord,
  tenant,
  onClose,
  onPaymentSuccess,
}: TenantPaymentSimulationModalProps) {
  const [method, setMethod] = useState<'UPI' | 'NET_BANKING' | 'DEBIT_CARD'>('UPI');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [txnDetails, setTxnDetails] = useState<{ txnId: string; receiptNo: string } | null>(null);

  const { pg, recordVerifiedPayment, getRoomById, getBedById } = useDataStore();

  if (!isOpen || !rentRecord || !tenant) return null;

  const room = getRoomById(tenant.roomId);
  const bed = getBedById(tenant.bedId);

  const handlePay = () => {
    setIsProcessing(true);
    // Simulate payment provider gateway verification (Razorpay/UPI)
    setTimeout(() => {
      const txnId = `TXN-UPI-${Math.floor(10000000 + Math.random() * 90000000)}`;
      const res = recordVerifiedPayment(rentRecord.id, method, txnId);

      setIsProcessing(false);
      if (res.success && res.receipt) {
        setIsSuccess(true);
        setTxnDetails({
          txnId,
          receiptNo: res.receipt.receiptNumber,
        });
        if (onPaymentSuccess) onPaymentSuccess();
      }
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col">
        {/* Banner */}
        <div className="bg-slate-900 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full text-slate-400 hover:text-white bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] text-emerald-400 uppercase tracking-wider font-bold">
                Tenant Payment Portal
              </p>
              <h3 className="font-extrabold text-sm">{pg.name}</h3>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-800 flex items-baseline justify-between">
            <span className="text-xs text-slate-400">{rentRecord.month} Rent</span>
            <span className="text-2xl font-black text-white">
              ₹{rentRecord.amount.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {isSuccess ? (
            <div className="text-center py-6 space-y-3 animate-in zoom-in-95 duration-200">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center shadow-lg shadow-emerald-50">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h4 className="font-extrabold text-base text-slate-900">Payment Verified & Complete!</h4>
                <p className="text-xs text-slate-500 mt-1">
                  Transaction {txnDetails?.txnId} verified by payment provider.
                </p>
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-left">
                  <p className="text-slate-500">Digital Receipt Generated:</p>
                  <p className="font-mono font-bold text-slate-800">{txnDetails?.receiptNo}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-full mt-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all"
              >
                Close & View Dashboard
              </button>
            </div>
          ) : (
            <>
              {/* Tenant info summary */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tenant:</span>
                  <span className="font-bold text-slate-800">{tenant.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Room:</span>
                  <span className="font-semibold text-slate-700">
                    Room {room?.roomNumber} (Bed {bed?.bedNumber})
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Due Date:</span>
                  <span className="font-semibold text-slate-700">{rentRecord.dueDate}</span>
                </div>
              </div>

              {/* Payment Method selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  Select Payment Method
                </label>
                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => setMethod('UPI')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                      method === 'UPI'
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <QrCode className="w-4 h-4 text-indigo-600" />
                      <span>Instant UPI / QR / GooglePay / PhonePe</span>
                    </div>
                    {method === 'UPI' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => setMethod('NET_BANKING')}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all ${
                      method === 'NET_BANKING'
                        ? 'border-indigo-600 bg-indigo-50/60 text-indigo-900 shadow-sm'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Building2 className="w-4 h-4 text-slate-600" />
                      <span>Net Banking (HDFC, SBI, ICICI, etc.)</span>
                    </div>
                    {method === 'NET_BANKING' && <CheckCircle2 className="w-4 h-4 text-indigo-600" />}
                  </button>
                </div>
              </div>

              {/* Security info */}
              <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl text-[11px] text-emerald-800 border border-emerald-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>256-bit encrypted bank verification</span>
              </div>

              {/* Action Button */}
              <button
                type="button"
                onClick={handlePay}
                disabled={isProcessing}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 transition-all"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Verifying with Bank...
                  </>
                ) : (
                  <>
                    <span>Pay ₹{rentRecord.amount.toLocaleString('en-IN')} Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
