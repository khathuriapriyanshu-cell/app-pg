'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Save,
  Play,
  RotateCcw,
} from 'lucide-react';
import { useDataStore } from '@/services/useStore';

export function ReminderConfig() {
  const { pg, settings, updateSettings, resetToDefaults } = useDataStore();

  const [rules, setRules] = useState(settings.rules);
  const [autoEnabled, setAutoEnabled] = useState(settings.autoRemindersEnabled);
  const [upiId, setUpiId] = useState(settings.upiId || 'sharmapg@upi');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [simRunSuccess, setSimRunSuccess] = useState<string | null>(null);

  const handleToggleRule = (ruleId: string) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled: !r.enabled } : r))
    );
  };

  const handleSave = () => {
    updateSettings({
      autoRemindersEnabled: autoEnabled,
      rules,
      upiId,
    });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleRunAutopilotNow = () => {
    setSimRunSuccess('Autopilot cycle executed: 3 overdue reminders queued, 0 duplicates detected.');
    setTimeout(() => setSimRunSuccess(null), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Rent Autopilot Engine
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Automated recurring reminders, due-date detection, and duplicate prevention
          </p>
        </div>

        <button
          onClick={handleRunAutopilotNow}
          className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-200 transition-all self-start sm:self-auto"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run Autopilot Check Now</span>
        </button>
      </div>

      {simRunSuccess && (
        <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{simRunSuccess}</span>
        </div>
      )}

      {/* Master Toggle Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              Master Autopilot Status
            </h3>
            <p className="text-xs text-slate-500">
              When enabled, reminders are dispatched automatically according to configured rules
            </p>
          </div>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={autoEnabled}
            onChange={(e) => setAutoEnabled(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
        </label>
      </div>

      {/* 5-Stage Reminder Rules */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
              Default 5-Stage Reminder Schedule
            </h3>
            <p className="text-xs text-slate-500">
              Configure each milestone independently. Future reminders automatically cease when rent is paid.
            </p>
          </div>
          <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700">
            Idempotent Rules
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {rules.map((rule, idx) => (
            <div
              key={rule.id}
              className="py-3.5 flex items-center justify-between gap-4 first:pt-0 last:pb-0"
            >
              <div className="flex items-start gap-3">
                <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900">{rule.title}</h4>
                  <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                    {rule.description}
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={rule.enabled}
                  onChange={() => handleToggleRule(rule.id)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* PG & Payment Configuration */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm space-y-4">
        <div className="border-b border-slate-100 pb-3">
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
            PG Profile & Payment Destination
          </h3>
          <p className="text-xs text-slate-500">
            UPI ID embedded into simulated tenant payment links
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              PG Property Name
            </label>
            <input
              type="text"
              readOnly
              value={pg.name}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Registered UPI ID for Rent
            </label>
            <input
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              placeholder="e.g. yourpg@upi"
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>
        </div>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-2 text-xs text-slate-500">
          <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>
            Duplicate Prevention Active: Autopilot will never send multiple reminder alerts to the same tenant on the same day.
          </span>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => {
            if (confirm('Reset to demo defaults?')) {
              resetToDefaults();
            }
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset Defaults</span>
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all"
        >
          <Save className="w-4 h-4" />
          <span>{saveSuccess ? 'Settings Saved!' : 'Save Autopilot Settings'}</span>
        </button>
      </div>
    </div>
  );
}
