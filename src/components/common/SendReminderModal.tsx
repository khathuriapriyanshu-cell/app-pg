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

  const { sendReminder, getRoomById, getBedById, getPGById, pg } = useDataStore();

  if (!isOpen || !tenant || !rentRecord) return null;

  const room = getRoomById(tenant.roomId);
  const bed = getBedById(tenant.bedId);
  const property = (tenant.pgId ? getPGById(tenant.pgId) : null) || pg;
  const pgName = property?.name || 'Sharma PG';
  const paymentLink = `https://app-pg.vercel.app/payments?id=${rentRecord.id}`;

  const messageText =
    rentRecord.status === 'OVERDUE'
      ? `Hi ${tenant.name},\n\nYour rent of ₹${rentRecord.amount.toLocaleString('en-IN')} for ${rentRecord.month} (Room ${room?.roomNumber}-${bed?.bedNumber}) at ${pgName} is OVERDUE by ${rentRecord.daysOverdue} day(s).\n\nPlease make the payment immediately via this link:\n${paymentLink}\n\nThank you,\n${pgName}`
      : `Hi ${tenant.name},\n\nYour rent of ₹${rentRecord.amount.toLocaleString('en-IN')} for ${rentRecord.month} (Room ${room?.roomNumber}-${bed?.bedNumber}) at ${pgName} is due on ${rentRecord.dueDate}.\n\nYou can make the payment conveniently here:\n${paymentLink}\n\nThank you,\n${pgName}`;

  const cleanPhone = tenant.phone.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone.startsWith('91') ? cleanPhone : '91' + cleanPhone}?text=${encodeURIComponent(messageText)}`;

  const handleSend = () => {
    setIsSending(true);
    setResultMsg(null);

    try {
      const res = sendReminder(tenant.id, rentRecord.id, channel);
      setIsSending(false);
      if (res.success) {
        setResultMsg({
          type: 'success',
          text: channel === 'WHATSAPP' ? 'Opening WhatsApp with pre-filled message...' : 'Opening SMS...'
        });

        // Open WhatsApp or SMS directly on phone/browser
        if (channel === 'WHATSAPP') {
          const opened = window.open(waUrl, '_blank');
          if (!opened || opened.closed || typeof opened.closed === 'undefined') {
            window.location.href = waUrl;
          }
        } else {
          const smsUrl = `sms:${cleanPhone}?body=${encodeURIComponent(messageText)}`;
          window.location.href = smsUrl;
        }

        setTimeout(() => {
          onClose();
          if (onSuccess) onSuccess();
        }, 1200);
      } else {
        setResultMsg({ type: 'error', text: res.message });
      }
    } catch {
      setIsSending(false);
      setResultMsg({ type: 'error', text: 'Failed to launch reminder application.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Send Rent Reminder</h3>
              <p className="text-xs text-slate-500">
                {tenant.name} · Room {room?.roomNumber}-{bed?.bedNumber} ({pgName})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto">
          {/* Tenant summary pill */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/80">
            <div>
              <p className="text-xs text-slate-500">Pending Amount</p>
              <p className="text-lg font-black text-slate-900">
                ₹{rentRecord.amount.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-right">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold inline-block ${
                  rentRecord.status === 'OVERDUE'
                    ? 'bg-rose-100 text-rose-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {rentRecord.status === 'OVERDUE'
                  ? `${rentRecord.daysOverdue} Days Overdue`
                  : `Due on ${rentRecord.dueDate}`}
              </span>
              <p className="text-xs text-slate-500 mt-1">{tenant.phone}</p>
            </div>
          </div>

          {/* Channel selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2">
              Select Delivery Channel
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setChannel('WHATSAPP')}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  channel === 'WHATSAPP'
                    ? 'border-emerald-500 bg-emerald-50/50 text-emerald-950 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <MessageCircle
                  className={`w-5 h-5 ${
                    channel === 'WHATSAPP' ? 'text-emerald-600' : 'text-slate-400'
                  }`}
                />
                <div className="text-left">
                  <p className="text-xs font-bold">WhatsApp</p>
                  <p className="text-[10px] text-slate-400">98% Open Rate</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setChannel('SMS')}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  channel === 'SMS'
                    ? 'border-indigo-500 bg-indigo-50/50 text-indigo-950 font-bold'
                    : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Smartphone
                  className={`w-5 h-5 ${
                    channel === 'SMS' ? 'text-indigo-600' : 'text-slate-400'
                  }`}
                />
                <div className="text-left">
                  <p className="text-xs font-bold">SMS Text</p>
                  <p className="text-[10px] text-slate-400">Standard GSM</p>
                </div>
              </button>
            </div>
          </div>

          {/* Message Preview */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Automated Template Preview</label>
              <span className="text-[11px] text-emerald-600 font-medium">Includes direct payment link</span>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
              {messageText}
            </div>
          </div>

          {/* Direct WhatsApp Action for Mobile */}
          {channel === 'WHATSAPP' && (
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-emerald-600" />
              <span>Open Pre-filled WhatsApp Chat Directly</span>
            </a>
          )}

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
            {isSending ? 'Opening App...' : channel === 'WHATSAPP' ? 'Open & Send WhatsApp' : 'Open & Send SMS'}
          </button>
        </div>
      </div>
    </div>
  );
}
