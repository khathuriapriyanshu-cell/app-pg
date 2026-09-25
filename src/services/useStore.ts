'use client';

import { useState, useEffect } from 'react';
import { store } from './storage';

export function useDataStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  return {
    pg: store.getPG(),
    pgs: store.getPGs(),
    activePgId: store.getActivePgId(),
    setActivePG: store.setActivePG.bind(store),
    addPG: store.addPG.bind(store),
    getPGById: store.getPGById.bind(store),
    floors: store.getFloors(),
    rooms: store.getRooms(),
    beds: store.getBeds(),
    tenants: store.getTenants(),
    allTenants: store.getAllTenants(),
    rentRecords: store.getRentRecords(),
    payments: store.getPayments(),
    receipts: store.getReceipts(),
    notifications: store.getNotifications(),
    settings: store.getSettings(),
    metrics: store.getMetrics(),
    // Methods
    sendReminder: store.sendReminder.bind(store),
    recordVerifiedPayment: store.recordVerifiedPayment.bind(store),
    addTenant: store.addTenant.bind(store),
    updateTenant: store.updateTenant.bind(store),
    addRoom: store.addRoom.bind(store),
    updateSettings: store.updateSettings.bind(store),
    resetToDefaults: store.resetToDefaults.bind(store),
    getTenantById: store.getTenantById.bind(store),
    getRentRecordById: store.getRentRecordById.bind(store),
    getTenantCurrentRent: store.getTenantCurrentRent.bind(store),
    getRoomById: store.getRoomById.bind(store),
    getBedById: store.getBedById.bind(store),
    getMetrics: store.getMetrics.bind(store),
    getBeds: store.getBeds.bind(store),
    getRooms: store.getRooms.bind(store),
    getTenants: store.getTenants.bind(store),
    getFloors: store.getFloors.bind(store),
  };
}
