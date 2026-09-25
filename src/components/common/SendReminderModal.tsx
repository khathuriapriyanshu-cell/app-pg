'use client';

import React, { useState } from 'react';
import { X, Send, MessageCircle, Smartphone, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';
import { Tenant, RentRecord } from '@/types';
import { useDataStore } from '@/services/useStore';

interface SendReminderModalProps {
  isOpen: boolean;
  tenant: Tenant | null;
  rentRecord: RentRecord | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function SendReminderModal({
  isOpen,
  tenant,
  rentRecord,
  onClose,
  onSuccess,
}: SendReminderModalProps) {
  const [channel, setChannel] = useState<'WHATSAPP' | 'SMS'>('WHATSAPP');
  const [isSending, setIsSending] = useState(false);
  const [resultMsg, setResultMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const { sendReminder, getRoomById, getBedById } = useDataStore();

  if (!isOpen || !tenant || !rentRecord) return null;

  const room = getRoomById(tenant.roomId);
  const bed = getBedById(tenant.bedId);
  const paymentLink = `https://sharmapg.com/pay/${rentRecord.id}`;

  const messageText =
    rentRecord.status === 'OVERDUE'
      ? `Hi ${tenant.name},\n\nYour rent of ₹${rentRecord.amount.toLocaleString('en-IN')} for ${rentRecord.month} (Room ${room?.roomNumber}-${bed?.bedNumber}) is OVERDUE by ${rentRecord.daysOverdue} day(s).\n\nPlease make the payment immediately via this link:\n${paymentLink}\n\nThank you,\nSharma PG`
      : `Hi ${tenant.name},\n\nYour rent of ₹${rentRecord.amount.toLocaleString('en-IN')} for ${rentRecord.month} (Room ${room?.roomNumber}-${bed?.bedNumber}) is due on ${rentRecord.dueDate}.\n\nYou can make the payment conveniently here:\n${paymentLink}\n\nThank you,\nSharma PG`;

  const handleSend = () => {
    setIsSending(true);
    setResultMsg(null);

    setTimeout(() => {
      const res = sendReminder(tenant.id, rentRecord.id, channel);
      setIsSending(false);
      if (res.success) {
        setResultMsg({ type: 'success', text: res.message });
        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1200);
      } else {
        setResultMsg({ type: 'error', text: res.message });
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-900">Send Rent Reminder</h3>
            <p className="text-xs text-slate-500">
              {tenant.name} · Room {room?.roomNumber}-{bed?.bedNumber}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4">
          {/* Status highlight */}
          <div
            className={`p-3 rounded-xl border flex items-center justify-between ${
              rentRecord.status === 'OVERDUE'
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider">
                {rentRecord.status === 'OVERDUE'
                  ? `Overdue by ${rentRecord.daysOverdue} Days`
                  : `Due Date: ${rentRecord.dueDate}`}
              </p>
              <p className="text-lg font-extrabold">₹{rentRecord.amount.toLocaleString('en-IN')}</p>
            </div>
            <span className="text-xs px-2.5 py-1 bg-white rounded-lg font-bold shadow-sm">
              {rentRecord.month}
            </span>
          </div>

          {/* Channel selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
              Dispatch Channel
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setChannel('WHATSAPP')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  channel === 'WHATSAPP'
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                WhatsApp ({tenant.phone})
              </button>
              <button
                type="button"
                onClick={() => setChannel('SMS')}
                className={`flex items-center justify-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                  channel === 'SMS'
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-800 shadow-sm'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4 text-indigo-600" />
                SMS ({tenant.phone})
              </button>
            </div>
          </div>

          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Message Preview
              </label>
              <span className="text-[11px] text-emerald-600 font-medium">Includes direct payment link</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
              {messageText}
            </div>
          </div>

          {/* Result Banner */}
          {resultMsg && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                resultMsg.type === 'success'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {resultMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              )}
              <span>{resultMsg.text}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-200/60"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={isSending}
            className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-200 transition-all"
          >
            <Send className="w-3.5 h-3.5" />
            {isSending ? 'Sending Reminder...' : `Send via ${channel}`}
          </button>
        </div>
      </div>
    </div>
  );
}
