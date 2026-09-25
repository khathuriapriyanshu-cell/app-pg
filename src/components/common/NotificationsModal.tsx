'use client';

import React from 'react';
import { X, Bell, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { useDataStore } from '@/services/useStore';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const { notifications } = useDataStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Autopilot Notifications Log</h3>
              <p className="text-xs text-slate-500">Live feed of automated reminders & receipts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200/60"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="p-4 overflow-y-auto space-y-3 divide-y divide-slate-100">
          {notifications.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notification activity yet.</p>
            </div>
          ) : (
            notifications.map((item) => (
              <div key={item.id} className="pt-3 first:pt-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-semibold ${
                        item.type.includes('OVERDUE')
                          ? 'bg-rose-100 text-rose-700'
                          : item.type === 'PAYMENT_RECEIVED'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {item.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs font-semibold text-slate-800">{item.tenantName}</span>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {new Date(item.sentDate || item.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono leading-relaxed mt-1">
                  {item.message}
                </p>

                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Sent via {item.channel} to {item.phone}
                  </span>
                  {item.status === 'SENT' ? (
                    <span className="text-emerald-600 font-medium">Delivered</span>
                  ) : (
                    <span className="text-slate-400">Queued</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <AlertCircle className="w-4 h-4 text-slate-400" />
            External messaging in simulated mode
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-slate-200 text-slate-800 font-medium hover:bg-slate-300"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
