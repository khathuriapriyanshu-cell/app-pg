'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Building2,
  ChevronDown,
  Plus,
  UserPlus,
  Check,
} from 'lucide-react';
import { useDataStore } from '@/services/useStore';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenAddStudent: () => void;
  onOpenAddPG: () => void;
  onOpenManagePGs: () => void;
}

export function Header({
  onOpenSearch,
  onOpenNotifications,
  onOpenAddStudent,
  onOpenAddPG,
  onOpenManagePGs,
}: HeaderProps) {
  const { pg, pgs, activePgId, setActivePG, metrics, notifications } = useDataStore();
  const unreadCount = notifications.filter((n) => n.status === 'SENT').length;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 py-2.5 sm:px-6 safe-top">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* PG Selector & Identity */}
        <div className="relative min-w-0" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 sm:gap-3 p-1.5 -ml-1.5 rounded-2xl hover:bg-slate-100 transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold shadow-md shadow-indigo-100 flex-shrink-0 group-hover:scale-105 transition-transform">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="min-w-0 pr-1">
              <div className="flex items-center gap-1.5">
                <h1 className="text-sm sm:text-base font-extrabold text-slate-900 truncate max-w-[140px] sm:max-w-[240px] md:max-w-xs">
                  {pg.name}
                </h1>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition-colors flex-shrink-0" />
              </div>
              <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5">
                <span>
                  {metrics.totalBedsCount - metrics.vacantBedsCount}/{metrics.totalBedsCount} Beds Occupied
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-indigo-600 font-semibold">{pgs.length} PGs</span>
              </p>
            </div>
          </button>

          {/* PG Switcher Dropdown Popover */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200/80 p-2 z-50 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between">
                <span>Switch Property ({pgs.length})</span>
                <button
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenManagePGs();
                  }}
                  className="text-indigo-600 hover:text-indigo-800 text-[11px] font-semibold"
                >
                  Manage All
                </button>
              </div>

              {/* Combined View */}
              <button
                type="button"
                onClick={() => {
                  setActivePG('all');
                  setIsDropdownOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition-all ${
                  activePgId === 'all'
                    ? 'bg-indigo-50 text-indigo-900 font-bold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-[10px]">
                    ALL
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold">All PGs (Combined View)</p>
                    <p className="text-[10px] text-slate-400">Total portfolio overview</p>
                  </div>
                </div>
                {activePgId === 'all' && <Check className="w-4 h-4 text-indigo-600" />}
              </button>

              <div className="my-1.5 border-t border-slate-100" />

              {/* Individual PGs */}
              <div className="space-y-1 max-h-56 overflow-y-auto">
                {pgs.map((property) => {
                  const isSelected = activePgId === property.id;
                  return (
                    <button
                      key={property.id}
                      type="button"
                      onClick={() => {
                        setActivePG(property.id);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left text-xs transition-all ${
                        isSelected
                          ? 'bg-emerald-50 text-emerald-950 font-bold'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      <div className="min-w-0 pr-2">
                        <p className="font-bold truncate text-slate-900">{property.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{property.address}</p>
                      </div>
                      {isSelected && <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 pt-2 border-t border-slate-100 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    onOpenAddPG();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New PG Property</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Global Actions Bar: Quick Add Student + Search + Notifications */}
        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          {/* Prominent "+ Add Student" button */}
          <button
            onClick={onOpenAddStudent}
            className="flex items-center gap-1.5 px-3 py-2 sm:px-4 sm:py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-100 transition-all active:scale-95"
            title="Add a student and configure rent"
            aria-label="Add a student and configure rent"
          >
            <UserPlus className="w-4 h-4" />
            <span className="hidden xs:inline sm:inline">Add Student</span>
          </button>

          {/* "+ Add PG" button (desktop) */}
          <button
            onClick={onOpenAddPG}
            className="hidden lg:flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
            title="Add a new PG property"
            aria-label="Add a new PG property"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>Add PG</span>
          </button>

          {/* Global Search */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200/80 text-slate-500 hover:text-slate-800 p-2 sm:px-3 sm:py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors border border-slate-200/60"
            title="Search tenants, rooms, or amounts"
            aria-label="Search tenants, rooms, or amounts"
          >
            <Search className="w-4 h-4 text-slate-400" />
            <span className="hidden md:inline">Search...</span>
            <kbd className="hidden xl:inline-flex items-center px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-white border border-slate-200 rounded">
              ⌘K
            </kbd>
          </button>

          {/* Notifications Bell */}
          <button
            onClick={onOpenNotifications}
            className="relative p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 transition-colors"
            title="Notification Center"
            aria-label={`Notification Center (${unreadCount} unread)`}
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
