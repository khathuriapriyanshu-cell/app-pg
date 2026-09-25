'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  DoorOpen,
  Users,
  CreditCard,
  Settings,
  ShieldCheck,
  RefreshCw,
  Building2,
  Plus,
  UserPlus,
  Check,
} from 'lucide-react';
import { useDataStore } from '@/services/useStore';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

interface SidebarProps {
  onOpenAddStudent?: () => void;
  onOpenAddPG?: () => void;
  onOpenManagePGs?: () => void;
}

export function Sidebar({ onOpenAddStudent, onOpenAddPG, onOpenManagePGs }: SidebarProps) {
  const pathname = usePathname();
  const { metrics, resetToDefaults, pgs, activePgId, setActivePG } = useDataStore();

  const navItems: NavItem[] = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Rooms & Beds', href: '/rooms', icon: DoorOpen, badge: `${metrics.vacantBedsCount} vacant` },
    { name: 'Students / Tenants', href: '/tenants', icon: Users, badge: metrics.overdueCount > 0 ? `${metrics.overdueCount} due` : undefined },
    { name: 'Payments & Receipts', href: '/payments', icon: CreditCard },
    { name: 'Autopilot Settings', href: '/settings', icon: Settings },
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-white min-h-screen p-4 border-r border-slate-800 flex-shrink-0">
      {/* Brand Header */}
      <div className="flex items-center gap-3 px-2 py-3 mb-4 border-b border-slate-800">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-emerald-400 flex items-center justify-center font-black text-white shadow-lg">
          PG
        </div>
        <div>
          <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Rent Autopilot
          </span>
          <p className="text-[11px] text-emerald-400 font-medium">Never Chase Rent</p>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="space-y-1.5 mb-5">
        <button
          onClick={onOpenAddStudent}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Student & Rent</span>
        </button>

        <button
          onClick={onOpenAddPG}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition-all border border-slate-700/60"
        >
          <Plus className="w-3.5 h-3.5 text-indigo-400" />
          <span>Add New PG</span>
        </button>
      </div>

      {/* Nav List */}
      <nav className="space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/90 text-white shadow-md shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : item.badge.toString().includes('due')
                      ? 'bg-rose-500/20 text-rose-300'
                      : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Properties List in Sidebar */}
      <div className="mt-5 pt-4 border-t border-slate-800 flex-1">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>My PGs ({pgs.length})</span>
          </span>
          <button
            onClick={onOpenManagePGs}
            className="text-[10px] text-indigo-400 hover:text-indigo-300 font-semibold"
          >
            Manage
          </button>
        </div>

        <div className="space-y-1 max-h-36 overflow-y-auto">
          {pgs.map((property) => {
            const isSelected = activePgId === property.id;
            return (
              <button
                key={property.id}
                type="button"
                onClick={() => setActivePG(property.id)}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left text-xs transition-colors ${
                  isSelected
                    ? 'bg-slate-800 text-emerald-300 font-bold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <span className="truncate pr-1">{property.name}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Autopilot Status Card */}
      <div className="mt-auto pt-3 border-t border-slate-800 space-y-2">
        <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/50">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-semibold text-slate-200">Autopilot Active</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-snug">
            Automating rent, due dates, & 5-tier reminders.
          </p>
        </div>

        <button
          onClick={() => {
            if (confirm('Reset to default sample data for testing?')) {
              resetToDefaults();
            }
          }}
          className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          title="Reset to fresh demo data"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Demo Data</span>
        </button>
      </div>
    </aside>
  );
}
