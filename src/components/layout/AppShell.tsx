'use client';

import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { GlobalSearchModal } from '../common/GlobalSearchModal';
import { NotificationsModal } from '../common/NotificationsModal';
import { AddTenantModal } from '../tenants/AddTenantModal';
import { AddPGModal } from '../pg/AddPGModal';
import { ManagePGsModal } from '../pg/ManagePGsModal';
import { PWAProvider } from '../common/PWAProvider';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAddStudentOpen, setIsAddStudentOpen] = useState(false);
  const [isAddPGOpen, setIsAddPGOpen] = useState(false);
  const [isManagePGsOpen, setIsManagePGsOpen] = useState(false);

  return (
    <PWAProvider>
      <div className="min-h-screen flex bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Sidebar for Desktop */}
      <Sidebar
        onOpenAddStudent={() => setIsAddStudentOpen(true)}
        onOpenAddPG={() => setIsAddPGOpen(true)}
        onOpenManagePGs={() => setIsManagePGsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 pb-24 md:pb-6">
        {/* Top Header with Multi-PG Switcher and Add Student button */}
        <Header
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenAddStudent={() => setIsAddStudentOpen(true)}
          onOpenAddPG={() => setIsAddPGOpen(true)}
          onOpenManagePGs={() => setIsManagePGsOpen(true)}
        />

        {/* Page Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Bottom Nav for Mobile */}
        <BottomNav />
      </div>

      {/* Global Modals */}
      <GlobalSearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <NotificationsModal
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />

      <AddTenantModal
        isOpen={isAddStudentOpen}
        onClose={() => setIsAddStudentOpen(false)}
      />

      <AddPGModal
        isOpen={isAddPGOpen}
        onClose={() => setIsAddPGOpen(false)}
      />

      <ManagePGsModal
        isOpen={isManagePGsOpen}
        onClose={() => setIsManagePGsOpen(false)}
        onOpenAddPG={() => setIsAddPGOpen(true)}
      />
    </div>
  </PWAProvider>
);
}
